"""Recorded bilingual readings and the phone-sized decision sheets."""
from collections import Counter, defaultdict
import csv
import hashlib
import json
from pathlib import Path

from sinhala_resources import ROOTS

HERE = Path(__file__).parent
SCREEN_KINDS = {"negation-check", "comparison-check", "number-word-check", "direction-check"}
RESOURCE_CHOICES = {
    "zero": ("ශූන්‍ය", "Use the long vowel consistently. The readable books favour it. The papers favour the short vowel."),
    "rate": ("ශීඝ්‍රතාව", "Use the ශ spelling. Both occur in the syllabus. Books and papers favour ශ."),
    "potential difference / voltage": ("විභව අන්තරය (p.d.) / වෝල්ටීයතාව (voltage)", "Use the first when asking for a difference between two points. Keep the second for voltage labels. Both are used in print."),
    "Newton (name)": ("නිව්ටන්", "The compact spelling occurs more often in the syllabus and the books."),
    "symmetry": ("සමමිති", "Use this root for the noun and its inflections. It occurs in both books and papers."),
    "hinge": ("අසව්ව", "Use the අසව් root. Two paper passages support it. The printed evidence is sparse."),
    "moment of force": ("ඝූර්ණය", "Use the syllabus spelling for moment. Keep the separate name for torque."),
}
PACK_CHOICES = {
    "apparent weight": "දෘශ්‍ය බර (introduce as the scale reading).",
    "work done": "කළ කාර්යය (short label). කරන ලද කාර්යය is also grammatical.",
    "insulated": "පරිවාරිත (label). Use පරිවාරණය කළ in a sentence.",
    "circular motion": "වෘත්ත චලිතය (short label). Both forms describe a circular path.",
    "final velocity": "අවසාන ප්‍රවේගය (label). අවසන් is also grammatical.",
    "terminal potential difference": "අග්‍ර විභව අන්තරය (label). Use අග්‍ර අතර විභව අන්තරය when explaining the measurement.",
}

def load(name):
    return json.loads((HERE/name).read_text(encoding="utf-8"))

def apply_readings(records, flags):
    ledger = {r["id"]:r for r in load("sinhala-reading.json")}
    signals = load("sinhala-signal-readings.json")
    for r in records:
        if r["group"] == "skills":
            continue
        digest = hashlib.sha256(json.dumps(r["item"],ensure_ascii=False,sort_keys=True,separators=(",",":")).encode()).hexdigest()
        row = ledger.get(r["id"], {})
        if row.get("sha256") != digest:
            r["meaning_read"] = "needs reread"
            continue
        r["meaning_read"] = row["verdict"]
        for d in row.get("differences",[]):
            p = r["fields"][d["field"]]
            flags.append(dict(unit=r["unit"],edition=r["edition"],id=r["id"],field=p.field,kind="meaning-read",
                              priority=3,message=d["difference"],en=p.en,si=p.si))
    pending = {r["id"] for r in records if r.get("meaning_read") == "needs reread"}
    for f in flags:
        if f["kind"] in SCREEN_KINDS:
            payload = [f["en"],f["si"],f["kind"],f["message"]]
            key = hashlib.sha256(json.dumps(payload,ensure_ascii=False).encode()).hexdigest()
            reading = signals.get(key) if f["id"] not in pending else None
            f["screen_read"] = reading or {"verdict":"needs reread","note":"Read the new wording in context."}

def configure_terms(index):
    corpus = load("sinhala-resource-evidence.json")
    for t in index:
        name = t["english"]
        if name in RESOURCE_CHOICES:
            proposal,why = RESOURCE_CHOICES[name]
            # Include zero counts for both competing forms in every collection.
            parts = []
            for category in ("syllabus","papers","books"):
                docs = [r for r in corpus if r["category"]==category]
                counts = Counter()
                for doc in docs:
                    counts.update({word:hit["count"] for word,hit in doc["hits"].items()})
                parts.append(category+" "+", ".join(f"{form} {counts[form]}" for form in ROOTS[name]))
            t.update(proposal=proposal,evidence=why+" "+" · ".join(parts))
        elif name in PACK_CHOICES:
            t.update(proposal=PACK_CHOICES[name],evidence=("Terminology review, line 41. Confirm classroom familiarity with the attested label." if name=="apparent weight" else "Both constructions occur in the pack. The short form is proposed for labels."))
        elif t["review_line"]:
            t.update(proposal=t["preference"],evidence=f"Terminology review, line {t['review_line']}.")
        if "proposal" in t and "teacher to decide" not in t["proposal"]:
            t["preference"]=t["proposal"]+" (proposed — teacher confirms)"
        elif not t["review_line"] and len(t["families"]) < 2:
            t["preference"]="Attested in this pack"

TEACHING_NOTES = {
    "phy.elec.c060": "The question gives away the series resistor's 2 Ω contribution. Ask for a quantity the student must work out.",
    "phy.therm.c091": "Clarify whether counting the adhering water is an experimental error or a correct step.",
    "phy.elec.c067": "Say whether the output resistance is known. The current alone does not determine the output voltage.",
}

def write_csv(file, instructions, header, rows):
    # UTF-8 BOM lets desktop Excel open Sinhala directly. Sheets accepts it.
    with file.open("w",newline="",encoding="utf-8-sig") as stream:
        writer=csv.writer(stream,lineterminator="\n")
        writer.writerows([[sentence] for sentence in instructions])
        writer.writerow(header)
        writer.writerows(rows)

def write_sheets(output, records, flags, terms):
    decisions=[]
    for t in terms:
        if "proposal" not in t and len(t["families"]) < 2:
            continue
        groups=t["families"]
        ids={loc.split(" ",1)[1].split("/",1)[0] for group in groups for locs in group["forms"].values() for loc in locs}
        # Use the family roots for decisions and leave declined spellings in the concordance.
        forms=list(dict.fromkeys([next(iter(f["forms"])) for f in groups]+t["review_forms"]))
        if t["english"] in RESOURCE_CHOICES:
            forms=list(ROOTS[t["english"]])
        decisions.append([t["english"]," / ".join(forms),t["preference"],t.get("evidence","Competing forms in the pack."),len(ids),"",""])
    write_csv(output/"decisions.csv",["එක් පේළියක පදයක යෙදුම් හා යෝජිත තේරීම කියවන්න.",
              "teacher_choice තීරුවේ ඔබේ තේරීමත් note තීරුවේ අවශ්‍ය නම් හේතුවත් ලියන්න."],
              ["term_en","forms","proposed","evidence","records","teacher_choice","note"],decisions)
    by_id=defaultdict(list)
    for f in flags:
        if f["kind"]=="meaning-read":
            by_id[f["id"]].append(f["message"])
        elif f["kind"]=="review-wording":
            by_id[f["id"]].append(f["message"].split(" Review line")[0].rstrip(".")+".")
        elif f["kind"]=="condition-check":
            by_id[f["id"]].append(f["message"])
        elif f["kind"]=="untranslated-prose":
            by_id[f["id"]].append("Check the English word left in the Sinhala sentence.")
        elif f["kind"]=="term-variation":
            by_id[f["id"]].append("Check the term for "+f["message"].split(":")[0]+" in the term sheet.")
    card_rows=[]
    for r in records:
        if r["edition"] != "draft":
            continue
        item=r["item"]
        def prompt(lang):
            return "\n".join([item["text"][lang]]+[f"{i}. {o['text'][lang]}" for i,o in enumerate(item["options"],1)]+[item["explanation"][lang]])
        key = next(f"{i}. {o['text']['en']} / {o['text']['si']}" for i,o in enumerate(item["options"],1) if o["correct"])
        issues=by_id[r["id"]].copy()
        if r["id"] in TEACHING_NOTES: issues.insert(0,TEACHING_NOTES[r["id"]])
        if r["meaning_read"]=="needs reread": issues.insert(0,"Read both versions. This wording has changed since the review.")
        card_rows.append([r["id"],r["unit"],prompt("en"),prompt("si"),key," ".join(dict.fromkeys(issues)),"",""])
    differing_ids={f["id"] for f in flags if f["kind"]=="meaning-read"}
    card_rows.sort(key=lambda x:(x[1],x[0] not in TEACHING_NOTES and x[0] not in differing_ids,not bool(x[5]),x[0]))
    write_csv(output/"cards.csv",["පිළිතුර බැලීමට පෙර සිංහල ප්‍රශ්නය කියවා ඔබේ පිළිතුර තෝරන්න.",
              "teacher_verdict තීරුවේ ok / fix-sinhala / fix-physics / drop ලියන්න. අවශ්‍ය වෙනස note තීරුවේ ලියන්න."],
              ["id","unit","english","sinhala","key","problems","teacher_verdict","note"],card_rows)

def reading_summary(records, flags):
    reviewed=[r for r in records if r["group"]!="skills"]
    counts=Counter(r["meaning_read"] for r in reviewed)
    differences=[f for f in flags if f["kind"]=="meaning-read"]
    signals=Counter(f["screen_read"]["verdict"] for f in flags if "screen_read" in f)
    lines=["## Bilingual reading","",f"Read judgments cover {counts['same']} records marked same and {counts['differs']} marked differs. {counts['needs reread']} await a new reading. The {len(differences)} field findings below include changes in a condition, a comparison or a cue to the answer. A difference need not change the keyed answer.","",
           "The word checks and the bilingual read are separate. For example, “does not change” can mean “stays the same”. The four word checks compare negation cues, fractions and multipliers, directions, and comparisons. They cannot reliably attach a word to the right quantity, infer a missing assumption, or judge a diagram. A zero count is only a count of matches.","",
           f"Of {sum(signals.values())} word-check alerts, {signals['difference']} identify a wording difference, {signals['equivalent']} are false alarms, and {signals['terminology only']} concern terminology alone. {signals['needs reread']} await review. Each alert in the JSON gives the reason.",""]
    by_id=defaultdict(list)
    for f in differences: by_id[f["id"]].append(f["message"])
    first = ["phy.elec.b01","phy.mech.c078","phy.mech.c061","phy.elec.c086","phy.mech.c009"]
    ordered = [key for key in first if key in by_id]+sorted(by_id.keys()-set(first))
    for key in ordered:
        lines.append(f"- **{key}**. "+" ".join(by_id[key]))
    lines+=["", "## Printed terminology evidence","",
            "Counts are matched roots, including inflections. The evidence covers one Sinhala syllabus, the text layers of four of seven NIE resource books and 37 readable mirror exam parts. Seven Department of Examinations files and three books have no usable Sinhala text layer for this search. Missing text and unrecognised legacy glyphs can hide occurrences. The counts are lower bounds. Papers can favour a different spelling from books, particularly for zero. The p.d. and voltage totals include different contexts.","",
            "To repeat the count, run `python3 content/tools/sinhala_resources.py /path/to/resources`. Compare its JSON with the saved evidence. The files with no usable text layer are listed there too.","",
            "[Per-PDF counts and first matching PDF pages](../../../content/tools/sinhala-resource-evidence.json) · [Offline recount script](../../../content/tools/sinhala_resources.py)", ""]
    return lines
