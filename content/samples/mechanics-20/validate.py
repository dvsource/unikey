#!/usr/bin/env python3
"""Validator for content authoring spec v0.5. Reads items.json, expands templates and banks,
runs checks V1–V14, draws figures, and writes variants.json and review.md.

Usage: python3 validate.py [path/to/alphysics.db]
Standard library only. Exits with an error if any check fails.
"""
import itertools
import json
import math
import re
import sqlite3
import sys
import zlib
import random
from collections import Counter
from fractions import Fraction
from pathlib import Path

HERE = Path(__file__).parent
DEFAULT_DB = Path.home() / "Work/ALPhysics/db/alphysics.db"
SPEC_TAGS = Path(__file__).resolve().parents[3] / "docs/living/content-authoring.md"

MIN_GAP, MAX_REPEAT, MIN_VARIANTS, MAX_POSITION, MAX_GRID_ANSWER = 0.05, 0.2, 20, 0.6, 0.3
GRID_OPTIONS = ["A only", "A and B only", "A and C only", "B and C only", "A, B and C"]
GRID_OPTIONS_SI = ["A පමණි", "A සහ B පමණි", "A සහ C පමණි", "B සහ C පමණි", "A, B සහ C සියල්ල"]
GRID_SETS = [{"A"}, {"A", "B"}, {"A", "C"}, {"B", "C"}, {"A", "B", "C"}]
MAX_OPTION_RATIO = 10  # V9: 89 of 95 real numeric questions stay within this range of the answer
DETAIL_TAGS = {"ignored-condition", "wrong-quantity", "stopped-early", "wrong-law", "misread-interval"}  # too general without a specific message
GLOSSARY = Path.home() / "Work/ALPhysics/glossary/en-si-ta-physics-terms.csv"
# Where the glossary's Sinhala is the wrong sense or spelling here. Each one needs teacher confirmation.
TERM_OVERRIDES = {
    "beam": "බාල්ක", "lift": "සෝපාන", "slope": "ආනත|බෑවුම|තලය", "projectile": "ප්‍රක්ෂිප්ත", "torque": "ව්‍යාවර්ත", "constant torque": "නියත ව්‍යාවර්ත",
    "collision": "ගැටී|ගැටුම", "energy conservation": "ශක්ති සංස්ථිති", "uniform acceleration": "ඒකාකාර ත්වරණ|නියත ත්වරණ",
    "couple": None, "normal": None, "reaction": "ප්‍රතික්‍රියා", "support": "ආධාරක", "track": "ධාවන පථ", "time": "කාල", "sound": "ශබ්ද",
    "work": "කාර්ය", "direction": "දිශා", "weight": "බර", "disc": "තැටි", "spring": "දුනු|දුන්න", "impulse": "ආවේග", "speed": "වේග", "velocity": "ප්‍රවේග", "force": "බල",
    "load": "පැටව|පැටවුම", "gravity": "ගුරුත්ව", "rotation": "භ්‍රමණ", "rod": "දණ්ඩ", "ring": "මුද්", "wheel": "රෝද", "energy": "ශක්ති", "moment": "සූර්ණ", "mass": "ස්කන්ධ",
    "inertia": "අවස්ථිති", "power": "ජව|බල", "friction": "ඝර්ෂණ", "acceleration": "ත්වරණ", "displacement": "විස්ථාපන", "momentum": "ගම්‍යතා", "gradient": "අනුක්‍රමණ",
    "graph": "ප්‍රස්තාර", "resultant": "සම්ප්‍රයුක්ත", "axis": "අක්ෂ", "radius": "අරය|අරක", "tension": "ආතති", "distance": "දුර", "unit": "ඒකක", "heat": "තාප", "dimensions": "මාන",
}
WORD_LIMIT = {"L1": 40, "L2": 40, "L3": 40, "L4": 70}
ERRORS = []
GLOSSARY_MISSES = []


def fail(message):
    ERRORS.append(message)


def N(x):
    """Format a number to at most 3 significant figures."""
    if x == 0:
        return "0"
    x = float(x)
    r = round(x, 2 - math.floor(math.log10(abs(x))))
    return f"{r:f}".rstrip("0").rstrip(".")


def close(a, b):
    return math.isclose(float(a), float(b), rel_tol=1e-9, abs_tol=1e-9)


def exact(x):
    return x == 0 or close(x, round(float(x), 2 - math.floor(math.log10(abs(float(x))))))


# ---------- Independent helpers for verify relations ----------
def res_range(a, b):
    return [math.hypot(a + b * math.cos(math.radians(t)), b * math.sin(math.radians(t))) for t in range(181)]


def step_average(v1, t1, v2, t2, n=4000):
    total = t1 + t2
    return sum((v1 if (i + 0.5) * total / n < t1 else v2) * total / n for i in range(n)) / total


def ramp_area(F, t1, t2, n=4000):
    total = t1 + t2
    return sum(min(F, F * (i + 0.5) * (total / n) / t1) * (total / n) for i in range(n))


def bounce_height(h0, k, n, g):
    speed = math.sqrt(2 * g * h0)
    for _ in range(n):
        speed *= k
    return speed ** 2 / (2 * g)


def frac(x):
    return str(Fraction(x).limit_denominator(100))


def sup(n):
    return str(n).translate(str.maketrans("0123456789", "⁰¹²³⁴⁵⁶⁷⁸⁹"))


def nice(x, places=1):
    return close(x, round(float(x), places))


NUMERIC_ENV = dict(
    sqrt=math.sqrt, cos=math.cos, sin=math.sin, radians=math.radians, abs=abs, int=int, Fraction=Fraction,
    res_min=lambda a, b: min(res_range(a, b)) - 1e-6, res_max=lambda a, b: max(res_range(a, b)) + 1e-6,
    approx=lambda a, b: math.isclose(float(a), float(b), rel_tol=1e-9), step_average=step_average, ramp_area=ramp_area, bounce_height=bounce_height, frac=frac, sup=sup, nice=nice,
)


def ev(expr, env):
    return eval(expr, {"__builtins__": {}}, {**NUMERIC_ENV, **env})


def fill(text, env):
    def sub(m):
        v = ev(m.group(1), env)
        return v if isinstance(v, str) else N(v)
    return re.sub(r"\{([^{}]+)\}", sub, text)


# ---------- V1: dimension check ----------
BASE = {"kg": {"M": 1}, "m": {"L": 1}, "s": {"T": 1}, "N": {"M": 1, "L": 1, "T": -2}, "J": {"M": 1, "L": 2, "T": -2}, "W": {"M": 1, "L": 2, "T": -3}}


class Dim:
    def __init__(self, exps=None):
        self.e = {k: v for k, v in (exps or {}).items() if v}

    def _mul(self, other, sign):
        o = other.e if isinstance(other, Dim) else {}
        return Dim({k: self.e.get(k, 0) + sign * o.get(k, 0) for k in set(self.e) | set(o)})

    def __mul__(self, other):
        return self._mul(other, 1)

    __rmul__ = __mul__

    def __truediv__(self, other):
        return self._mul(other, -1)

    def __rtruediv__(self, other):
        return Dim({k: -v for k, v in self.e.items()})

    def __pow__(self, p):
        return Dim({k: v * p for k, v in self.e.items()})

    def __add__(self, other):
        o = other.e if isinstance(other, Dim) else {}
        if self.e != o:
            raise ValueError(f"adding {self.e} to {o}")
        return self

    __radd__ = __sub__ = __rsub__ = __add__

    def __neg__(self):
        return self


def parse_dim(unit):
    d = Dim()
    for token in unit.split():
        if token == "1":
            continue
        base, _, power = token.partition("^")
        d = d * (Dim(BASE[base]) ** int(power or 1))
    return d


def check_dimensions(t, values):
    answer = t["answer"]
    if answer.get("dim_skip"):
        return
    env = {}
    for name, spec in t["params"].items():
        env[name] = parse_dim(spec["unit"]) if spec.get("unit") not in (None, "1") else values[name]
    env.update({k: parse_dim({"g": "m s^-2", "pi": "1"}[k]) if k == "g" else v for k, v in t["constants"].items()})
    denv = dict(NUMERIC_ENV, sqrt=lambda x: x ** 0.5 if isinstance(x, Dim) else math.sqrt(x))
    for name, expr in t.get("derived", {}).items():
        env[name] = eval(expr, {"__builtins__": {}}, {**denv, **env})
    got = eval(answer["expr"], {"__builtins__": {}}, {**denv, **env})
    want = parse_dim(answer.get("dim", "1"))
    if (got.e if isinstance(got, Dim) else {}) != want.e:
        fail(f"{t['id']}: V1 answer has dimensions {getattr(got, 'e', {})}, expected {want.e}")


# ---------- Template expansion ----------
def relation_holds(rel, env):
    if "==" in rel and " if " not in rel:
        lhs, rhs = rel.split("==", 1)
        a, b = ev(lhs, env), ev(rhs, env)
        return math.isclose(float(a), float(b), rel_tol=1e-3, abs_tol=1e-6)
    return bool(ev(rel, env))


def expand_template(t):
    names = list(t["params"])
    rng = random.Random(zlib.crc32(t["id"].encode()))
    symbolic = t["form"] == "F41" and t.get("exact") != "fraction"
    sets = [t["params"][n]["set"] for n in names]
    variants, first = [], True
    for combo in itertools.product(*sets):
        values = dict(zip(names, combo))
        env = {**t["constants"], **values}
        for name, expr in t.get("derived", {}).items():
            env[name] = ev(expr, env)
        if any(ev(c, env) for c in t.get("exclude", [])):
            continue
        answer = ev(t["answer"]["expr"], env)
        env["answer"] = answer
        if not all(ev(c, env) for c in t.get("constraints", [])):
            continue
        if not symbolic and t.get("exact") != "fraction" and not exact(answer):
            continue
        check_env = {**env, **t.get("verify_given", {})}
        for rel in t["verify"]:
            if not relation_holds(rel, check_env):
                fail(f"{t['id']}: V1 failed {rel} for {values}")
        if first:
            check_dimensions(t, values)
            first = False

        def display(value, spec):
            if "display" in spec:
                return fill(spec["display"], {**env, "value": value})
            return (N(value) + " " + t["answer"]["unit"]).strip()

        right = display(answer, t["answer"])
        chosen, seen, kept, tags = [], {right}, [float(answer)], set()
        pool, listed = [], {right}
        for d in t["distractors"]:  # a value keeps the tag listed first, so its label never changes between variants
            shown = display(ev(d["expr"], env), d)
            if shown not in listed:
                listed.add(shown)
                pool.append(d)
        rng.shuffle(pool)
        for d in pool:
            if d["tag"] in tags and not t.get("shared_tags"):
                continue
            value = ev(d["expr"], env)
            is_zero = d["expr"] == "0"
            if not symbolic and t.get("exact") != "fraction" and not is_zero and value > 0 and not 1 / MAX_OPTION_RATIO <= float(value) / float(answer) <= MAX_OPTION_RATIO:
                continue
            if not symbolic:
                if value < 0 or (value == 0 and not is_zero):
                    continue
                if not is_zero and t.get("exact") != "fraction" and not exact(value):
                    continue
                if any(abs(float(value) - k) < MIN_GAP * max(float(value), k) for k in kept):
                    continue
            shown = display(value, d)
            if shown in seen:
                continue
            seen.add(shown)
            kept.append(float(value))
            tags.add(d["tag"])
            chosen.append(dict(text=shown, value=float(value), tag=d["tag"], detail=d.get("detail"), detail_si=d.get("detail_si")))
            if len(chosen) == 4:
                break
        if len(chosen) < 4:
            continue
        whole = [v == int(v) for v in kept]
        if not symbolic and ((sum(whole) == 1 and whole[0]) or (sum(whole) == 4 and not whole[0])):
            continue
        for c in chosen:  # V10
            if c["tag"] == "forgot-half" and not (close(c["value"], 2 * answer) or close(c["value"], answer / 2)):
                fail(f"{t['id']}: V10 forgot-half isn't 2× or ½× the answer for {values}")
        scenario = tuple(v for v in values.values() if isinstance(v, str))
        opts = sorted(chosen + [dict(text=right, value=float(answer), tag=None)], key=lambda o: o["value"])
        if t["option_order"] != "ascending":
            rng.shuffle(opts)
        figure = None
        if "figure" in t:
            figure = dict(engine=t["figure"]["engine"], params={k: ev(v, env) for k, v in t["figure"]["params"].items()})
        env_si = {**env, **{k: t["param_text"]["si"].get(v, v) for k, v in values.items() if isinstance(v, str)}}
        variants.append(dict(values=values, prompt=fill(t["text"]["en"], env), prompt_si=fill(t["text"]["si"], env_si), answer=right, answer_value=float(answer), scenario=scenario,
                             options=[o["text"] for o in opts], position=[o["tag"] for o in opts].index(None),
                             wrong=[dict(text=c["text"], error_tag=c["tag"], detail=c["detail"], detail_si=c["detail_si"], value=c["value"]) for c in chosen], figure=figure))
    return variants


def uses(expr, name):
    return re.search(rf"\b{name}\b", expr) is not None


def check_tag_functions(t):
    """V10: tags whose meaning can be tested against the distractor's own formula."""
    answer = t["answer"]["expr"]
    for d in t["distractors"]:
        tag, expr = d["tag"], d["expr"]
        if tag == "forgot-g" and (uses(expr, "g") or not uses(answer, "g")):
            fail(f"{t['id']}: V10 forgot-g, but {expr} doesn't drop g")
        if tag == "forgot-mu" and (uses(expr, "mu") or not uses(answer, "mu")):
            fail(f"{t['id']}: V10 forgot-mu, but {expr} doesn't drop mu")
        if tag in DETAIL_TAGS and "detail" not in d:
            fail(f"{t['id']}: {tag} needs a detail message")


def effective_variants(t, variants):
    """V7: variants that only rescale another variant count once."""
    if t["form"] == "F41" and t.get("exact") != "fraction":
        return len(variants)
    patterns = set()
    for v in variants:
        values = sorted([v["answer_value"]] + [w["value"] for w in v["wrong"]])
        patterns.add(tuple(round(x / v["answer_value"], 3) for x in values))
    return len(patterns)


def apply_template_limits(t, variants):
    # V5
    unique = {}
    for v in variants:
        unique.setdefault((v["answer"], v["scenario"], frozenset(v["options"])), v)
    variants = list(unique.values())
    rng = random.Random(zlib.crc32(t["id"].encode()) + 1)
    if len(variants) >= MIN_VARIANTS and t["option_order"] == "ascending":
        repeat_cap = max(2, MAX_REPEAT * len(variants))  # fixed at the start, or removals would shrink it and collapse the template
        while True:  # V6
            answers = {v["answer"] for v in variants}
            counts = Counter(w["text"] for v in variants for w in v["wrong"] if w["text"] not in answers and not w["text"].startswith("0 "))
            if not counts:
                break
            worst, n = counts.most_common(1)[0]
            if n <= repeat_cap:
                break
            variants.remove(rng.choice([v for v in variants if any(w["text"] == worst for w in v["wrong"])]))
        if not t.get("position_exempt"):
            balanced = list(variants)
            while balanced:  # V8
                position, n = Counter(v["position"] for v in balanced).most_common(1)[0]
                if n <= MAX_POSITION * len(balanced):
                    break
                balanced.remove(rng.choice([v for v in balanced if v["position"] == position]))
            if len(balanced) >= MIN_VARIANTS:
                variants = balanced  # otherwise it can't be balanced, and main() schedules it as cards
    return variants


def expand_bank(b):
    rng = random.Random(zlib.crc32(b["id"].encode()))
    st = b["statements"]
    if len(st) < 8 or sum(s["true"] for s in st) < 3 or sum(not s["true"] for s in st) < 3:
        fail(f"{b['id']}: a bank needs 8+ statements, with 3+ true and 3+ false")
    for s in st:
        if s["text"]["en"].startswith("It "):
            fail(f"{b['id']}: statement starts with 'It'")
    variants = []
    conflicts = [{st[i]["text"]["en"], st[j]["text"]["en"]} for i, j in b.get("conflicts", [])]
    for trio in itertools.combinations(st, 3):
        if any(pair <= {s["text"]["en"] for s in trio} for pair in conflicts):
            continue  # two statements that contradict each other would give the answer away
        trio = rng.sample(list(trio), 3)
        letters = "ABC"
        true_set = {l for l, s in zip(letters, trio) if s["true"]}
        if true_set not in GRID_SETS:
            continue
        right = GRID_OPTIONS[GRID_SETS.index(true_set)]
        wrong = []
        for option, chosen in zip(GRID_OPTIONS, GRID_SETS):
            if option == right:
                continue
            false_in = [s["tag"] for l, s in zip(letters, trio) if l in chosen and not s["true"]]
            wrong.append(dict(text=option, error_tag=false_in[0] if false_in else "missed-true-statement"))
        prompt = "\n".join(f"{l}: {s['text']['en']}" for l, s in zip(letters, trio)) + "\nWhich are true?"
        prompt_si = "\n".join(f"{l}: {s['text']['si']}" for l, s in zip(letters, trio)) + "\nසත්‍ය වන්නේ කුමක් ද?"
        variants.append(dict(values={}, prompt=prompt, prompt_si=prompt_si, answer=right, options=GRID_OPTIONS, options_si=GRID_OPTIONS_SI, wrong=wrong, figure=None))
    while True:  # V14
        answer, n = Counter(v["answer"] for v in variants).most_common(1)[0]
        if n <= MAX_GRID_ANSWER * len(variants):
            return variants
        variants.remove(rng.choice([v for v in variants if v["answer"] == answer]))


# ---------- Figure engines ----------
def axes(xlabel, ylabel, w=240, h=160):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" font-family="sans-serif" font-size="11">'
            f'<rect width="{w}" height="{h}" fill="white"/><line x1="35" y1="130" x2="225" y2="130" stroke="#222"/><line x1="35" y1="130" x2="35" y2="10" stroke="#222"/>'
            f'<text x="196" y="124" fill="#222">{xlabel}</text><text x="42" y="16" fill="#222">{ylabel}</text>')


def tick_x(x, label):
    return f'<line x1="{x}" y1="130" x2="{x}" y2="134" stroke="#222"/><text x="{x - 3}" y="146" fill="#222">{N(label)}</text>'


def tick_y(y, label):
    return f'<line x1="31" y1="{y}" x2="35" y2="{y}" stroke="#222"/><text x="12" y="{y + 4}" fill="#222">{N(label)}</text>'


def draw(figure):
    p = figure["params"]
    if figure["engine"] == "vt-steps":
        total, vmax = p["t1"] + p["t2"], p["v1"]
        x = lambda t: 35 + 150 * t / total
        y = lambda v: 130 - 100 * v / vmax
        path = f"{x(0):.1f},{y(p['v1']):.1f} {x(p['t1']):.1f},{y(p['v1']):.1f} {x(p['t1']):.1f},{y(p['v2']):.1f} {x(total):.1f},{y(p['v2']):.1f}"
        ticks = tick_x(round(x(p["t1"])), p["t1"]) + tick_x(round(x(total)), total) + tick_y(round(y(p["v1"])), p["v1"]) + tick_y(round(y(p["v2"])), p["v2"])
        return axes("t / s", "v / m s⁻¹") + ticks + f'<polyline points="{path}" fill="none" stroke="#1a5fb4" stroke-width="2"/></svg>'
    if figure["engine"] == "ft-ramp":
        total = p["t1"] + p["t2"]
        x = lambda t: 35 + 150 * t / total
        path = f"35,130 {x(p['t1']):.1f},30 {x(total):.1f},30"
        ticks = tick_x(round(x(p["t1"])), p["t1"]) + tick_x(round(x(total)), total) + tick_y(30, p["F"])
        return axes("t / s", "F / N") + ticks + f'<polyline points="{path}" fill="none" stroke="#1a5fb4" stroke-width="2"/></svg>'
    if figure["engine"] == "beam":
        x = lambda s: 30 + 200 * s / p["L"]
        px = x(p["d"])
        return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 120" width="260" height="120" font-family="sans-serif" font-size="11"><rect width="260" height="120" fill="white"/>'
                '<rect x="30" y="60" width="200" height="10" fill="#ddd" stroke="#222"/><path d="M30 70L22 90H38z" fill="#888"/><path d="M230 70L222 90H238z" fill="#888"/>'
                '<text x="10" y="84" fill="#222">P</text><text x="242" y="84" fill="#222">Q</text>'
                f'<circle cx="{px:.1f}" cy="32" r="5" fill="#1a5fb4"/><line x1="{px:.1f}" y1="37" x2="{px:.1f}" y2="60" stroke="#1a5fb4" stroke-width="3"/>'
                f'<line x1="30" y1="112" x2="{px:.1f}" y2="112" stroke="#222"/><text x="{(30 + px) / 2 - 8:.1f}" y="107" fill="#222">{N(p["d"])} m</text>'
                f'<text x="108" y="16" fill="#222">L = {N(p["L"])} m</text></svg>')
    raise ValueError(figure["engine"])


# ---------- Item checks ----------
def words(text):
    return re.findall(r"[a-z0-9]+", re.sub(r"\\[a-zA-Z]+|[${}\\]", " ", text.lower()))


def ngrams(text, n=6):
    w = words(text)
    return {" ".join(w[i:i + n]) for i in range(len(w) - n + 1)}


def registered_tags(data):
    spec = SPEC_TAGS.read_text()
    return set(re.findall(r"^\| `([a-z-]+)` \|", spec, re.M))


def check_text(item, prompt, stems):
    if len(prompt.split()) > WORD_LIMIT[item["layer"]]:
        fail(f"{item['id']}: stem over the word limit")
    overlap = ngrams(prompt) & stems[item["source_ref"]]
    if overlap:
        fail(f"{item['id']}: V13 copies source wording: {overlap}")


def check_fixed(item, tags, stems):
    opts = item["options"]
    if sum(o["correct"] for o in opts) != 1:
        fail(f"{item['id']}: needs exactly 1 correct option")
    allowed = {2} if item["form"] in ("F10", "F32") else {4}
    if len(opts) not in allowed:
        fail(f"{item['id']}: {len(opts)} options")
    right = next(o["text"]["en"] for o in opts if o["correct"])
    wrong = [o for o in opts if not o["correct"]] + item.get("spare_options", [])
    texts = [o["text"]["en"] for o in opts]
    if len(set(texts)) != len(texts):
        fail(f"{item['id']}: duplicate options")
    for o in wrong:  # V10
        if o["tag"] not in tags:
            fail(f"{item['id']}: V10 unregistered tag {o['tag']}")
        if o["tag"] in DETAIL_TAGS and "detail" not in o:
            fail(f"{item['id']}: {o['tag']} needs a detail message")
    if item["layer"] != "L1":
        used = [o["tag"] for o in wrong]
        if len(set(used)) != len(used):
            fail(f"{item['id']}: two distractors share a tag: {used}")
    longest = max(len(o["text"]["en"]) for o in wrong)
    if len(right) > 1.3 * longest and len(right) > longest + 6:  # V12
        fail(f"{item['id']}: V12 correct option is clearly the longest")
    check_text(item, item["text"]["en"], stems)


def load_terms():
    import csv
    terms = {}
    with open(GLOSSARY, encoding="utf-8") as f:
        for row in csv.DictReader(f):
            terms[row["english"].strip().lower()] = row["sinhala"].strip()
    return terms


def term_pattern(term, sinhala):
    if term in TERM_OVERRIDES:
        return TERM_OVERRIDES[term]
    return re.escape(re.sub(r"(ය|ව|ම|ම්)$", "", sinhala))


def check_translation(item_id, en, si, terms):
    """V15: same numbers, symbols and placeholders, real Sinhala, and glossary terms used."""
    if en == si:
        return
    if not re.search(r"[\u0D80-\u0DFF]", si):
        fail(f"{item_id}: V15 no Sinhala in: {si}")
    placeholders = lambda s: sorted(set(re.findall(r"\{[^{}]+\}", s)) - {"{article}"})
    if placeholders(en) != placeholders(si):
        fail(f"{item_id}: V15 placeholders differ: {en}")
    no_ph = lambda s: re.sub(r"\{[^{}]+\}", "", s)
    numbers = lambda s: sorted(re.findall(r"\d+(?:\.\d+)?", no_ph(s)))
    if numbers(en) != numbers(si):
        fail(f"{item_id}: V15 numbers differ: {en} | {si}")
    lower = en.lower()
    words_left = lower
    for term in sorted(terms, key=len, reverse=True):
        if len(term) < 3 or not re.search(r"\b" + re.escape(term) + r"s?\b", words_left):
            continue
        words_left = re.sub(r"\b" + re.escape(term) + r"s?\b", " ", words_left)
        pattern = term_pattern(term, terms[term])
        if pattern and not re.search(pattern, si):
            GLOSSARY_MISSES.append((term, terms[term], en, si))


def check_all_translations(data):
    terms = load_terms()
    for item in data["cards"] + data["pools"] + data["templates"] + data["banks"]:
        fields = [item["explanation"]]
        if "text" in item:
            fields.append(item["text"])
        fields += [o["text"] for o in item.get("options", [])] + [o["detail"] for o in item.get("options", []) if "detail" in o]
        fields += [s["text"] for s in item.get("statements", [])]
        for f in fields:
            check_translation(item["id"], f["en"], f["si"], terms)
        for d in item.get("distractors", []):
            if "detail" in d:
                check_translation(item["id"], d["detail"], d["detail_si"], terms)
    if GLOSSARY_MISSES:
        for term, si_term, en, si in GLOSSARY_MISSES[:40]:
            print(f"glossary: {term} = {si_term} | {en} | {si}")
        fail(f"V15 {len(GLOSSARY_MISSES)} glossary misses")


def main():
    data = json.loads((HERE / "items.json").read_text())
    check_all_translations(data)
    db = sqlite3.connect(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DB)
    sources = {x["source_ref"] for k in ("cards", "pools", "templates", "banks") for x in data[k]}
    stems = {}
    for uid in sources:
        row = db.execute("select question, statements_json from questions where uid = ?", (uid,)).fetchone()
        if not row:
            fail(f"source {uid} not found")
            continue
        stems[uid] = ngrams(row[0] + " " + (row[1] or ""))
    tags = registered_tags(data)

    for item in data["cards"] + data["pools"]:
        check_fixed(item, tags, stems)

    # V14: F10 per unit, F32 per pool
    f10 = [c for c in data["cards"] if c["form"] == "F10"]
    share = sum(next(o for o in c["options"] if o["correct"])["text"]["en"] == "True" for c in f10) / len(f10)
    if not 0.4 <= share <= 0.6:
        fail(f"V14 F10 'True' share is {share:.2f}")
    pools = {}
    for p in data["pools"]:
        pools.setdefault(p["pool_id"], []).append(p)
    for pid, members in pools.items():
        if len(members) < 6:
            fail(f"{pid}: under 6 scenarios")
        if members[0]["form"] == "F32":
            share = sum(next(o for o in m["options"] if o["correct"])["text"]["en"].startswith("Different") for m in members) / len(members)
            if not 0.4 <= share <= 0.6:
                fail(f"{pid}: V14 'Different' share is {share:.2f}")

    built = []
    for t in data["templates"]:
        for d in t["distractors"]:  # V10
            if d["tag"] not in tags:
                fail(f"{t['id']}: V10 unregistered tag {d['tag']}")
        if len(t["distractors"]) < 5 and t["form"] != "F41":
            fail(f"{t['id']}: under 5 distractors")
        check_tag_functions(t)
        variants = apply_template_limits(t, expand_template(t))
        if len(variants) < 5:
            fail(f"{t['id']}: only {len(variants)} variants")
            continue
        for v in variants:
            check_text(t, v["prompt"], stems)
        effective = effective_variants(t, variants)
        top_share = Counter(v["position"] for v in variants).most_common(1)[0][1] / len(variants)
        unbalanced = t["option_order"] == "ascending" and top_share > MAX_POSITION  # V8
        small = effective < MIN_VARIANTS or unbalanced  # V7
        built.append(dict(id=t["id"], kind="template", source_ref=t["source_ref"], skills=t["skills"], form=t["form"], layer="L2" if small else "L4",
                          scheduling="FSRS card pool" if small else "skill mastery", n_variants=len(variants), effective_variants=effective, variants=variants, distractors=t["distractors"],
                          difficulty_est=t["difficulty_est"], explanation=t["explanation"], option_order=t["option_order"], position_exempt=t.get("position_exempt", False)))
    for b in data["banks"]:
        for s in b["statements"]:
            if "tag" in s and s["tag"] not in tags:
                fail(f"{b['id']}: V10 unregistered tag {s['tag']}")
            check_text(b, s["text"]["en"], stems)
        variants = expand_bank(b)
        built.append(dict(id=b["id"], kind="bank", source_ref=b["source_ref"], skills=b["skills"], form="F42", layer="L4", scheduling="skill mastery",
                          n_variants=len(variants), variants=variants, difficulty_est=b["difficulty_est"], explanation=b["explanation"], option_order="fixed", statements=b["statements"]))

    if ERRORS:
        print("\n".join(ERRORS[:60]))
        sys.exit(f"{len(ERRORS)} check(s) failed")

    figure_dir = HERE / "figures"
    figure_dir.mkdir(exist_ok=True)
    (HERE / "variants.json").write_text(json.dumps(dict(spec_version=data["spec_version"], items=built), ensure_ascii=False, indent=1, default=str) + "\n")
    write_review(data, built, figure_dir)
    summary(data, built)


def pick_examples(item):
    variants = item["variants"]
    if variants[0].get("scenario"):
        by = {}
        for v in variants:
            by.setdefault(v["scenario"], v)
        return list(by.values())[:4]
    if item["kind"] == "bank":
        seen = {}
        for v in variants:
            seen.setdefault(v["answer"], v)
        return list(seen.values())[:3]
    ordered = sorted(variants, key=lambda v: v["answer_value"])
    return [ordered[0], ordered[len(ordered) // 2], ordered[-1]]


def coverage(data, built):
    rows = []
    for s in data["skills"]:
        cards = [c for c in data["cards"] if c["skills"][0] == s["id"]]
        l1 = sum(c["layer"] == "L1" for c in cards)
        l2 = sum(c["layer"] == "L2" for c in cards)
        trap = any(c["form"] in ("F13", "F14") for c in cards)
        pool_count = len({p["pool_id"] for p in data["pools"] if p["skills"][0] == s["id"]})
        l4 = [b for b in built if b["skills"][0] == s["id"]]
        strong = sum(b["layer"] == "L4" for b in l4)
        pooled = sum(b["layer"] == "L2" for b in l4)
        rows.append((s, l1, l2, trap, pool_count, strong, pooled))
    return rows


def write_review(data, built, figure_dir):
    names = {s["id"]: s["name"] for s in data["skills"]}
    names_si = {s["id"]: s["name_si"] for s in data["skills"]}
    n_var = sum(b["n_variants"] for b in built)
    out = [
        "# Mechanics sample: teacher review", "",
        f"Built to content authoring spec v{data['spec_version']}. Every item is a draft inspired by 20 past-paper MCQs. Please check the physics, the wording, the skill, and whether each wrong option is a mistake students really make.", "",
        f"- **Cards:** {len(data['cards'])} · **Scenario pools:** {len({p['pool_id'] for p in data['pools']})} ({len(data['pools'])} scenarios) · **Templates and banks:** {len(built)}, giving {n_var} checked variants",
        "- **Correct answer** is in bold. The tag beside each wrong option is the mistake it records.",
        "- **Constants:** the app shows g = 10 m s⁻² beside numeric items, so stems don't repeat it.",
        "- **Not checked by code:** teaching quality, most tag accuracy, and the conceptual cards' physics.",
        "- **To save time:** each template lists its mistakes once. Tick those, then just read the examples.", "",
        "## Sinhala terms to confirm first", "",
        "Everything is draft Sinhala written by AI from the English. These are the term choices to confirm against the NIE textbook, because they change many items. Tell us the right word once and it changes everywhere.", "",
        "| English | Used here | Why it needs checking |", "|---|---|---|",
        "| beam | බාල්කය | The glossary's කදම්භය means a beam of light |",
        "| lift (elevator) | සෝපානය | The glossary's ඔසවන බලය means aerodynamic lift |",
        "| slope (physical) | ආනත තලය | The glossary's අනුක්‍රමණය means a graph's gradient |",
        "| projectile | ප්‍රක්ෂිප්තය | The glossary's ප්‍රක්ෂේපණය means the act of projecting |",
        "| torque | ව්‍යාවර්තය | The glossary also has ව්‍යවර්තනය |",
        "| conservation | සංස්ථිතිය | The glossary also has සංස්ථීතිය |",
        "| moment, moment of inertia | සූර්ණය, අවස්ථිති සූර්ණය | Existing material mostly writes ඝූර්ණ |",
        "| smooth | සිනිඳු | Existing material also uses සුමට |",
        "| uniform acceleration | නියත ත්වරණය | From the glossary; ඒකාකාර ත්වරණය may be the textbook's word |",
        "| not in the glossary | වළල්ල (hoop), කරත්තය (cart), අසව්ව (hinge), පොළා පැනීම (bounce), පරිවහන (translational), දෘශ්‍ය බර (apparent weight), ලිස්සන්නා (skater) | My own choices |", "",
        "## Coverage against spec §9", "",
        "| Skill | Type | L1 | L2 | Trap card | L3 pools | L4 | Small pool |", "|---|---|---|---|---|---|---|---|",
    ]
    for s, l1, l2, trap, pools, strong, pooled in coverage(data, built):
        out.append(f"| {s['name']} | {s['type']} | {l1} | {l2} | {'yes' if trap else 'no'} | {pools} | {strong} | {pooled} |")
    out.append("")

    skills_seen = set()

    def header(item_id, layer, form, skill, difficulty, extra=""):
        skill_tick = [] if skill in skills_seen else [f"- [ ] This skill is right (asked once per skill)"]
        skills_seen.add(skill)
        return [f"### {item_id} · {layer} · {form}{extra}", "", f"Skill: `{skill}` ({names_si[skill]} / {names[skill]}). Draft difficulty: {difficulty}.", ""] + skill_tick + ["- [ ] OK", "- [ ] Fix:", ""]

    def wrong_label(text, tag, detail):
        note = f" Student sees: \"{detail}\"" if detail else ""
        return f"{text} (`{tag}`).{note}"

    ticked = set()

    def fixed_body(item):
        out_ = [item["text"]["si"] + "  ", item["text"]["en"], ""]
        pair = lambda f: f["si"] if f["si"] == f["en"] else f"{f['si']} / {f['en']}"
        for o in item["options"]:
            if o["correct"]:
                label = f"**{pair(o['text'])}**"
            else:
                detail = o.get("detail", {}).get("en")
                key = (item.get("pool_id"), o["text"]["en"], o["tag"])
                tick = "" if o["tag"] == "recall-gap" or (item.get("pool_id") and key in ticked) else "[ ] "
                ticked.add(key)
                si_detail = o.get("detail", {}).get("si")
                label = tick + wrong_label(pair(o["text"]), o["tag"], si_detail or detail) + (" Real mistake?" if tick else "")
            out_.append(f"- {label}")
            if o.get("asset"):
                out_.append(f"\n  ![]({o['asset']})\n")
        return out_ + ["", f"Explanation: {item['explanation']['si']}  ", item["explanation"]["en"], ""]

    sources = []
    for k in ("cards", "pools", "templates", "banks"):
        for x in data[k]:
            if x["source_ref"] not in sources:
                sources.append(x["source_ref"])
    for src in sorted(sources):
        out += [f"## Source {src}", ""]
        for c in (c for c in data["cards"] if c["source_ref"] == src):
            out += header(c["id"], c["layer"], c["form"], c["skills"][0], c["difficulty_est"]) + fixed_body(c)
        seen = set()
        for p in (p for p in data["pools"] if p["source_ref"] == src):
            if p["pool_id"] not in seen:
                seen.add(p["pool_id"])
                out += header(p["pool_id"], "L3", p["form"], p["skills"][0], p["difficulty_est"], " · scenario pool") + ["All scenarios are below.", ""]
            out += [f"**{p['id']}**", ""] + fixed_body(p)
        for b in (b for b in built if b["source_ref"] == src):
            out += header(b["id"], b["layer"], b["form"], b["skills"][0], b["difficulty_est"], f" · {b['n_variants']} variants · {b['scheduling']}")
            if b["kind"] == "bank":
                out += ["Statement bank (tick each false statement if students really believe it):", ""]
                out += [f"- True: {s['text']['si']} / {s['text']['en']}" if s["true"] else f"- [ ] False (`{s['tag']}`): {s['text']['si']} / {s['text']['en']}" for s in b["statements"]] + [""]
            else:
                out += ["Mistakes in this template:", ""]
                for d in b["distractors"]:
                    note = f" Student sees: \"{d['detail_si']}\" ({d['detail']})" if d.get("detail") else ""
                    out.append(f"- [ ] `{d['tag']}`: `{d['expr']}`.{note} Real mistake?")
                out.append("")
            for i, v in enumerate(pick_examples(b), 1):
                lines = v["prompt_si"].split("\n")
                out += [f"**Example {i}:** {lines[0]}  "] + [line + "  " for line in lines[1:]] + [v["prompt"].replace("\n", " / "), ""]
                if v.get("figure"):
                    name = f"{b['id'].split('.')[-1]}-{i}.svg"
                    (figure_dir / name).write_text(draw(v["figure"]))
                    out += [f"![](figures/{name})", ""]
                tag_of = {w["text"]: w["error_tag"] for w in v["wrong"]}
                shown = dict(zip(v["options"], v.get("options_si", v["options"])))
                pair = lambda t: t if shown[t] == t else f"{shown[t]} / {t}"
                out += [f"- **{pair(t)}**" if t == v["answer"] else f"- {pair(t)} (`{tag_of[t]}`)" for t in v["options"]] + [""]
            out += [f"Explanation: {b['explanation']['si']}  ", b["explanation"]["en"], ""]
    (HERE / "review.md").write_text("\n".join(out))


def summary(data, built):
    print(f"spec v{data['spec_version']}: {len(data['cards'])} cards, {len(data['pools'])} scenarios in {len({p['pool_id'] for p in data['pools']})} pools")
    print("cards by layer:", dict(Counter(c["layer"] for c in data["cards"])))
    for b in built:
        pos = sorted(Counter(v["position"] + 1 for v in b["variants"] if "position" in v).items()) if b["kind"] == "template" and b["option_order"] == "ascending" else ""
        print(f"  {b['id'].split('.')[-1]:4} {b['layer']} {b['form']} {b['skills'][0]:34} variants={b['n_variants']:4} effective={b.get('effective_variants', b['n_variants']):4} {pos}")
    print(f"variants: {sum(b['n_variants'] for b in built)}. All checks passed.")
    shares, n = Counter(), 0
    for b in built:
        if b["kind"] == "template" and b["option_order"] == "ascending" and not b["position_exempt"]:
            n += 1
            for v in b["variants"]:
                shares[v["position"] + 1] += 1 / b["n_variants"]
    print("answer position across templates:", {k: round(shares[k] / n, 2) for k in sorted(shares)})
    grids = Counter(v["answer"] for b in built if b["kind"] == "bank" for v in b["variants"])
    print("grid answers:", dict(grids))
    used = {w["tag"] for c in data["cards"] + data["pools"] for w in c["options"] if not w["correct"]}
    used |= {w["error_tag"] for b in built for v in b["variants"] for w in v["wrong"]}
    print(f"tags used: {len(used)}")
    review = (HERE / "review.md").read_text()
    print(f"review tick boxes: {review.count('[ ]')}, of which real-mistake: {review.count('Real mistake?') + review.count('- [ ] False')}")
    print("coverage gaps (procedural with no L3 pool):", [s["name"] for s, _, _, _, p, _, _ in coverage(data, built) if s["type"] == "procedural" and not p])
    print("procedural with only a small pool at L4:", [s["name"] for s, _, _, _, _, st, po in coverage(data, built) if s["type"] == "procedural" and not st])
    print("skills with no trap card:", [s["name"] for s, _, l2, t, _, _, _ in coverage(data, built) if l2 and not t])


if __name__ == "__main__":
    main()
