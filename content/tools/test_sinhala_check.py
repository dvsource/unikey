"""Offline tests. Run: python3 -B -m unittest discover -s content/tools."""
import argparse
from collections import Counter
import json
from pathlib import Path
import runpy
import subprocess
import tempfile
import unittest

tool = runpy.run_path(str(Path(__file__).with_name("sinhala-check.py")))
Pair, inspect_pair = tool["Pair"], tool["inspect_pair"]

def check(en, si, field="/text/si"):
    return {kind for kind,_ in inspect_pair(Pair(field,en,si))}

class Checker(unittest.TestCase):
    def test_allowed_notation_and_sinhala_conjuncts(self):
        self.assertEqual(check("A force F moves a {m} kg mass at 2 m s⁻¹.",
                               "F බලය {m} kg ස්කන්ධය 2 m s⁻¹ වේගයෙන් චලනය කරයි."),set())
        self.assertEqual(check("Energy ratio {frac(c)}", "ශක්ති අනුපාතය {frac(c)}"),set())
        self.assertEqual(check("ρ = m/V", "ρ = m/V"),set())
        self.assertEqual(check("From {article} cart", "කරත්තයකින්"),set())
        self.assertEqual(check("Torque", "ව්‍යාවර්තය"),set())

    def test_scripts_and_numbers(self):
        for en, si, kind in [
            ("Find speed", "වේගය find කරන්න", "untranslated-prose"),
            ("Force", "බxලය", "stray-latin"), ("Force", "බmලය", "stray-latin"),
            ("Force A", "බලය А", "look-alike"), ("Force", "බ\u200cලය", "join-control"),
            ("Force", "බ\u200dලය", "join-control"), ("force", "e\u0301", "non-nfc"),
            ("1.5 kg", "1,5 kg", "decimal-style"), ("5 m/s", "5 m/s", "unit-style"),
            ("2 kg", "3 kg", "number-mismatch"), ("2 kg", "2 g", "unit-mismatch"),
            ("2 m in 3 s", "2 s තුළ 3 m", "unit-mismatch"),
            ("{M} kg", "{m} kg", "placeholder-mismatch"), ("m²", "m³", "symbol-mismatch"),
            ("fixed volume", "වායුවක්", "condition-check"), ("force", "", "missing-translation"),
        ]:
            with self.subTest(kind=kind, si=si): self.assertIn(kind, check(en,si))

    def test_options_not_only_stems(self):
        for en,si in [("True","අසත්‍ය"),("A − B","B − A"),("clockwise","වාමාවර්ත")]:
            self.assertIn("option-meaning",check(en,si,"/options/3/text/si"))
        options = [{"text":{"en":"left","si":"වම"}},{"text":{"en":"right","si":"වම"}}]
        self.assertEqual(next(tool["option_collisions"]({"options":options}))[0],"/options/1/text/si")

    def test_draft_link_and_param_format(self):
        self.assertEqual(tool["repair_map"]("## phy.test.c1\n\nSkill: `s`. Repairs: phy.test.t1, phy.test.b3.\n"),
                         {"phy.test.c1":["phy.test.t1","phy.test.b3"]})
        data = {"id":"t", "params":{"word":{"set":["yes/no","other"]}},
                "param_text":{"si":{"yes/no":"එක"}}, "distractors":[{"detail":"text","detail_si":"වචන"}]}
        pairs = {p.field:p for p in tool["fields"](data)}
        self.assertEqual(pairs["/param_text/si/yes~1no"].en,"yes/no")
        self.assertEqual(pairs["/param_text/si/other"].si,"")
        self.assertEqual(pairs["/distractors/0/detail_si"].en,"text")

    def test_patch_preserves_senses_and_options(self):
        propose = tool["proposed"]
        item = {"id":"test","options":[{"text":{"si":"ස්ථිරතාපී"}}]}
        self.assertEqual(propose(item,Pair("/options/1/text/si","Adiabatic","අනුෂ්ණීය")),"අනුෂ්ණීය")
        self.assertEqual(propose(item,Pair("/text/si","Torque","ව්‍යාවර්තය")),"ව්‍යාවර්තය")
        self.assertEqual(propose(item,Pair("/text/si","moment of inertia","අවස්ථිති සූර්ණයේ")),"අවස්ථිති ඝූර්ණයේ")

    def test_generated_pack_and_unapplied_patch(self):
        with tempfile.TemporaryDirectory() as tmp:
            dest = Path(tmp)/"output"
            tool["build"](argparse.Namespace(out=dest,review=None,draft_ref="content-easy-card-drafts"))
            data = json.loads((dest/"flags.json").read_text())
            records = data["records"]
            self.assertEqual(Counter(r["edition"] for r in records if r["group"]!="skills"), {"v2":257,"draft":233})
            self.assertEqual(sum(r["group"]=="skills" for r in records),56)
            fields = {r["edition"]+" "+r["id"]+f["field"]:f["si"] for r in records for f in r["bilingual_fields"]}
            for term in data["terms"]:
                for family in term["families"]:
                    for form,locations in family["forms"].items():
                        for loc in locations: self.assertIn(form,fields[loc],loc)
            for f in data["flags"]:
                self.assertEqual(f["si"],fields[f["edition"]+" "+f["id"]+f["field"]])
            for unit in tool["UNITS"].values():
                rows = [r for r in records if r["unit"]==unit and r["edition"]=="draft"]
                sheet = (dest/(unit+".md")).read_text()
                self.assertEqual(sheet.count("\n## phy."),len(rows))
                for row in rows:
                    self.assertIn("## "+row["id"]+"\n",sheet)
                    for parent in row["repairs"]: self.assertIn(f'<a id="hard-{tool["anchor"](parent)}">',sheet)
            for file in dest.iterdir():
                self.assertEqual(file.read_bytes(), (tool["OUT"]/file.name).read_bytes(),file.name)
            # Both source trees in a disposable directory, exact input bytes.
            for file in data["source_sha256"]:
                target=Path(tmp)/file
                target.parent.mkdir(parents=True,exist_ok=True)
                if "repair-drafts" in file: raw=tool["git"]("show", data["draft_commit"]+":"+file)
                else: raw=(tool["ROOT"]/file).read_text()
                target.write_text(raw)
            subprocess.run(["git","apply","--check",str(dest/"proposed.patch")],cwd=tmp,check=True)

if __name__=="__main__": unittest.main()
