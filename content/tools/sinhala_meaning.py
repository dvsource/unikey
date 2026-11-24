"""Screen bilingual propositions for differences a reader should examine."""
import re
from collections import Counter

# Match fractions before their component words. Preserve repeated multipliers.
NUMBERS = [
    ("two thirds", r"two[ -]thirds|two of three parts", r"තුනෙන්\s*දෙක"),
    ("one third", r"(?:one|a)[ -]third(?![ -]law)", r"තුනෙන්\s*එක|තුනෙන්\s*පංගුව"),
    ("three quarters", r"three[ -]quarters", r"(?:හතරෙන්|හතරින්)\s*තුන"),
    ("one quarter", r"(?:one|a)[ -]quarter|one[ -]fourth|quarter(?![ -]turn)", r"(?:හතරෙන්|හතරින්|සතරෙන්)\s*එක|කාලක්"),
    ("half", r"half|halv(?:e[ds]?|ing|es)", r"අඩක්|අඩක|අඩකි|අඩ(?=$|[ .,?!])|අර්ධ"),
    ("double", r"twice|twofold|two times|doubl(?:e[ds]?|ing)", r"දෙ\s*ගුණ"),
    ("triple", r"threefold|three times|tripl(?:e[ds]?|ing)", r"තුන්\s*ගුණ|තෙගුණ"),
]
POLARITIES = [
    ("direction-check", "inwards / outwards", r"inwards?|inwardly|inside|points? in|into the page", r"outwards?|outwardly|outside|points? out|out of the page", r"ඇතු[ළල]ට|අභ්‍යන්තරයට|තුළට", r"පිටතට|ඉවතට"),
    ("direction-check", "up / down", r"up(?:ward)?s?|upwardly", r"down(?:ward)?s?|downwardly", r"ඉහළ|උඩට", r"පහළ|යටට"),
    ("direction-check", "left / right", r"left(?:ward)?s?", r"right(?:ward)?s?", r"වම(?:ට|්)|වම්", r"දකුණ|දකුණු"),
    ("comparison-check", "larger / smaller", r"larger|greater|bigger|more|higher|heavier|increase[ds]?|increasing|rises?",
     r"smaller|less|lower|lighter|decrease[ds]?|decreasing|falls?", r"වැඩි|විශාල", r"අඩු|කුඩා"),
    ("comparison-check", "same / different", r"same|equal(?:ly)?", r"different|differ(?:s)?|unequal", r"එකම|(?<!අ)සමාන|නොවෙනස්", r"(?<!නො)වෙනස්|අසමාන"),
]

def eng(pattern, text):
    return re.findall(r"\b(?:" + pattern + r")\b", text, re.I)

def meaning_signals(en, si):
    # Fields containing identical formulae have no translated proposition.
    if en == si:
        return
    english_neg = eng(r"not|no|never|nothing|none|neither|cannot|(?:can|don|doesn|isn)['’]t|without|unchanged|unknown|negligible|ignor(?:e|ing)|unloaded|unlagged|nonzero", en)
    sinhala_neg = re.findall(r"නො|නැත|නැති|නැහැ|රහිත|තොරව", si)
    if bool(english_neg) != bool(sinhala_neg):
        yield "negation-check", "Only one language uses an explicit negative. Check what is being denied."
    a = Counter({name: len(eng(p, en)) for name,p,_ in NUMBERS})
    b = Counter({name: len(re.findall(p, si)) for name,_,p in NUMBERS})
    if +a != +b:
        def show(counts):
            return ", ".join(k if n == 1 else f"{k} ×{n}" for k,n in counts.items() if n) or "none"
        yield "number-word-check", f"Written fractions or multipliers differ. English: {show(a)}. Sinhala: {show(b)}."
    # A speed can be low in both sections even if it is higher in one.
    if eng(r"faster|slower|more slowly", en) and re.search(r"වේගයෙන්|සෙමින්|වේගවත්|ඉක්මන්",si) and not re.search(r"වඩා|වැඩි වේග|අඩු වේග",si):
        yield "comparison-check", "English compares speeds. Check whether Sinhala only calls one speed fast or slow."
    # Bare direction labels are common answer options. In longer prose “in”
    # is usually a preposition, so only match it as part of a direction phrase.
    direction_text = en.strip().lower().strip(" .!?")
    for kind, label, pos, neg, spos, sneg in POLARITIES:
        e = (bool(eng(pos,en)), bool(eng(neg,en)))
        if label == "inwards / outwards" and direction_text in ("in","out"):
            e = (direction_text == "in", direction_text == "out")
        s = (bool(re.search(spos,si)), bool(re.search(sneg,si)))
        # Compare both poles when both texts use a recognised construction.
        # Requiring an opposing cue avoids treating every spatial 'in' as a vector.
        if any(e) and any(s) and e != s:
            yield kind, f"Check which quantity or direction the words for {label} describe."
