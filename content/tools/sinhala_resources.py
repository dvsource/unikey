"""Recount the selected Sinhala physics roots in local PDFs with Poppler.

Run: python3 content/tools/sinhala_resources.py /path/to/resources > evidence.json
Each form counts occurrences of its root, including inflections. See the
selected PDF paths, extractable page counts and first page hit in the output.
"""
import argparse
import json
from pathlib import Path
import re
import subprocess

# Legacy embedded-font glyph sequences, alongside native Unicode roots.
ROOTS = {
    "moment of force": {"ඝූර්ණ": r">Q¾K|ඝූර්ණ", "සූර්ණ": r"iQ¾K|සූර්ණ"},
    "zero": {"ශූන්‍ය": r"Y\+kH|ශූන්‍?ය", "ශුන්‍ය": r"Y=kH|ශුන්‍?ය"},
    "rate": {"ශීඝ්‍රතාව": r"YS>%;|ශීඝ්‍?රත", "සීඝ්‍රතාව": r"iS>%;|සීඝ්‍?රත"},
    "potential difference / voltage": {
        "විභව අන්තරය": r"úNj\s+wka;r|විභව\s*අන්තර",
        "වෝල්ටීයතාව": r"fjda,aàh;|වෝල්ටීයත"},
    "Newton (name)": {"නිව්ටන්": r"ksõgka|නිව්ටන්", "නිවුටන්": r"ksjqgka|නිවුටන්"},
    "symmetry": {"සමමිති": r"iuñ;|සමමිති", "සම්මිති": r"iïñ;|සම්මිති"},
    "hinge": {"අසව්": r"wiõ|අසව්", "අසවු": r"wijq|අසවු"},
}
COLLECTIONS = {
    "syllabus": ["nie/physics/si/syllabus/*.pdf"],
    "papers": ["doe/physics/si/past-papers/*.pdf", "mirror-epapers/physics/si/*.pdf"],
    "books": ["nie/physics/si/resource-books/*.pdf"],
}

def extract(root):
    rows = []
    for category, globs in COLLECTIONS.items():
        for p in sorted(p for g in globs for p in root.glob(g)):
            text = subprocess.check_output(["pdftotext","-layout",str(p),"-"], stderr=subprocess.DEVNULL).decode()
            pages = text.rstrip("\f").split("\f")
            # Common physics vocabulary signals a usable Sinhala text layer.
            readable = [i for i,page in enumerate(pages,1) if re.search(r"(?:(?:iy|jk|fõ|fuu|úoH|m%|w;r|;=|n,h)\b|[අ-෴]{3})",page)]
            hits = {}
            for forms in ROOTS.values():
                for form,pattern in forms.items():
                    counts = [(i,len(re.findall(pattern,page))) for i,page in enumerate(pages,1)]
                    found = [(i,n) for i,n in counts if n]
                    if found:
                        hits[form] = {"count":sum(n for _,n in found), "first_pdf_page":found[0][0]}
            rows.append(dict(category=category,pdf=str(p.relative_to(root)),pages=len(pages),
                             pages_with_text_cues=len(readable),hits=hits))
    return rows

if __name__ == "__main__":
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument("resources",type=Path)
    print(json.dumps(extract(cli.parse_args().resources),ensure_ascii=False,indent=2))
