"""Regression tests for bilingual readings, deliberate flips and the teacher sheets."""
import csv
import json
from pathlib import Path
import runpy
import unittest

from sinhala_meaning import meaning_signals
from sinhala_resources import ROOTS
from sinhala_teacher import apply_readings

TOOLS = Path(__file__).parent
checker = runpy.run_path(str(TOOLS/"sinhala-check.py"))
OUT = checker["OUT"]

class Meaning(unittest.TestCase):
    def test_planted_flips_in_stems_explanations_and_statements(self):
        cases = [
            ("The heavier stone reaches a greater height.", "බර ගල වැඩි උසකට ළඟා වේ.", "බර ගල වැඩි උසකට ළඟා නොවේ.", "negation-check"),
            ("The thinner part has one third the area.", "සිහින් කොටසේ වර්ගඵලය පළල් කොටසෙන් තුනෙන් එකකි.", "සිහින් කොටසේ වර්ගඵලය පළල් කොටසෙන් තුනෙන් දෙකකි.", "number-word-check"),
            ("A larger water mass has a smaller temperature rise.", "වැඩි ජල ස්කන්ධයක උෂ්ණත්ව ඉහළ යාම අඩු ය.", "වැඩි ජල ස්කන්ධයක උෂ්ණත්ව ඉහළ යාම වැඩි ය.", "comparison-check"),
            ("The induced field points inwards.", "ප්‍රේරිත ක්ෂේත්‍රය ඇතුළට යොමු වේ.", "ප්‍රේරිත ක්ෂේත්‍රය පිටතට යොමු වේ.", "direction-check"),
            ("Doubling speed doubles the friction force.", "වේගය දෙගුණ කළ විට ඝර්ෂණ බලය දෙගුණ වේ.", "වේගය දෙගුණ කළ විට ඝර්ෂණ බලය දෙගුණ නොවේ.", "negation-check"),
        ]
        for field in ("/text/si","/explanation/si","/statements/0/text/si"):
            for en,good,bad,kind in cases:
                def kinds(si):
                    return {k for k,_ in checker["inspect_pair"](checker["Pair"](field,en,si))}
                with self.subTest(field=field, en=en):
                    self.assertNotIn(kind,kinds(good))
                    self.assertIn(kind,kinds(bad))

    def test_mutations_in_complete_authored_questions(self):
        items = {r["id"]:r["item"] for r in checker["read_inputs"]("content-easy-card-drafts")[2]}
        for suffix, good, flipped, kind in [
            ("mech.c060","ළඟා වේ.","ළඟා නොවේ.","negation-check"),
            ("elec.c054","තුනෙන් එකකි","තුනෙන් දෙකකි","number-word-check"),
            ("therm.c074","කුඩාය","වැඩිය","comparison-check"),
            ("elec.c119","ඇතුළට යොමු වේ.","පිටතට යොමු වේ.","direction-check"),
            ("mech.c140","දෙගුණ වේ.","දෙගුණ නොවේ.","negation-check"),
        ]:
            pair = items["phy."+suffix]["text"]
            with self.subTest(id=suffix):
                self.assertEqual(pair["si"].count(good),1)
                self.assertNotIn(kind,{k for k,_ in meaning_signals(pair["en"],pair["si"])})
                self.assertIn(kind,{k for k,_ in meaning_signals(pair["en"],pair["si"].replace(good,flipped))})

    def test_reversed_poles_and_numbers(self):
        for en,si,kind in [
            ("There is no current.","ධාරාවක් ඇත.","negation-check"),
            ("It never increases.","එය වැඩි වේ.","negation-check"),
            ("Out","ඇතුළට","direction-check"),
            ("Points down.","ඉහළට යොමු වේ.","direction-check"),
            ("Points right.","වමට යොමු වේ.","direction-check"),
            ("The velocities are the same.","ප්‍රවේග වෙනස් වේ.","comparison-check"),
            ("Pressure decreases.","පීඩනය වැඩි වේ.","comparison-check"),
            ("One quarter remains.","තුනෙන් එකක් ඉතිරි වේ.","number-word-check"),
            ("Triple the area.","වර්ගඵලය දෙගුණ කරන්න.","number-word-check"),
            ("Half the height.","උස හතරෙන් එකකි.","number-word-check"),
        ]:
            with self.subTest(en=en):
                self.assertIn(kind, {k for k,_ in meaning_signals(en,si)})

    def test_changed_source_cannot_inherit_a_verdict(self):
        rows=checker["read_inputs"]("content-easy-card-drafts")[2]
        r=next(r for r in rows if r["id"]=="phy.mech.c078")
        r["fields"]={p.field:p for p in checker["fields"](r["item"])}
        flags=[]
        apply_readings([r],flags)
        self.assertEqual(r["meaning_read"],"differs")
        self.assertEqual(len(flags),1)
        r["item"]["text"]["si"]+=" නැත."
        flags=[]
        apply_readings([r],flags)
        self.assertEqual(r["meaning_read"],"needs reread")
        self.assertEqual(flags,[])

    def test_legacy_word_roots_do_not_count_neighbouring_units(self):
        import re
        self.assertEqual(re.findall(ROOTS["potential difference / voltage"]["වෝල්ටීයතාව"], "fjda,aàh;dj fjda,aÜógrh fjda,aÜ"),["fjda,aàh;"])
        self.assertFalse(re.search(ROOTS["zero"]["ශූන්‍ය"], "Y=kH"))
        self.assertTrue(re.search(ROOTS["zero"]["ශූන්‍ය"], "Y+kH"))

    def test_exports_cover_inputs_and_leave_decisions_blank(self):
        report=json.loads((OUT/"flags.json").read_text())
        records=[r for r in report["records"] if r["group"]!="skills"]
        self.assertEqual(len(records),490)
        self.assertEqual({r["meaning_read"] for r in records},{"same","differs"})
        diffs={f["id"] for f in report["flags"] if f["kind"]=="meaning-read"}
        self.assertEqual(diffs,{r["id"] for r in records if r["meaning_read"]=="differs"})
        readme=(OUT/"README.md").read_text()
        self.assertTrue(all("**"+key+"**" in readme for key in diffs))
        self.assertFalse(any(f.get("screen_read",{}).get("verdict")=="needs reread" for f in report["flags"]))
        for name,headers,decision in [
            ("cards","id unit english sinhala key problems teacher_verdict note","teacher_verdict"),
            ("decisions","term_en forms proposed evidence records teacher_choice note","teacher_choice"),
        ]:
            with (OUT/(name+".csv")).open(encoding="utf-8-sig",newline="") as stream:
                instr=csv.reader(stream)
                for _ in range(2):
                    row=next(instr)
                    self.assertRegex(row[0],r"[අ-෴]")
                    self.assertEqual(len(row),1)
                reader=csv.DictReader(stream)
                self.assertEqual(reader.fieldnames,headers.split())
                rows=list(reader)
            self.assertTrue(all(r[decision]==r["note"]=="" and None not in r for r in rows))
            if name=="cards":
                ids=[r["id"] for r in rows]
                self.assertEqual(len(ids),233)
                self.assertEqual(set(ids),{r["id"] for r in records if r["edition"]=="draft"})
                for row in rows:
                    self.assertIn(row["key"].split(". ")[0]+". ",row["sinhala"])
                    self.assertNotRegex(row["problems"],r"/(?:text|options|explanation)/|\bP[123]\b")
                self.assertTrue(all(r["problems"] for r in rows if r["id"] in diffs))
            else:
                self.assertEqual(len({r["term_en"] for r in rows}),len(rows))
                for t in ("zero","rate","potential difference / voltage","Newton (name)","hinge","symmetry"):
                    term=next(r for r in rows if r["term_en"]==t)
                    self.assertIn("proposed — teacher confirms",term["proposed"])
                    for source in ("syllabus","papers","books"): self.assertIn(source,term["evidence"])
