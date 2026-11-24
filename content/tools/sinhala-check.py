#!/usr/bin/env python3
"""Build the teacher pack offline. Run from any directory with Python 3.9+."""
import argparse
from collections import Counter, defaultdict
from dataclasses import dataclass
from decimal import Decimal
from copy import deepcopy
from sinhala_meaning import meaning_signals
from sinhala_teacher import apply_readings, configure_terms, reading_summary, write_sheets
import difflib
import hashlib
import json
from pathlib import Path
import re
import subprocess
import unicodedata as ud

ROOT = Path(__file__).resolve().parents[2]
REVIEW = "docs/reviews/2026-11-19-sinhala-terminology.md"
OUT = ROOT / "docs/reviews/2026-11-21-sinhala-review-pack"
CATALOG = Path(__file__).with_name("sinhala-terms.json")
UNITS = {"phy.mech": "mechanics", "phy.therm": "thermal", "phy.elec": "electricity"}
SIN = r"\u0d80-\u0dff\u200c\u200d"
WORD = "[" + SIN + "]"
PLACE = re.compile(r"\{[^{}]+\}")
# Line anchors in the independent review. Validate the cited text on rerun.
RECOMMENDATIONS = {
    "moment of force": (13, "ඝූර්ණ", "ඝූර්ණය"),
    "moment of inertia": (13, "අවස්ථිති ඝූර්ණ", "අවස්ථිති ඝූර්ණය"),
    "moment arm": (13, "ඝූර්ණ", "Use the ඝූර්ණ root."),
    "torque": (13, "ව්‍යාවර්තය", "ව්‍යාවර්තය"),
    "translational kinetic energy (including abbreviated translational term)": (14, "උත්තාරණ චාලක ශක්තිය", "උත්තාරණ චාලක ශක්තිය"),
    "rotational kinetic energy": (14, "භ්‍රමණ චාලක ශක්තිය", "භ්‍රමණ චාලක ශක්තිය"),
    "partial pressure": (15, "ආංශික පීඩන", "ආංශික පීඩනය"),
    "adiabatic": (16, "ස්ථිරතාපී", "ස්ථිරතාපී first. අනුෂ්ණීය may follow as an alias."),
    "isothermal": (16, "සමෝෂ්ණ", "සමෝෂ්ණ"),
    "linear expansivity": (17, "රේඛීය ප්‍රසාරණතාව", "රේඛීය ප්‍රසාරණතාව"),
    "linear expansion": (17, "රේඛීය ප්‍රසාරණය", "රේඛීය ප්‍රසාරණය"),
    "potential divider": (18, "විභව බෙදුම් පරිපථය", "විභව බෙදුම් පරිපථය for the circuit name."),
    "mechanical beam": (24, "බාල්කය", "බාල්කය for a loaded beam."),
    "resultant force": (25, "සම්ප්‍රයුක්ත බලය", "සම්ප්‍රයුක්ත බලය or බල සම්ප්‍රයුක්තය"),
    "projectile": (25, "ප්‍රක්ෂිප්තය", "ප්‍රක්ෂිප්තය for the object."),
    "ideal gas": (26, "පරිපූර්ණ", "පරිපූර්ණ වායුව"),
    "dew point": (26, "තුෂාර අංකය", "තුෂාර අංකය"),
    "relative humidity": (26, "සාපේක්ෂ ආර්ද්‍රතාව", "සාපේක්ෂ ආර්ද්‍රතාව"),
    "rms speed": (27, "වර්ග මධ්‍යන්‍ය මූල", "Introduce වර්ග මධ්‍යන්‍ය මූල වේගය with r.m.s."),
    "power": (28, "ක්ෂමතාව", "ජවය as the label. Introduce ක්ෂමතාව (ජවය) in an explanation."),
    "electrical power": (28, "ජවය", "Use the ජවය label for power."),
    "efficiency": (28, "කාර්යක්ෂමතාව", "කාර්යක්ෂමතාව"),
    "electromotive force": (29, "විද්‍යුත් ගාමක බලය", "විද්‍යුත් ගාමක බලය. Expand වි.ගා.බ. in standalone cards."),
    "turns of a coil": (29, "වට", "වට"),
    "cell": (29, "කෝෂය", "කෝෂය"),
    "bridge (circuit)": (30, "සේතුව", "සේතුව"),
    "wheatstone bridge": (30, "සේතුව", "Keep the සේතුව root."),
    "potentiometer": (30, "විභවමානය", "විභවමානය"),
    "drift velocity": (30, "ප්ලාවිත ප්‍රවේගය", "ප්ලාවිත ප්‍රවේගය"),
    "drift speed": (30, "ප්ලාවිත වේගය", "ප්ලාවිත වේගය for the magnitude."),
    "uniform acceleration": (41, "ඒකාකාර ත්වරණය", "teacher to decide. Both නියත ත්වරණය and ඒකාකාර ත්වරණය are accepted."),
    "apparent weight": (41, "දෘශ්‍ය බර", "teacher to decide on දෘශ්‍ය බර."),
}
# Only these families attract an editorial flag even when there is one spelling
# throughout the corpus. Other competing families are questions for the teacher.
REVIEW_ALTERNATES = {
    "moment of force": {0}, "moment of inertia": {0}, "moment arm": {0},
    "partial pressure": {0}, "adiabatic": {0}, "linear expansivity": {0},
    "translational kinetic energy (including abbreviated translational term)": {0},
    "potential divider": {1, 2},
}
# Short or polysemous roots only count in a bilingual field about this sense.
CONTEXT = {
    "turns of a coil": r"\bturns?\b", "force": r"\bforces?\b", "core": r"\bcore\b",
    "range": r"\brange\b", "radius": r"\bradi(?:us|i)\b", "second": r"\bsecond[s]?\b",
    "direction": r"\bdirection", "work": r"\bwork\b", "terminal (electrical)": r"terminal",
    "unit": r"\bunits?\b", "dimension": r"\bdimension", "dimensions": r"\bdimension",
    "potential": r"\bpotential\b", "gravity": r"gravit", "length": r"length|long",
    "lever arm": r"lever|arm", "input": r"\binput", "output": r"\boutput",
    "power": r"power|watts?", "resistance": r"resistance|ohm|resistive",
    "lagged": r"lagg", "insulated": r"insulat|lagged", "resistor": r"resistors?",
    "spring": r"spring", "flux": r"flux", "load": r"\bload", "heat transfer": r"heat transfer",
    "conductor": r"conductor|conducting", "mole": r"\bmoles?\b", "metre": r"\bmetres?\b",
    "graph slope": r"slope|gradient", "winding": r"winding", "carriers per unit volume": r"carrier|electron",
    "motor startup": r"start", "thermal capacity": r"thermal capacity", "inertia": r"inertia",
    "saturation": r"saturat", "slope": r"slope", "inclined plane": r"slope|incline",
    "position": r"position", "parallel connection": r"parallel", "ideal gas": r"ideal|perfect",
    "axis": r"\bax(?:is|es)\b", "mass": r"mass", "heat": r"heat|thermal",
    "height": r"height|high",

    "Newton (name)": r"newton", "rate": r"\brate", "liquid": r"liquid",
}
CONTEXT = {k: re.compile(v, re.I) for k, v in CONTEXT.items()}

def git(*args):
    return subprocess.check_output(["git", *args], cwd=ROOT).decode()

def dump(value, indent=2):
    return json.dumps(value, ensure_ascii=False, indent=indent) + "\n"

@dataclass(frozen=True)
class Pair:
    field: str   # JSON Pointer relative to the item, to the Sinhala scalar
    en: str
    si: str

def escape(key):
    return key.replace("~", "~0").replace("/", "~1")

def fields(item):
    """Authored student-facing fields. A shared empty figure caption is legitimate."""
    def pair(container, key, path):
        x = container.get(key, {})
        return Pair(f"{path}/{key}/si", x.get("en", ""), x.get("si", ""))
    if "name" in item:
        yield Pair("/name_si", item["name"], item.get("name_si", ""))
        return
    if "statements" not in item or "text" in item:
        yield pair(item, "text", "")
    yield pair(item, "explanation", "")
    for group in ("options", "statements", "distractors"):
        for index, option in enumerate(item.get(group, [])):
            path = f"/{group}/{index}"
            if group != "distractors":
                yield pair(option, "text", path)
            if "detail" in option or "detail_si" in option:
                if isinstance(option.get("detail"), dict):
                    yield pair(option, "detail", path)
                else:
                    yield Pair(path + "/detail_si", option.get("detail", ""), option.get("detail_si", ""))
    labels = item.get("param_text", {}).get("si", {})
    values = [s for p in item.get("params", {}).values() for s in p.get("set", []) if isinstance(s, str)]
    for word in dict.fromkeys(values + list(labels)):
        yield Pair("/param_text/si/" + escape(word), word, labels.get(word, ""))

UNITS_PATTERN = r"(?:kg|mg|km|cm|mm|ms|mL|kPa|Pa|kJ|kW|kWh|mV|mA|Wb|Hz|mol|rad|rpm|min|°C|Ω|[mgsKJWVNATCFH])"
ALLOWED = set("m g s K J W V N A T C F H SI RH SVP rms sin cos tan log ln kg mg cm km mm ms min kPa Pa kJ mV mA kW rad rpm Wb kWh mL Hz mol KE PE DC AC".split())
# Formula products and diagram labels actually used in these packs. Connector
# words such as 'so' are deliberately absent; a subscript (θ_room) is a symbol.
FORMULA = set("Rt pV ma ML MR Ir MLT dt Ns Np mr Fv mv mc kT nRT VI RS Is Ip gh as at mgs Mv gu gt Mg nR nAev IR mgd QL nAve VR PQ BA Vs Vp MT gs md gd".split())
HOLDER = PLACE.pattern
DIGITS = re.compile(r"(?<![A-Za-z0-9_])(?:[−-](?=\d))?\d+(?:[.·,]\d+)?")
SYMBOLS = re.compile(r"[α-ωΑ-Ωµ]|[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+|[₀-₉]+|[<>≤≥∝∝≈]")
QUNIT = re.compile(r"(?<![A-Za-z0-9_.])("+HOLDER+r"|[−-]?\d+(?:[.,·]\d+)?)\s*("+UNITS_PATTERN+r"(?:[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)?(?:\s+"+UNITS_PATTERN+r"[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)*)(?![a-zA-Z])")
PURE_UNIT = re.compile(UNITS_PATTERN+r"(?:[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)?(?:\s+"+UNITS_PATTERN+r"[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]*)*")
CONDITIONS = [
    ("without slipping", r"without (?:slip|sliding)|no slip", r"නොලිස්|ලිස්සීමකින් තොර|ලිස්සන්නේ නැ|ලිස්සා (?:නො|යාමකින් තොර)"),
    ("initially at rest", r"from rest|initially at rest|starts at rest", r"නිශ්චල|නිසල|නැවතී|ශූන්‍ය|ශුන්‍ය"),
    ("negligible heat capacity", r"negligible heat capacity", r"නොගිණි|නොසැලකි|නොසලකා|නොගැන|නොසැලක|නොසලක|නොගිනි"),
    ("constant pressure", r"(?:constant|fixed) pressure", r"(?:නියත|ස්ථිර).{0,12}පීඩන|පීඩන.{0,12}(?:නියත|ස්ථිර)"),
    ("constant temperature", r"(?:constant|fixed) temperature", r"(?:නියත|ස්ථිර).{0,12}උෂ්ණත්ව|උෂ්ණත්ව.{0,12}(?:නියත|ස්ථිර)|සමෝෂ්ණ"),
    ("constant volume", r"(?:constant|fixed) volume", r"නියත.{0,12}පරිමා|පරිමා.{0,32}නියත"),
    ("insulated", r"\binsulated\b", r"පරිවාර|පරිවර|තාපය නො|තාප හුවමාරු"),
    ("frictionless", r"frictionless|without friction", r"ඝර්ෂණ.{0,14}(?:රහිත|නො|නැ|ශූන්‍ය)|සිනිඳු"),
    ("cross section", r"cross[- ]section", r"හරස්|හරස්කඩ"),
    ("same height", r"same (?:launch )?height", r"එකම (?:උස|මට්ටම)|එම උස|සමාන උස|මුල් උස"),
    ("no air resistance", r"(?:ignore|neglect|without) air resistance", r"වායු ප්‍රතිරෝධ.{0,16}(?:නො|නැ|රහිත)|වාත ප්‍රතිරෝධ"),
    ("no external torque", r"no external torque", r"බාහිර ව්‍යාවර්ත.{0,22}(?:නො|නැ|ශූන්‍ය|ශුන්‍ය)"),
    ("closed circuit or loop", r"closed (?:conducting )?(?:loop|circuit)", r"සංවෘත|වැසූ|වසා|සංවෘත්ත"),
    ("perpendicular", r"perpendicular|right angles", r"ලම්බ|සෘජුකෝණ|90°"),
    ("explicit matching condition R = r", r"matched resistor", r"ගැළප|ගැලප|සමාන|R\s*=\s*r"),
    ("initial temperature", r"initially (?:cool|cold|hot)", r"මුල|ආරම්භ|පළමු"),
    ("negation", r"\bnever\b|\bdoes not\b|\bcannot\b|\bcan't\b", r"නො|නැ|නෙ|බැ|කිසි|අසමත්|වෙනුවට|අවශ්‍යය"),
    ("direction", r"\bclockwise\b", r"දක්ෂිණාවර්ත|ඔරලෝසු"),
    ("direction", r"\banti.?clockwise\b", r"වාමාවර්ත|ඔරලෝසු"),
]
POLAR = {"true": "සත්‍ය", "false": "අසත්‍ය", "increases": "වැඩි", "decreases": "අඩු",
         "positive": "ධන", "negative": "සෘණ", "east": "නැගෙනහිර", "west": "බටහිර"}
PRIORITY = {"negation-check": 2, "number-word-check": 2, "direction-check": 2,
            "comparison-check": 2, "meaning-read": 3,"missing-translation": 3, "option-meaning": 3, "placeholder-mismatch": 3,
            "number-mismatch": 3, "condition-check": 2, "unit-mismatch": 2, "symbol-mismatch": 2,
            "review-wording": 2, "untranslated-prose": 2, "stray-latin": 2, "look-alike": 2,
            "join-control": 2, "non-nfc": 1, "unit-style": 1, "decimal-style": 1, "term-variation": 1}

def numbers(s):
    return Counter(Decimal(m.replace("−", "-").replace("·", ".").replace(",", ".")) for m in DIGITS.findall(PLACE.sub("", s)))

def quantity_units(s):
    units = [s] if PURE_UNIT.fullmatch(s) else [u for _,u in QUNIT.findall(s)]
    return Counter(" ".join(u.split()) for u in units)

def difference(a, b):
    def describe(values):
        return ", ".join(f"{key} ×{n}" if n > 1 else str(key) for key,n in sorted(values.items())) or "none"
    return f"EN only [{describe(a-b)}], SI only [{describe(b-a)}]"

def inspect_pair(pair):
    en, si = pair.en, pair.si
    if not en.strip() or not si.strip():
        if en.strip() or si.strip():
            yield "missing-translation", "One language is empty."
        return
    yield from meaning_signals(en, si)
    if re.search(WORD,en):
        yield "untranslated-prose", "Sinhala script in the English master. Verify the language of the field."
    for lang, s in (("EN", en), ("SI", si)):
        if not ud.is_normalized("NFC", s):
            yield "non-nfc", f"{lang} differs from NFC."
        for i, c in enumerate(s):
            if c in "\u200c\u200d":
                if not (c == "\u200d" and i >= 2 and "ක" <= s[i-2] <= "ෆ" and s[i-1] == "්" and i+1 < len(s) and "ක" <= s[i+1] <= "ෆ"):
                    yield "join-control", f"{lang} {ud.name(c)} at character {i+1}. Check intended shaping."
            if "CYRILLIC" in ud.name(c, "") or c in "µΩKϱϑ\u200b\ufeff" or 0xFF01 <= ord(c) <= 0xFF5E:
                yield "look-alike", f"{lang} U+{ord(c):04X} {ud.name(c, 'unknown')}, character {i+1}."
        if re.search(r"(?<![A-Za-z])[OlI][.,]\d",s):
            yield "look-alike", f"{lang} decimal starts with a letter resembling 0 or 1."
        if re.search(r"\d,\d", s):
            yield "decimal-style", f"{lang} contains a comma between digits. Check decimal or list."
        if re.search(r"(?<![a-zA-Z])(?:m/s|km/h|J/kg|W/m|kg/m|N/m|A/m)(?![A-Za-z])|(?<![A-Za-z])"+UNITS_PATTERN+r"\^[-−]?\d", s):
            yield "unit-style", f"{lang} has slash or caret unit notation. Check §5.2."
    # English indefinite articles are generated in t12. Sinhala has no
    # corresponding required placeholder. Physics-bearing placeholders must match.
    if Counter(PLACE.findall(en.replace("{article}",""))) != Counter(PLACE.findall(si)):
        yield "placeholder-mismatch", difference(Counter(PLACE.findall(en.replace("{article}",""))), Counter(PLACE.findall(si)))
    en_marks = Counter(re.findall(r"(?<=\d)([.·,])(?=\d)",en))
    si_marks = Counter(re.findall(r"(?<=\d)([.·,])(?=\d)",si))
    if en_marks and si_marks and en_marks.keys() != si_marks.keys():
        yield "decimal-style", "Decimal marks differ across languages. The living spec leaves point vs middle dot open."
    if numbers(en) != numbers(si):
        yield "number-mismatch", difference(numbers(en), numbers(si)) + ". Check words, signs and repeated working."
    if quantity_units(en) != quantity_units(si):
        yield "unit-mismatch", difference(quantity_units(en), quantity_units(si)) + ". Check unit scope."
    elif numbers(en) == numbers(si):
        def quantities(s):
            return Counter((v if v.startswith("{") else str(Decimal(v.replace("−","-").replace(",",".").replace("·",".")).normalize()))+" "+u
                           for v,u in QUNIT.findall(s))
        a,b = quantities(en),quantities(si)
        if a != b:
            yield "unit-mismatch", "Quantity/unit pairing differs. "+difference(a,b)
    # The same two numbers and units can still be assigned to opposite variables.
    assignment = r"(?<![A-Za-z0-9_])([A-Za-zα-ωΑ-Ω][₀-₉]*)\s*=\s*([−-]?\d+(?:[.,·]\d+)?)"
    def assignments(s):
        return Counter((k,Decimal(v.replace("−","-").replace(",",".").replace("·","."))) for k,v in re.findall(assignment,s))
    a,b = assignments(en),assignments(si)
    if a and b and a != b and {k for k,_ in a} == {k for k,_ in b}:
        yield "number-mismatch", "A named quantity has different numerical assignments. "+difference(a,b)
    if Counter(SYMBOLS.findall(en)) != Counter(SYMBOLS.findall(si)):
        yield "symbol-mismatch", difference(Counter(SYMBOLS.findall(en)), Counter(SYMBOLS.findall(si)))
    clean = re.sub(r"_[A-Za-z]+|r\.m\.s\.", "", PLACE.sub("", si))
    for match in re.finditer(r"[A-Za-z]+", clean):
        word = match.group()
        adjacent = (match.start() and re.match(WORD, clean[match.start()-1])) or re.match(WORD, clean[match.end():])
        if adjacent:
            yield "stray-latin", f"Latin {word!r} touches Sinhala text. Check symbol spacing or a mistyped letter."
        elif word in ALLOWED or word in FORMULA:
            continue
        elif len(word) > 1:
            yield "untranslated-prose", f"Check {word!r} in the Sinhala field. Retain a genuine variable or diagram label."
        elif not re.search(r"(?<![A-Za-z])"+word+r"(?![A-Za-z])", en) and not re.search(r"[=÷×√∝/]", si):
            yield "stray-latin", f"Isolated {word!r} has no corresponding standalone label in English."
    for label, english, sinhala in CONDITIONS:
        if re.search(english,en,re.I) and not re.search(sinhala,si):
            yield "condition-check", f"Check the English condition “{label}” in Sinhala."
    for english,opposite,good,bad in [
        ("doubles", "halves", "දෙගුණ", "අඩක්"), ("increases", "decreases", "වැඩි", "අඩු"),
        ("clockwise", "anticlockwise", "දක්ෂිණාවර්ත", "වාමාවර්ත"),
        ("east", "west", "නැගෙනහිර", "බටහිර"),
    ]:
        for a,b,x,y in [(english,opposite,good,bad),(opposite,english,bad,good)]:
            if re.search(r"\b"+a+r"\b",en,re.I) and not re.search(r"\b"+b+r"\b",en,re.I) and y in si and x not in si:
                yield ("option-meaning" if pair.field.startswith("/options/") else "condition-check"), f"Check {a!r} against {y!r}, which can indicate {b!r}."
    for english, contrary in [("twice|doubles?", "තුන් ගුණ|තෙගුණ"), ("three times|triples?", "දෙගුණ")]:
        if re.fullmatch(english, en.strip(" ."), re.I) and re.search(contrary, si):
            yield "number-mismatch", "Written multipliers appear to disagree."
    if pair.field.startswith("/options/"):
        for english, sinhala in POLAR.items():
            if en.lower().strip(" .") == english and not si.strip().startswith(sinhala):
                yield "option-meaning", f"Verify the Sinhala equivalent of {english!r} in this option."
        # Pure formula options must retain order, signs and letter case.
        if re.fullmatch(r"[ A-Za-z0-9α-ωΑ-Ω√×+−²³⁻¹⁰₀-₉=÷*/:().½π<>≥≤∝-]+", en) and not re.search(r"[A-Za-z]{4,}|"+WORD, en+si):
            compact = lambda x: re.sub(r"\s+", "", x).replace("-", "−").replace(":", "∶")
            if compact(en) != compact(si):
                yield "option-meaning", "Formula or labelled option differs. Compare operands and their order."

def option_collisions(item):
    seen = {}
    for i, o in enumerate(item.get("options", [])):
        t = o["text"]
        key = (t.get("si","").strip(), o.get("asset"))
        if key[0] and key in seen and seen[key][1] != t.get("en"):
            yield f"/options/{i}/text/si", f"Same Sinhala option as option {seen[key][0]+1}, with different English."
        seen[key] = (i, t.get("en"))

def load_terms(review_lines):
    raw = json.loads(CATALOG.read_text())
    terms = {}
    for name, families in raw.items():
        pref = RECOMMENDATIONS.get(name)
        if pref and pref[1] not in review_lines[pref[0]-1]:
            raise ValueError(f"Review changed at line {pref[0]} for {name}. Verify the citation.")
        roots = {root: n for n, family in enumerate(families) for root in family}
        # Prefer the longest attested expression within a concept. Keep the
        # inflected surface, rather than reporting the search root as a quotation.
        pattern = re.compile("(?<!["+SIN+r"A-Za-z])(" + "|".join(map(re.escape, sorted(roots,key=len,reverse=True))) + ")"+WORD+"*")
        terms[name] = (pattern, roots, families)
    return terms

def term_hits(terms, pair):
    for name, (pattern, roots, _) in terms.items():
        if name in CONTEXT and not CONTEXT[name].search(pair.en): continue
        for m in pattern.finditer(pair.si):
            surface = m.group()
            if name == "moment of force" and (pair.si[:m.start()].rstrip().endswith("අවස්ථිති") or "moment of inertia" in pair.en.lower() and not re.search(r"moments? (?:of (?:a |the )?force|about)",pair.en,re.I)): continue
            if name == "resistance" and surface.startswith("ප්‍රතිරෝධක"): continue
            if name == "liquid" and surface.startswith(("ද්‍රව්‍ය","ද්‍රවාංක")): continue
            yield name, roots[m[1]], surface

def repair_map(sheet):
    repairs = {}
    for key, block in re.findall(r"^## (phy\.[\w.-]+)\s*\n(.*?)(?=^## |\Z)", sheet, re.M|re.S):
        row = re.search(r"^Skill: .*? Repairs: (.+)$", block, re.M)
        if not row: raise ValueError(f"Missing repair mapping for {key}")
        repairs[key] = re.findall(r"phy\.\w+\.[\w-]+", row[1])
    return repairs

def proposed(item, pair):
    """Small, inspectable edits supported by the review or literal prose leakage."""
    s = pair.si
    s = s.replace("සූර්ණ", "ඝූර්ණ")
    if re.search(r"translat",pair.en,re.I): s = s.replace("පරිවහන", "උත්තාරණ")
    if "partial pressure" in pair.en.lower(): s = s.replace("අර්ධ පීඩන", "ආංශික පීඩන")
    if item["id"] in ("phy.therm.c001","phy.therm.c002"):
        s = s.replace("ප්‍රසාරණශීලතාවයේ","ප්‍රසාරණතාවේ").replace("ප්‍රසාරණශීලතාව","ප්‍රසාරණතාව")
    if pair.field == "/name_si" and s == "විභව බෙදුම්කරය": s = "විභව බෙදුම් පරිපථය"
    if pair.field == "/name_si" and s == "r.m.s. වේගය සහ වායු පීඩනය":
        s = "වර්ග මධ්‍යන්‍ය මූල (r.m.s.) වේගය සහ වායු පීඩනය"
    if item["id"] == "phy.therm.c016" and pair.field == "/text/si" and s == "නියත පීඩනයේ ඇති පරිපූර්ණ වායුවක නියත ස්කන්ධයකි. නිරපේක්ෂ උෂ්ණත්වය T ට එරෙහිව එහි ඝනත්වය ρ හි ප්‍රස්තාරය තෝරන්න.":
        s = "නියත ස්කන්ධයක් ඇති පරිපූර්ණ වායුවක පීඩනය නියතව පවතී. නිරපේක්ෂ උෂ්ණත්වය T සමඟ ඝනත්වය ρ වෙනස් වන ආකාරය දැක්වෙන ප්‍රස්තාරය තෝරන්න."
    if item["id"] == "phy.elec.c091" and pair.en == "Use the current through the matched resistor in I²R to find power." and s == "ජවය සෙවීමට එම ප්‍රතිරෝධක ධාරාව I²R හි යොදන්න.":
        s = "භාර ප්‍රතිරෝධය කෝෂයේ අභ්‍යන්තර ප්‍රතිරෝධයට සමාන විට, භාරය තුළින් ගලන ධාරාව I²R සූත්‍රයට ආදේශ කර ජවය සොයන්න."
    if "අනුෂ්ණීය" in s and "ස්ථිරතාපී" not in s:
        # Introduce the current alias in feedback, never as a second equivalent option.
        equivalent = any("ස්ථිරතාපී" in o["text"]["si"] for o in item.get("options", []))
        if not equivalent:
            label = "ස්ථිරතාපී (අනුෂ්ණීය)" if pair.field == "/explanation/si" else "ස්ථිරතාපී"
            s = s.replace("අනුෂ්ණීය", label)
    if pair.field == "/explanation/si" and "වි.ගා.බ." in s and "විද්‍යුත් ගාමක බල" not in s:
        s = s.replace("වි.ගා.බ.", "විද්‍යුත් ගාමක බලය (වි.ගා.බ.)", 1) if s.startswith("වි.ගා.බ. ") else s
    return s.replace(", so ", ", එබැවින් ")

def set_field(item, path, value):
    parts = [s.replace("~1","/").replace("~0","~") for s in path[1:].split("/")]
    obj = item
    for k in parts[:-1]:
        obj = obj[int(k)] if isinstance(obj,list) else obj[k]
    obj[parts[-1]] = value

def loc(record, f):
    return f"{record['edition']} {record['id']}{f}"

def read_inputs(ref):
    commit = git("rev-parse", "--verify", ref+"^{commit}").strip()
    files, records = {}, []
    for pack in json.loads((ROOT/"content/sample-v2/content-packs.json").read_text())["packs"]:
        base = pack["dir"]
        unit = UNITS[pack["unit"]["id"]]
        draft = "content/repair-drafts/"+Path(base).name
        links = repair_map(git("show", f"{commit}:{draft}/review.md"))
        owners = set()
        for edition, path in (("v2",base+"/items.json"),("draft",draft+"/cards.json")):
            raw = (ROOT/path).read_text() if edition=="v2" else git("show", f"{commit}:{path}")
            data = json.loads(raw)
            files[path] = (raw, data, 1 if edition=="v2" else 2)
            for group in ("skills","cards","pools","templates","banks"):
                for i, item in enumerate(data.get(group, [])):
                    key = item["id"]
                    if edition=="draft": owners.add(key)
                    records.append(dict(edition=edition, unit=unit, id=key, group=group,
                                        path=path, pointer=f"/{group}/{i}", item=item,
                                        repairs=links[key] if edition=="draft" else []))
        if owners != set(links): raise ValueError(f"Draft card/repair list mismatch in {unit}")
    src = {r["id"]:r for r in records if r["edition"]=="v2"}
    if len({r["id"] for r in records}) != len(records): raise ValueError("Duplicate IDs in inputs")
    for r in records:
        if r["edition"] == "draft" and (not r["repairs"] or any(i not in src or r["unit"]!=src[i]["unit"] for i in r["repairs"])):
            raise ValueError(f"Unresolved repair in {r['id']}")
    return commit, files, records

# These are specific readings in the independent review. They also expose
# meaning/style problems that token checks alone cannot recognize.
EDITORIAL = {
    ("phy.therm.c016","/text/si"): (36, "එරෙහිව", "Check graph-axis wording. Preserve fixed mass and constant pressure."),
    ("phy.elec.c013","/text/si"): (37, "සිහින් : ඝන", "Clarify cross-sectional area and the order thin : thick in both languages."),
    ("phy.therm.c031","/explanation/si"): (38, "RH = 2.3 ÷ 4.2.", "Make the conversion from a fraction to 55% explicit."),
    ("phy.mech.c008","/options/0/text/si"): (39, "ඉදිරි දිශාවට ඇති", "Review the direction and static friction wording for walking without slipping."),
}
def audit(records, terms):
    hits = defaultdict(lambda: defaultdict(lambda: defaultdict(set)))
    flags = []
    seen = set()
    def flag(r,p,k,message):
        identity = r["id"],p.field,k,message
        if identity not in seen:
            seen.add(identity)
            flags.append(dict(unit=r["unit"],edition=r["edition"],id=r["id"],field=p.field,
                              kind=k,priority=PRIORITY[k],message=message,en=p.en,si=p.si))
    for r in records:
        item = r["item"]
        fs = {p.field:p for p in fields(item)}
        r["fields"] = fs
        for f,p in fs.items():
            for k,msg in inspect_pair(p): flag(r,p,k,msg)
            for name, family, surface in term_hits(terms,p):
                hits[name][family][surface].add(loc(r,f))
                if family in REVIEW_ALTERNATES.get(name,set()):
                    if name=="adiabatic" and "ස්ථිරතාපී" in p.si: continue
                    flag(r,p,"review-wording",f"{name}. {RECOMMENDATIONS[name][2]} Review line {RECOMMENDATIONS[name][0]}.")
            if (r["id"],f) in EDITORIAL:
                line,phrase,msg = EDITORIAL[r["id"],f]
                if phrase in p.si: flag(r,p,"review-wording",f"{msg} Review line {line}.")
        if item.get("name") == "r.m.s. speed and gas pressure" and "වර්ග මධ්‍යන්‍ය මූල" not in fs["/name_si"].si:
            flag(r,fs["/name_si"],"review-wording","Introduce the Sinhala rms term in this skill label. Review line 27.")
        if any("වි.ගා.බ." in p.si for p in fs.values()) and r["group"]!="skills" and "විද්‍යුත් ගාමක බල" not in item.get("explanation",{}).get("si",""):
            flag(r, fs["/explanation/si"],"review-wording","Expand emf in the standalone explanation. Review line 29.")
        for f,msg in option_collisions(item): flag(r,fs[f],"option-meaning",msg)
    # Decisions about alternate names concern a distribution across the corpus.
    # Mark less widespread families; retain every family/location in the index.
    lookup = {r["id"]:r for r in records}
    conflicts = []
    for name, families in hits.items():
        if len(families)<2: continue
        counts = {i:len({l.split(" ",1)[1].split("/")[0] for locs in forms.values() for l in locs})
                  for i,forms in families.items()}
        ranked = sorted(counts,key=lambda i:(-counts[i],i))
        conflicts.append(dict(term=name, secondary_items=counts[ranked[1]],
                              family_item_counts=counts))
        if name in RECOMMENDATIONS: continue
        for i in ranked[1:]:
            for surface, locs in families[i].items():
                for l in locs:
                    key,f = l.split(" ",1)[1].split("/",1)
                    r = lookup[key]
                    flag(r,r["fields"]["/"+f],"term-variation",f"{name}: {surface}. See the term decision sheet.")
    conflicts.sort(key=lambda c:(-c["secondary_items"],c["term"]))
    flags.sort(key=lambda f:(f["unit"],f["edition"],f["id"],-f["priority"],f["field"],f["kind"],f["message"]))
    return hits, flags, conflicts

def patch(files,records):
    # Serializers are checked against the original blobs before editing in memory.
    for path,(raw,data,indent) in files.items():
        if dump(data,indent) != raw: raise ValueError(f"Formatting changed in {path}; refusing a noisy patch")
    result = []
    for r in records:
        original = deepcopy(r["item"])
        for p in r["fields"].values():
            change = proposed(original,p)
            if change != p.si: set_field(r["item"],p.field,change)
    for path,(raw,data,indent) in sorted(files.items()):
        changed = dump(data,indent)
        if changed!=raw:
            result.append(f"diff --git a/{path} b/{path}\n")
            result.extend(difflib.unified_diff(raw.splitlines(True),changed.splitlines(True),"a/"+path,"b/"+path))
    return "".join(result)

def parent_title(r):
    item = r["item"]
    if "statements" in item: return "Statement bank"
    return item["text"]["en"]

def anchor(key):
    return key.replace(".","-")

def teacher_sheet(unit, records, flags):
    by_id = defaultdict(list)
    for f in flags:
        if "screen_read" not in f or f["screen_read"]["verdict"]=="needs reread":
            by_id[f["id"]].append(f)
    drafts = [r for r in records if r["unit"]==unit and r["edition"]=="draft"]
    def rank(r):
        count = Counter(f["priority"] for f in by_id[r["id"]])
        return -count[3],-count[2],-count[1],r["id"]
    parents = {r["id"]:r for r in records if r["edition"]=="v2" and r["unit"]==unit}
    lines = [f"# {unit.title()} · Sinhala teacher sheet", "",
             f"{len(drafts)} proposed repairs. Read the linked harder question first. Each option number is its authored position. The key is the proposed answer. Compare both languages and check each flagged field.",
             "", "Most urgent first. Sort by the number of priority 3 findings, then priority 2, then priority 1. Ties use card ID. An empty flag list still needs a bilingual reading.", ""]
    for r in sorted(drafts,key=rank):
        item = r["item"]
        lines += ["## "+r["id"],"",item["text"]["en"],"",item["text"]["si"],""]
        for i,o in enumerate(item["options"],1):
            key = "**Key**" if o["correct"] else "`"+o["tag"]+"`"
            lines += [f"{i}. {o['text']['en']} · {o['text']['si']} · {key}"]
            if o.get("detail"): lines += [f"   - {o['detail']['en']} · {o['detail']['si']}"]
        lines += ["",item["explanation"]["en"],"",item["explanation"]["si"],"", "**Harder questions**",""]
        for id_ in r["repairs"]:
            lines.append(f"- [{id_}](#hard-{anchor(id_)}) · {parent_title(parents[id_])}")
        lines += ["","**Checks**",""]
        for f in by_id[r["id"]]:
            lines.append(f"- P{f['priority']} · {f['kind']} · `{f['field']}` · {f['message']}")
        if not by_id[r["id"]]: lines.append("No outstanding findings from these checks.")
        lines += [""]
    lines += ["## Harder questions referenced by the drafts","","Template braces stand for generated values. Each bank lists its authored true and false statements. The draft branch supplies these links.", ""]
    for k in sorted({k for r in drafts for k in r["repairs"]}):
        r = parents[k]; d = r["item"]
        lines += [f'<a id="hard-{anchor(k)}"></a>',"",f"### {k}","","[Authored item file](../../../"+r["path"]+")",""]
        if "text" in d: lines += [d["text"]["en"],"",d["text"]["si"],""]
        for o in d.get("options",d.get("statements",[])):
            verdict = "key" if o.get("correct") else ("true" if o.get("true") else o.get("tag","false"))
            lines += [f"- {o['text']['en']} · {o['text']['si']} ({verdict})"]
        for i,o in enumerate(d.get("options",[]),1):
            if "asset" in o:
                lines += [f"- [Figure for option {i}](../../../{Path(r['path']).parent}/{o['asset']})"]
        if d.get("figure"):
            lines += ["", f"Diagram: `{d['figure']['engine']}`. [Worked examples and figures](../../../{Path(r['path']).parent}/review.md)."]
        if "answer" in d: lines += [f"- Key formula: `{d['answer']['expr']}` {d['answer'].get('unit','')}".rstrip()]
        if "distractors" in d:
            lines += [f"- `{o['tag']}` · `{o.get('expr',o.get('value',''))}`" for o in d["distractors"]]
        lines += [""]
    return "\n".join(lines)

REVIEW_FORMS = {
    "moment of force": ["ඝූර්ණය", "සූර්ණය"], "moment of inertia": ["අවස්ථිති ඝූර්ණය", "අවස්ථිති සූර්ණය"],
    "partial pressure": ["අර්ධ පීඩනවලට", "ආංශික පීඩනවලට"],
    "adiabatic": ["ස්ථිරතාපී", "අනුෂ්ණීය"],
    "potential divider": ["විභව බෙදුම් පරිපථය", "විභව බෙදුම්කරය"],
    "mechanical beam": ["බාල්කය", "කදම්භය (light beam, different sense)"],
    "resultant force": ["සම්ප්‍රයුක්ත බලය", "බල සම්ප්‍රයුක්තය", "නිතැඹ බලය (review advises against substitution)"],
    "projectile": ["ප්‍රක්ෂිප්තය", "ප්‍රක්ෂේපණය (projection, different sense)"],
    "ideal gas": ["පරිපූර්ණ වායුව", "පරිසූර්ණ"],
    "power": ["ජවය", "ක්ෂමතාව", "විද්‍යුත් බලය (ambiguous)"],
    "electromotive force": ["විද්‍යුත් ගාමක බලය", "වි.ගා.බ.", "වි.ගා."],
}

def term_index(hits):
    rows = []
    for name in sorted(set(hits) | set(RECOMMENDATIONS),key=str.casefold):
        pref = RECOMMENDATIONS.get(name)
        families = []
        for i, forms in sorted(hits.get(name, {}).items()):
            families.append(dict(family=i, forms={k:sorted(v) for k,v in sorted(forms.items())}))
        rows.append(dict(english=name, preference=pref[2] if pref else "teacher to decide",
                         review_line=pref[0] if pref else None, review_forms=REVIEW_FORMS.get(name,[]), families=families))
    return rows

def editorial_ranking(index):
    ranking = []
    for t in index:
        name = t["english"]
        families = {f["family"]:{loc.split(" ",1)[1].split("/")[0]
                    for locs in f["forms"].values() for loc in locs} for f in t["families"]}
        if name in REVIEW_ALTERNATES:
            targets = REVIEW_ALTERNATES[name] & families.keys()
        elif t["review_line"] or len(families)<2:
            continue
        else:
            dominant = min(families,key=lambda i:(-len(families[i]),i))
            targets = families.keys()-{dominant}
        ids = sorted(set().union(*(families[i] for i in targets)))
        if ids:
            ranking.append(dict(term=name,affected_records=len(ids),ids=ids,
                                reason="review recommends another form" if t["review_line"] else "competing usage; see the proposed decision"))
    return sorted(ranking,key=lambda r:(-r["affected_records"],r["term"]))

def term_sheet(index, records):
    lines = ["# English → Sinhala term concordance", "",
             "The family rows contain exact spellings, including endings, followed by every matching authored field. A family groups inflections of the same expression. The source, record ID and item-relative JSON Pointer identify each occurrence. A repeated use in one field has one location. The JSON also gives the source file and item pointer. Skill names are indexed separately below.",
             "", "Preferences cite the terminology review or the resource counts in decisions.csv. A form can be recommended without appearing in the cards. Shorter abbreviations and contextual synonyms can be legitimate. The teacher can confirm or change the proposed term.", ""]
    lines += ["## First ten terminology decisions", "",
              "Ranked by distinct records using a form the review would change. For an unresolved pair, count records using a less widespread family. A skill label counts as one record. Break ties by English term. Approved abbreviations and accepted pairs remain in the concordance.", "",
              "| Term | Records | Basis |", "|---|---:|---|"]
    for r in editorial_ranking(index)[:10]:
        lines.append(f"| {r['term']} | {r['affected_records']} | {r['reason']} |")
    lines += [""]
    for t in index:
        line=t["review_line"]
        cite=f" [Terminology review, line {line}](../2026-11-19-sinhala-terminology.md#L{line})" if line else ""
        lines += ["## "+t["english"],"",t["preference"].rstrip(".")+"."+cite,""]
        if t["review_forms"]:
            lines += ["Forms discussed by the review: "+" · ".join(t["review_forms"]), ""]
        for fam in t["families"]:
            for form,where in fam["forms"].items():
                lines.append(f"- {form} · family {fam['family']+1} · "+", ".join(f"`{s}`" for s in where))
        if not t["families"]: lines.append("No matching authored field.")
        lines += [""]
    lines += ["## Complete skill labels", "", "Phrase-level preferences stay with the teacher except where the cited review explicitly covers the label.", ""]
    for r in records:
        if r["group"]=="skills":
            p = r["fields"]["/name_si"]
            lines += [f"- {p.en} → {p.si} · `{loc(r,p.field)}`"]
    return "\n".join(lines)+"\n"

def overview(records, report):
    flags = report["flags"]
    lines = ["# Sinhala physics review pack", "",
        "[පද තේරීම් · decisions.csv](decisions.csv) · [කාඩ්පත් · cards.csv](cards.csv)", "",
        "දුරකථනයෙන් Google Sheets වෙත ගොනුව විවෘත කර පෙළ එතීම සක්‍රිය කරන්න. මුල් පේළි දෙක උපදෙස් සඳහාය. තීරු නාම තුන්වැනි පේළියේ ඇත.", "",
        *reading_summary(records,flags), "## Unit sheets", "",
        "For full feedback and repair links, use the unit sheets. Each draft shows both languages, every option, the proposed key, feedback and the harder questions it repairs. The appendix gives each harder question once. Review priority measures translation risk, not physics difficulty.",
        "", "| Unit | v2 items | Draft cards | v2 flags¹ | Draft flags | Drafts with flags |",
        "|---|---:|---:|---:|---:|"]
    for unit in UNITS.values():
        rs = [r for r in records if r["unit"] == unit and r["group"] != "skills"]
        fs = [f for f in flags if f["unit"] == unit]
        sizes = Counter(r["edition"] for r in rs)
        counts = Counter(f["edition"] for f in fs)
        affected = len({f["id"] for f in fs if f["edition"] == "draft"})
        lines.append(f"| [{unit.title()}]({unit}.md) | {sizes['v2']} | {sizes['draft']} | {counts['v2']} | {counts['draft']} | {affected} |")
    labels = sum(r["group"]=="skills" for r in records)
    lines += ["", f"¹ v2 flags include {labels} skill labels. Flags count distinct findings per field. Repeated feedback in two fields counts twice. Term-location counts use distinct records or fields as indicated.", "",
        f"[English → Sinhala terms and locations](terms.md) · [Machine-readable evidence](flags.json) · [Proposed edits](proposed.patch)", "",
        "## Findings", "", "| Flag | v2 | Drafts | Total |", "|---|---:|---:|---:|"]
    counts = Counter((f["kind"], f["edition"]) for f in flags)
    for k, total in sorted(report["counts_by_kind"].items(), key=lambda x:(-x[1], x[0])):
        lines.append(f"| {k} | {counts[k,'v2']} | {counts[k,'draft']} | {total} |")
    lines += ["", "The term index opens with the ten highest-volume decisions. The review recommends ඝූර්ණ for moments. Keep ව්‍යාවර්ත for torque. A prevalent spelling does not establish a preferred term.",
        "", "In phy.elec.c091 the English feedback names the matched resistor. The Sinhala points back to “that resistor”. Both feedback locations are flagged. In phy.therm.c073 a teacher should check whether the wording makes the container’s initial temperature clear enough. The four untranslated “so” connectors are in worked explanations.",
        "", "## Scope and reading the results", "",
        "- Inputs are authored v2 cards, pools, templates, statement banks, skill names and the draft branch’s cards and repair links. Numerical variants are represented by their source templates. Shared formulae, diagram assets and app UI are separate from translated prose.",
        "- The term catalog combines the independent review, observed bilingual expressions and candidate pairs identified using the local glossary cited by the review. A dictionary entry alone does not establish usage. The concordance records exact Sinhala surfaces in the inputs, including inflections. Some short roots use English context to distinguish senses. Review-only spellings are identified separately.",
        "- The teacher can confirm the review recommendations and the proposals backed by print counts. Standalone abbreviations, full names and synonymous expressions can all be legitimate. Nonpreferred wording in a proposed wrong answer may be intentional.",
        "- P3 covers possible changes to a question, option, number or placeholder. P2 covers conditions, symbols, language leakage and specific editorial recommendations. P1 covers notation and unresolved variations. A teacher should read the bilingual text even for cards with zero flags.",
        "- Numeric checks compare literals, signed values, unit bindings, common multipliers and explicit assignments. Condition and option checks use bilingual cues, option collisions, formula order and polarity. These checks cannot prove semantic equivalence, identify every paraphrase or interpret a diagram. All bilingual fields remain in the JSON for those judgments.",
        "- Sinhala conjuncts with a virama and ZWJ are valid. Suspect join-control positions are reported with character offsets. Symbols, variables, units and figure labels are allowed in Sinhala. The §5.7 language rules distinguish content words from notation. The authoring spec calls for a decimal point. The living §5.2 leaves point versus middle dot open. A comma between digits needs context.",
        "", "[Authoring spec §§5.2 and 5.7](../../../content/authoring-spec.md) · [Living authoring guide](../../living/content-authoring.md)",
        "", "## Reproduce offline", "", "From the repository root:", "", "```sh",
        "python3 content/tools/sinhala-check.py", "python3 -B -m unittest discover -s content/tools", "```", "",
        f"The default reads the terminology review from the primary worktree and the drafts via git show. The draft commit for this pack is `{report['draft_commit']}`. Use `--draft-ref <commit> --review <path> --out <directory>` for a pinned rerun elsewhere. Input digests are in flags.json. The untracked review must be supplied separately on a new clone.",
        "", "The patch contains selected proposals across both source trees. It needs the v2 files and draft files at their recorded versions. The test runs `git apply --check` against those blobs in a temporary directory. No proposal is applied.", ""]
    return "\n".join(lines)

def build(args):
    if args.review:
        review = args.review
    else:
        # The independent review is untracked in the primary checkout. Only read it.
        primary = git("worktree","list","--porcelain").splitlines()[0].removeprefix("worktree ")
        review = Path(primary)/REVIEW
    raw_review = review.read_bytes()
    terms = load_terms(raw_review.decode().splitlines())
    ref,files,records = read_inputs(args.draft_ref)
    hits,flags,conflicts = audit(records,terms)
    apply_readings(records, flags)
    index = term_index(hits)
    configure_terms(index)
    counts=dict(sorted(Counter(f["kind"] for f in flags).items()))
    for k in PRIORITY: counts.setdefault(k,0)
    report = dict(
        draft_commit=ref, review_path=REVIEW, review_sha256=hashlib.sha256(raw_review).hexdigest(),
        source_sha256={p:hashlib.sha256(raw.encode()).hexdigest() for p,(raw,_,_) in sorted(files.items())},
        counts_by_kind=counts, counts_by_edition=dict(Counter(f["edition"] for f in flags)),
        records=[{**{k:v for k,v in r.items() if k not in ("fields","item")},
                  "bilingual_fields":[vars(p) for p in r["fields"].values()]} for r in records],
        flags=flags, terms=index, competing_forms=conflicts, ranked_term_conflicts=editorial_ranking(index))
    output=args.out
    output.mkdir(parents=True,exist_ok=True)
    write_sheets(output,records,flags,index)
    (output/"README.md").write_text(overview(records,report))
    for unit in UNITS.values(): (output/(unit+".md")).write_text(teacher_sheet(unit,records,flags))
    (output/"terms.md").write_text(term_sheet(index,records))
    (output/"flags.json").write_text(dump(report))
    # Build from the untouched input text only after rendering the as-authored sheets.
    (output/"proposed.patch").write_text(patch(files,records))
    print(f"{len(index)} terms; {len(flags)} flags. "+json.dumps(counts,sort_keys=True))

def main():
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--draft-ref",default="content-easy-card-drafts")
    cli.add_argument("--review",type=Path,help="independent terminology review (default: primary checkout)")
    cli.add_argument("--out",type=Path,default=OUT)
    build(cli.parse_args())

if __name__=="__main__":
    main()
