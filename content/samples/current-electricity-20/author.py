#!/usr/bin/env python3
"""Writes items.json: the Current Electricity sample in the format of content authoring spec v0.5.

This is only a compact way to type the items. validate.py reads items.json and nothing from here.
Set ENGLISH_ONLY=1 to write items.json before every string has Sinhala, to check the English first.
Skill IDs come from content/skills/current-electricity/graph.json.
"""
import json
import os
import re
from pathlib import Path

HERE = Path(__file__).parent
SPEC_VERSION = "0.5"
FIGURES = HERE / "figures"
UNIT = "phy.elec"

SKILLS = {
    "sp": ("phy.elec.res.series-parallel", "Resistors in series and parallel", "procedural"),
    "div": ("phy.elec.cur.potential-divider", "Potential divider", "procedural"),
    "rho": ("phy.elec.res.resistivity", "Resistance and resistivity", "procedural"),
    "drift": ("phy.elec.cur.drift-velocity", "Drift velocity and current density", "procedural"),
    "pow": ("phy.elec.pow.power-formulas", "Electrical power", "procedural"),
    "pgr": ("phy.elec.pow.power-graphs", "How power varies with current, voltage and resistance", "conceptual"),
    "heat": ("phy.elec.pow.joule-heating", "Joule heating", "procedural"),
    "ir": ("phy.elec.emf.internal-resistance", "Terminal pd and internal resistance", "procedural"),
    "cells": ("phy.elec.emf.cell-combinations", "Cells in series and in parallel", "procedural"),
    "maxp": ("phy.elec.emf.max-power", "Maximum power transfer", "procedural"),
    "meter": ("phy.elec.meter.ammeter-voltmeter", "Ammeters, voltmeters and ideal meters", "conceptual"),
    "wsb": ("phy.elec.bridge.wheatstone-balance", "Balanced Wheatstone bridge", "procedural"),
    "potp": ("phy.elec.pot.principle", "Potentiometer principle and sensitivity", "conceptual"),
    "potg": ("phy.elec.pot.potential-gradient", "Potential gradient along a potentiometer wire", "procedural"),
    "potr": ("phy.elec.pot.internal-resistance", "Internal resistance with a potentiometer", "procedural"),
    "far": ("phy.elec.emi.faraday", "Faraday's law", "procedural"),
    "lenz": ("phy.elec.emi.lenz", "Lenz's law", "conceptual"),
    "bemf": ("phy.elec.emi.back-emf", "Back e.m.f. of a motor", "conceptual"),
    "tr": ("phy.elec.tr.power-current", "Transformer power and current ratio", "procedural"),
}

SOURCE_DIFFICULTY = {
    "2025-6": 2, "2024-34": 3, "2023-43": 3, "2016-26": 3, "2022-31": 3, "2021-46": 4, "2024-24": 2,
    "2023-18": 3, "2022-23": 3, "2016-25": 4, "2020-33": 4, "2016-7": 2, "2023-40": 4, "2016-5": 3,
    "2024-26": 4, "2021-31": 3, "2025-9": 2, "2023-23": 3, "2022-5": 2, "2024-14": 2,
}

CARDS, POOLS, TEMPLATES, BANKS, MISSING = [], [], [], [], set()


SINHALA = dict(line.rstrip("\n").split("\t", 1) for line in (HERE / "si.tsv").read_text().splitlines() if line.strip()) if (HERE / "si.tsv").exists() else {}


def needs_translation(s):
    no_units = re.sub(r"\b(mA|mV|kΩ|MΩ|kWh|Wb|cm|mm|min|rms|max)\b", "", s)
    return re.search(r"[a-z]{3,}|\b[A-Z][a-z]+", no_units) is not None


def text(s):
    if s in SINHALA:
        return {"en": s, "si": SINHALA[s]}
    if needs_translation(s):
        MISSING.add(s)
    return {"en": s, "si": s}  # symbols and numbers stay as they are


def item_base(item_id, layer, form, skill, source, difficulty):
    return dict(
        id=item_id, version=1, status="draft", layer=layer, form=form, skills=[SKILLS[skill][0]],
        difficulty_est=difficulty, source_ref=source, note_ref=f"{UNIT}.note.{skill}", reviewer=None, review_notes=None,
    )


def wrong_option(entry):
    opt = dict(text=text(entry[0]), correct=False, tag=entry[1])
    if len(entry) == 3:
        opt["detail"] = text(entry[2])
    return opt


def options(right, wrong, assets=None):
    opts = [dict(text=text(right), correct=True)] + [wrong_option(w) for w in wrong]
    if assets:
        for o, a in zip(opts, assets):
            o["asset"] = a
    return opts


def card(source, skill, layer, form, prompt, right, wrong, why, figures=None, order="shuffle", spare=None):
    n = len(CARDS) + 1
    assets = []
    if figures:
        FIGURES.mkdir(exist_ok=True)
        for i, body in enumerate(figures, 1):
            (FIGURES / f"c{n:03d}-{i}.svg").write_text(body)
            assets.append(f"figures/c{n:03d}-{i}.svg")
    c = item_base(f"{UNIT}.c{n:03d}", layer, form, skill, source, {"L1": 1, "L2": 2}[layer])
    c.update(text=text(prompt), options=options(right, wrong, assets), option_order=order, explanation=text(why))
    if spare:
        c["spare_options"] = [wrong_option(w) for w in spare]
    CARDS.append(c)


def recall(source, skill, form, prompt, right, wrong, why, tag="recall-gap"):
    card(source, skill, "L1", form, prompt, right, [(t, tag) for t in wrong], why)


def true_false(source, skill, prompt, answer, tag, why):
    right, wrong = ("True", "False") if answer else ("False", "True")
    card(source, skill, "L2", "F10", prompt, right, [(wrong, tag)], why, order="fixed")


def pool(pool_id, source, skill, form, scenarios):
    for i, (prompt, right, wrong, why) in enumerate(scenarios, 1):
        p = item_base(f"{UNIT}.{pool_id}-{i:02d}", "L3", form, skill, source, 2)
        order = "fixed" if form == "F32" else "shuffle"
        p.update(pool_id=f"{UNIT}.{pool_id}", text=text(prompt), options=options(right, wrong), option_order=order, explanation=text(why))
        POOLS.append(p)


def with_detail_si(d):
    if "detail" in d:
        d["detail_si"] = text(d["detail"])["si"]
    return d


def template(tid, source, skill, form, stem, params, answer, verify, distractors, why, **extra):
    t = item_base(f"{UNIT}.{tid}", "L4", form, skill, source, SOURCE_DIFFICULTY[source])
    t.update(text=text(stem), params=params, answer=answer, verify=verify,
             distractors=[with_detail_si(d if isinstance(d, dict) else dict(tag=d[0], expr=d[1], **({"detail": d[2]} if len(d) == 3 else {}))) for d in distractors],
             param_text={"si": {v: text(v)["si"] for p in params.values() for v in p["set"] if isinstance(v, str)}},
             constants=extra.pop("constants", {}), option_order=extra.pop("order", "ascending"),
             format={"sig_figs": 3}, explanation=text(why), **extra)
    TEMPLATES.append(t)


# ---------- Figures for cards ----------
def svg(body, w=170, h=120):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" font-family="sans-serif" font-size="11">'
            f'<rect width="{w}" height="{h}" fill="white"/>{body}</svg>')


def plot(f, xlabel, ylabel, n=30):
    axes = (f'<line x1="25" y1="105" x2="160" y2="105" stroke="#222" stroke-width="1.6"/><text x="150" y="117" fill="#222">{xlabel}</text>'
            f'<line x1="25" y1="105" x2="25" y2="8" stroke="#222" stroke-width="1.6"/><text x="29" y="16" fill="#222">{ylabel}</text>')
    pts = " ".join(f"{25 + 125 * i / n:.1f},{105 - 90 * f(i / n):.1f}" for i in range(n + 1))
    return svg(axes + f'<polyline points="{pts}" fill="none" stroke="#1a5fb4" stroke-width="2"/>')


def meter(x, y, letter):
    return f'<circle cx="{x}" cy="{y}" r="9" fill="white" stroke="#222" stroke-width="1.4"/><text x="{x - 4}" y="{y + 4}" fill="#222">{letter}</text>'


def circuit(series, across):
    """A loop with a cell on the left, R on the top wire, `series` meter on the bottom wire,
    and `across` = (letter, where) with where in {"R", "cell", "top"}."""
    w = "#222"
    body = (f'<path d="M20 30H70M110 30H150V100H20V72M20 58V30" fill="none" stroke="{w}" stroke-width="1.4"/>'
            f'<line x1="10" y1="58" x2="30" y2="58" stroke="{w}" stroke-width="2"/><line x1="14" y1="72" x2="26" y2="72" stroke="{w}" stroke-width="3"/>'
            f'<rect x="70" y="22" width="40" height="16" fill="white" stroke="{w}" stroke-width="1.4"/><text x="86" y="34" fill="{w}">R</text>')
    body += meter(85, 100, series)
    letter, where = across
    if where == "R":
        body += f'<path d="M62 30V8H76M94 8H118V30" fill="none" stroke="{w}" stroke-width="1.4"/>' + meter(85, 8, letter)
    elif where == "cell":
        body += f'<path d="M20 30H5V56M5 74V100H20" fill="none" stroke="{w}" stroke-width="1.4"/>' + meter(5, 65, letter)
    else:  # in series on the right-hand wire
        body = body.replace("M110 30H150V100", "M110 30H150V56M150 74V100") + meter(150, 65, letter)
    return svg(f'<g transform="translate(14 6)">{body}</g>', 185, 122)


# ---------- L1 and L2 cards ----------
recall("2025-6", "sp", "F01", "Resistors R₁ and R₂ are in parallel. Equivalent resistance?", "R₁R₂/(R₁ + R₂)",
       ["R₁ + R₂", "(R₁ + R₂)/2", "(R₁ + R₂)/(R₁R₂)"], "1/R = 1/R₁ + 1/R₂, which rearranges to product ÷ sum.")
true_false("2024-34", "sp", "Adding one more resistor in parallel always lowers the total resistance.", True,
           "series-parallel-swap", "Each new path lets more current through for the same pd.")
card("2025-6", "sp", "L2", "F19", "Three identical resistors. Largest possible equivalent resistance ÷ smallest?", "9",
     [("3", "stopped-early", "3R is only the largest. Divide it by the smallest, R/3."), ("6", "wrong-law", "The smallest is R/3, all three in parallel."),
      ("1", "series-parallel-swap")],
     "All in series gives 3R. All in parallel gives R/3. The ratio is 9.")
card("2024-34", "sp", "L2", "F13", "A 4 Ω and a 12 Ω resistor are joined in parallel. Equivalent resistance?", "3 Ω",
     [("16 Ω", "series-parallel-swap"), ("8 Ω", "wrong-law", "Parallel resistors don't average. Use product ÷ sum."),
      ("0.33 Ω", "stopped-early", "That's 1/R. Take the reciprocal.")],
     "4 × 12 ÷ 16 = 3 Ω, which is less than the smaller resistor.")
card("2024-34", "sp", "L2", "F14", "Student says: \"Two different resistors in parallel share the current equally.\" What's wrong?",
     "More current flows through the smaller resistance",
     [("Nothing: the pd is equal, so the current is too", "assumed-symmetry"), ("More current flows through the larger resistance", "inverted"),
      ("The first resistor uses up most of the current", "current-used-up")],
     "The pd is the same across both, so I = V/R is larger where R is smaller.")

card("2023-43", "div", "L2", "F19", "A divider has R and 3R in series across a cell. Pd across 3R ÷ cell voltage?", "¾",
     [("⅓", "inverted"), ("½", "assumed-symmetry"), ("¼", "wrong-quantity", "That's the share across R, not 3R.")],
     "Same current through both, so pd ∝ R: 3R ÷ 4R.")
card("2023-43", "div", "L2", "F13", "A 6 V cell with no internal resistance drives 1 kΩ and 2 kΩ in series. An ideal voltmeter reads the pd across the 2 kΩ. Reading?", "4 V",
     [("2 V", "wrong-quantity", "That's the pd across the 1 kΩ."), ("3 V", "assumed-symmetry"),
      ("6 V", "ignored-condition", "The cell's voltage is shared by both resistors.")],
     "The 2 kΩ has ⅔ of the total resistance, so it takes ⅔ of 6 V.")
card("2023-43", "div", "L2", "F14",
     "In a divider, an ideal voltmeter across one resistor is swapped for a real one with a similar resistance. Student says: \"The reading stays the same.\" What's wrong?",
     "The meter draws current, so the reading falls",
     [("The meter adds resistance, so the reading rises", "inverted"), ("A voltmeter never changes a circuit", "meter-resistance"),
      ("The reading falls only if the cell has internal resistance", "ignored-condition", "The meter in parallel lowers that part's resistance, so it changes the divider.")],
     "The meter in parallel lowers the resistance of that part, so it takes a smaller share of the pd.")

recall("2016-26", "rho", "F02", "R = ρ ▢ ÷ A", "l", ["d", "A", "l²"], "Resistance grows with the length and falls with the cross-sectional area.")
card("2016-26", "rho", "L2", "F12", "A wire is stretched to twice its length, with its volume unchanged. Resistance × ?", "4",
     [("2", "ignored-condition", "Stretching also halves the cross-sectional area."), ("½", "inverted"), ("8", "wrong-power")],
     "l × 2 and A × ½, so ρl/A goes up 4 times.")
card("2016-26", "rho", "L2", "F12", "Same metal and length, but the diameter × 2. Resistance × ?", "¼",
     [("½", "forgot-square"), ("2", "wrong-power"), ("4", "inverted")], "A ∝ d², so A × 4 and R × ¼.")

recall("2022-31", "drift", "F02", "I = n ▢ v e", "A", ["l", "R", "V"], "I = nAve: carrier density × area × drift speed × charge.")
card("2022-31", "drift", "L2", "F19", "A wire has a thin part of area A and a thick part of area 3A. Drift speed, thin : thick?", "3 : 1",
     [("1 : 3", "drift-thin-slower"), ("1 : 1", "ignored-condition", "Same current through a smaller area needs faster drift."), ("9 : 1", "wrong-power")],
     "The current is the same in both parts, so v ∝ 1/A.")

recall("2021-46", "pow", "F01", "A resistor R has a pd V across it. Power?", "V²/R", ["VR", "V/R", "V²R"], "P = VI and I = V/R, so P = V²/R.")
card("2021-46", "pow", "L2", "F13", "A 60 W and a 100 W lamp, both rated for 230 V, are joined in series across 230 V. Which glows brighter?", "The 60 W lamp",
     [("The 100 W lamp", "power-formula-choice"), ("Both equally", "assumed-symmetry"), ("The lamp nearer the + terminal", "current-used-up")],
     "The 60 W lamp has the larger R. In series the current is the same, so P = I²R is larger for it.")

recall("2024-24", "pgr", "F03", "A fixed resistor's pd × 3. Power × ?", "9", ["3", "27", "⅓"], "P = V²/R, so P ∝ V².")
card("2024-24", "pgr", "L2", "F15", "A wire kept at constant temperature carries current I. Pick the graph of its power P against I.", "Curve from the origin, getting steeper",
     [("Straight line rising from the origin", "forgot-square"), ("Curve that rises, then levels off", "wrong-power"), ("Curve that falls as I grows", "inverted")],
     "R is constant, so P = I²R is a parabola through the origin.",
     figures=[plot(lambda x: x * x, "I", "P"), plot(lambda x: 0.9 * x, "I", "P"), plot(lambda x: 1 - (1 - x) ** 2, "I", "P"), plot(lambda x: 0.95 / (1 + 4 * x) ** 0.8, "I", "P")])
card("2024-24", "pgr", "L2", "F11", "A fixed-voltage supply drives a resistor. As the resistance increases, the power?", "Decreases",
     [("Increases", "power-formula-choice"), ("Stays the same", "ignored-condition", "With V fixed, the current falls as R rises, so P changes."),
      ("Rises, then falls", "wrong-law", "That shape needs a source with internal resistance. Here V is fixed.")],
     "With V fixed, P = V²/R, which falls as R rises.")

recall("2023-18", "heat", "F05", "1 kWh in joules?", "3.6 × 10⁶ J", ["1000 J", "3600 J", "3.6 × 10⁵ J"], "1 kW × 3600 s = 3.6 × 10⁶ J.", tag="unit-conversion")
card("2023-18", "heat", "L2", "F12", "A heater runs on fixed mains voltage. Its wire is swapped for one of the same metal and thickness, half as long. Time to heat the same water × ?", "½",
     [("2", "power-formula-choice"), ("¼", "wrong-power"), ("1", "ignored-condition", "Halving R changes the power, so the time changes.")],
     "R halves, so P = V²/R doubles and the time halves.")

recall("2022-23", "ir", "F01", "A cell of e.m.f. E and internal resistance r gives current I. Terminal pd?", "E − Ir", ["E + Ir", "E", "Ir"],
       "Part of the e.m.f., Ir, is used up inside the cell.")
true_false("2022-23", "ir", "An ideal voltmeter across a cell with nothing else connected reads the cell's e.m.f.", True, "emf-vs-terminal-pd",
           "No current flows, so no pd is lost inside the cell.")
true_false("2022-23", "ir", "A cell's terminal pd rises when it supplies a larger current.", False, "emf-vs-terminal-pd",
           "V = E − Ir, so a larger current means a smaller terminal pd.")

card("2016-25", "cells", "L2", "F13", "Two identical cells, each of e.m.f. E and internal resistance r, are joined in parallel. E.m.f. and internal resistance of the pair?", "E and r/2",
     [("2E and 2r", "series-parallel-swap"), ("2E and r/2", "wrong-law", "Identical cells in parallel keep the same e.m.f."), ("E and 2r", "inverted")],
     "The e.m.f. stays E. The two internal resistances are in parallel, giving r/2.")
card("2016-25", "cells", "L2", "F12", "n identical cells in series. Total internal resistance ÷ one cell's?", "n",
     [("1/n", "series-parallel-swap"), ("1", "ignored-condition", "Each cell's r adds when they are in series."), ("n²", "wrong-power")],
     "Internal resistances in series add.")

card("2020-33", "maxp", "L2", "F13", "A cell has an internal resistance of 2 Ω. Which load takes the most power from it?", "2 Ω",
     [("0 Ω", "wrong-quantity", "Zero load gives the largest current, but no power in the load."), ("As large as possible", "inverted"),
      ("4 Ω", "wrong-law", "Maximum power needs R = r, not R = 2r.")],
     "The load gets the most power when its resistance equals the internal resistance.")
card("2020-33", "maxp", "L2", "F14", "Student says: \"At maximum power transfer, the cell is at its most efficient.\" What's wrong?", "The efficiency is only 50% there",
     [("Nothing: most power means the least waste", "max-power-efficiency"), ("The efficiency is 100% there", "wrong-quantity", "Half the power is lost inside the cell."),
      ("The efficiency is highest when the load is zero", "inverted")],
     "With R = r, the cell's own resistance wastes as much power as the load uses.")

card("2016-7", "meter", "L2", "F13", "Which meters disturb a circuit least when measuring the current in, and pd across, a 1 kΩ resistor?", "Ammeter 1 Ω, voltmeter 1 MΩ",
     [("Ammeter 1 MΩ, voltmeter 1 Ω", "meter-resistance"), ("Both 1 kΩ", "assumed-symmetry"),
      ("Ammeter 1 kΩ, voltmeter 1 MΩ", "ignored-condition", "An ammeter's resistance adds to the circuit, so it must be tiny.")],
     "The ammeter's resistance must be far below 1 kΩ, and the voltmeter's far above it.")
card("2016-7", "meter", "L2", "F23", "Pick the circuit that measures the current in R and the pd across R.", "Ammeter in the loop, voltmeter across R",
     [("Voltmeter in the loop, ammeter across R", "meter-placement"), ("Ammeter in the loop, voltmeter across the cell", "wrong-quantity", "That reads the cell's pd, not R's."),
      ("Both meters in the loop", "series-parallel-swap")],
     "An ammeter goes in series with R. A voltmeter goes in parallel with R.",
     figures=[circuit("A", ("V", "R")), circuit("V", ("A", "R")), circuit("A", ("V", "cell")), circuit("A", ("V", "top"))])
true_false("2016-7", "meter", "An ideal voltmeter has zero resistance.", False, "meter-resistance",
           "An ideal voltmeter has infinite resistance, so it draws no current.")

recall("2023-40", "wsb", "F01", "A Wheatstone bridge has P, Q on one side and R, S on the other. Balance condition?", "P/Q = R/S",
       ["PQ = RS", "P + Q = R + S", "P − Q = R − S"], "At balance, the two middle points are at the same potential, so the ratios match.")
card("2023-40", "wsb", "L2", "F13", "A bridge has 2 Ω and 4 Ω on one side, 3 Ω and 6 Ω on the other, and a 10 Ω resistor joining the middle points. Current in the 10 Ω?", "Zero",
     [("Depends on the cell's voltage", "ignored-condition", "The bridge is balanced, so the middle points are at equal potential."),
      ("Half the cell's current", "assumed-symmetry"), ("Largest of all, because the path is short", "wrong-law", "No pd across it, so no current, whatever its resistance.")],
     "2 : 4 = 3 : 6, so the bridge is balanced.")

recall("2016-5", "potp", "F01", "Why measure an e.m.f. with a potentiometer rather than a voltmeter?", "It draws no current at balance",
       ["It has a higher resistance", "It gives a faster reading", "It needs no driver cell"], "At balance no current flows from the cell, so its full e.m.f. is measured.")

recall("2024-26", "potg", "F02", "Potential gradient of a potentiometer wire = pd across the wire ÷ ▢", "its length",
       ["its resistance", "the current", "the cell's e.m.f."], "Potential gradient is volts per metre of wire.")
card("2024-26", "potg", "L2", "F13", "A 100 cm, 10 Ω potentiometer wire is in series with a 2 V cell and a resistor. A 10 mV source balances at 50 cm. Current in the wire?", "2 mA",
     [("20 mA", "unit-conversion"), ("0.2 mA", "stopped-early", "0.2 mV per cm is the gradient. Find the pd across the whole wire, then I."),
      ("200 mA", "wrong-law", "Use the wire's own pd, 20 mV, not the cell's e.m.f.")],
     "Gradient = 0.2 mV cm⁻¹, so the wire has 20 mV across it, and I = 20 mV ÷ 10 Ω.")

card("2021-31", "potr", "L2", "F13", "Potentiometer: a cell balances at 60 cm on open circuit, and at 50 cm when it drives a 5 Ω resistor. Internal resistance?", "1 Ω",
     [("6 Ω", "stopped-early", "That's R × l₁ ÷ l₂. Subtract R."), ("0.83 Ω", "inverted"), ("10 Ω", "wrong-law", "Use r = R(l₁ − l₂) ÷ l₂. The lengths are a ratio, not ohms.")],
     "E ÷ V = l₁ ÷ l₂ = 1.2, so r = 0.2 × 5 Ω.")
true_false("2021-31", "potr", "At balance, the cell being tested gives a small current to the potentiometer circuit.", False, "pot-draws-current",
           "The galvanometer reads zero, so no current flows from that cell.")

recall("2025-9", "far", "F01", "Faraday's law: the induced e.m.f. equals?", "The rate of change of flux linkage",
       ["The flux linkage", "Flux density × area", "The rate of change of current"], "E = −d(NΦ)/dt.")
recall("2025-9", "far", "F04", "SI unit of magnetic flux?", "Wb (T m²)", ["T", "T m⁻²", "Wb m⁻²"], "Φ = BA, so its unit is T m², called the weber.")
card("2025-9", "far", "L2", "F12", "A coil's turns × 2, in the same changing field. Induced e.m.f. × ?", "2",
     [("1", "forgot-turns"), ("4", "wrong-power"), ("½", "inverted")], "E = N dΦ/dt, so E ∝ N.")
card("2025-9", "far", "L2", "F14", "A coil sits still in a strong, steady magnetic field. Student says: \"The flux is large, so the induced e.m.f. is large.\" What's wrong?",
     "The flux isn't changing, so there is no e.m.f.",
     [("Nothing: more flux always means more e.m.f.", "flux-not-change"), ("The e.m.f. depends on the coil's resistance", "wrong-law", "E.m.f. depends on the rate of change of flux, not on resistance."),
      ("The e.m.f. is large only with an iron core", "ignored-condition", "No change in flux means no e.m.f., whatever the core.")],
     "Induced e.m.f. needs a changing flux.")

card("2023-23", "lenz", "L2", "F18", "A magnet's N pole is pushed towards a coil. The induced current makes the near face of the coil act as?", "A N pole, pushing the magnet back",
     [("A S pole, pulling the magnet in", "lenz-same-direction"), ("No pole at all", "wrong-law", "Any current makes a field, and this one opposes the change."),
      ("A N pole, but only once the magnet stops", "flux-not-change")],
     "The induced current opposes the change: the approaching N pole is repelled.")
card("2023-23", "lenz", "L2", "F13", "The current in a long straight wire is falling. A loop lies flat beside it. The field of the induced current inside the loop?",
     "Points the same way as the wire's field",
     [("Points against the wire's field", "lenz-opposes-field"), ("Is zero, because the wire's field is still there", "flux-not-change"),
      ("Exists only while the current rises", "ignored-condition", "A current that falls also changes the flux, so it also induces a current.")],
     "The flux is falling, so the induced current tries to keep it up.")

card("2022-5", "bemf", "L2", "F13", "A motor starts from rest and speeds up to full speed. When is its back e.m.f. largest?", "At full speed",
     [("At the moment it starts", "back-emf-start"), ("The same throughout", "ignored-condition", "Back e.m.f. grows as the coil turns faster."),
      ("While it is speeding up", "wrong-quantity", "That's when the speed is changing, not when it is largest.")],
     "Back e.m.f. is proportional to the speed of rotation.")
card("2022-5", "bemf", "L2", "F14", "Student says: \"A motor draws the most current at full speed, because it is doing the most work.\" What's wrong?",
     "Back e.m.f. is largest then, so the current is smallest",
     [("The current is the same at every speed", "ignored-condition", "The back e.m.f. changes with speed, so the current does too."),
      ("Back e.m.f. is largest at the start, so the current is smallest then", "back-emf-start"),
      ("The current depends only on the supply voltage", "wrong-law", "I = (V − back e.m.f.) ÷ R, so the speed matters.")],
     "I = (V − E_back) ÷ R, and E_back rises with speed.")
true_false("2022-5", "bemf", "A motor needs a starter resistor because its back e.m.f. is zero when it starts.", True, "back-emf-start",
           "With no back e.m.f., only the coil's small resistance would limit the current.")

recall("2024-14", "tr", "F01", "Ideal transformer: Vs ÷ Vp = ?", "Ns ÷ Np", ["Np ÷ Ns", "Is ÷ Ip", "(Ns ÷ Np)²"], "Each turn has the same e.m.f., so voltage ∝ turns.")
card("2024-14", "tr", "L2", "F14", "Student says: \"A transformer can step a 12 V car battery up to 240 V.\" What's wrong?",
     "A transformer needs a.c., and a battery gives d.c.",
     [("Nothing, if the turns ratio is 20", "transformer-dc"), ("It would step the voltage down instead", "inverted"),
      ("It works, but the current rises as well", "wrong-law", "An ideal transformer keeps VI the same, and steady d.c. gives no output at all.")],
     "Steady current gives steady flux, so no e.m.f. is induced in the secondary.")
true_false("2024-14", "tr", "In an ideal step-up transformer, the secondary current is larger than the primary current.", False, "inverted",
           "Power in = power out, so if V goes up, I comes down.")

# ---------- L3 scenario pools ----------
SAME = ("Combine series and parallel resistors", "wrong-law", "Some resistors here are neither in series nor in parallel.")
BRIDGE = ("Balanced bridge: leave out the middle resistor", "assumed-symmetry")
KIRCH = ("Kirchhoff's laws", "unknown-not-eliminated")
ADD = ("Add all the resistances", "series-parallel-swap")


def method(prompt, right, why):
    choices = [SAME, BRIDGE, KIRCH, ADD]
    names = {"combine": SAME[0], "bridge": BRIDGE[0], "kirchhoff": KIRCH[0]}
    return prompt, names[right], [c for c in choices if c[0] != names[right]], why


pool("p01", "2023-40", "wsb", "F30", [
    method("A 4 Ω and a 12 Ω resistor in parallel, in series with 2 Ω, across one cell. Most direct way to find the cell's current?", "combine", "Every resistor is in series or in parallel with another."),
    method("Three resistors in parallel, with the group in series with a fourth, across one cell. Most direct way to find the cell's current?", "combine", "Combine the parallel group, then add the series resistor."),
    method("A bridge of 2, 4, 3 and 6 Ω, with 5 Ω across the middle, on one cell. Most direct way to find the cell's current?", "bridge", "2 : 4 = 3 : 6, so no current flows in the 5 Ω."),
    method("A bridge of 1, 2, 5 and 10 Ω, with 8 Ω across the middle, on one cell. Most direct way to find the cell's current?", "bridge", "1 : 2 = 5 : 10, so the middle resistor carries no current."),
    method("Two cells sit in different branches, each with its own resistor, and both branches share a third resistor. Most direct way to find a branch current?", "kirchhoff", "With two sources, write loop equations."),
    method("A 6 V and a 3 V cell oppose each other through a network of three resistors. Most direct way to find the current in one resistor?", "kirchhoff", "Two sources that interact need Kirchhoff's laws."),
])

CW, ACW, NONE, BOTH = "Clockwise", "Anticlockwise", "No current", "Clockwise, then anticlockwise"
FRONT = "(Field into the page, loop viewed from the front.)"


def loop(prompt, right, wrong_tags, why):
    wrong = [(o, *wrong_tags[o]) for o in (CW, ACW, NONE, BOTH) if o != right]
    return f"{prompt} {FRONT}", right, wrong, why


ONE_WAY = ("ignored-condition", "The flux changes in one direction only, so the current keeps one direction.")
pool("p02", "2023-23", "lenz", "F31", [
    loop("The field through a loop grows steadily. Induced current?", ACW, {CW: ("lenz-same-direction",), NONE: ("flux-not-change",), BOTH: ONE_WAY},
         "The induced field must point out of the page to oppose the growing flux."),
    loop("The field through a loop shrinks steadily. Induced current?", CW, {ACW: ("lenz-opposes-field",), NONE: ("flux-not-change",), BOTH: ONE_WAY},
         "The induced field points into the page, to keep the flux up."),
    loop("A loop sits still in a steady field. Induced current?", NONE, {CW: ("flux-not-change",), ACW: ("lenz-opposes-field",), BOTH: ("ignored-condition", "Nothing changes, so there is no current at any time.")},
         "Nothing changes, so no e.m.f. is induced."),
    loop("A loop is pulled steadily out of a field region. Induced current?", CW, {ACW: ("lenz-opposes-field",), NONE: ("flux-not-change",), BOTH: ONE_WAY},
         "Less of the loop is in the field, so the flux falls and the current tries to keep it up."),
    loop("A loop moves steadily inside a large uniform field, never reaching its edge. Induced current?", NONE,
         {CW: ("flux-not-change",), ACW: ("lenz-opposes-field",), BOTH: ("ignored-condition", "The whole loop stays in the field, so the flux never changes.")},
         "The flux through the loop stays the same, so there is no e.m.f."),
    loop("A loop is pushed steadily into a field region. Induced current?", ACW, {CW: ("lenz-same-direction",), NONE: ("flux-not-change",), BOTH: ONE_WAY},
         "More of the loop is in the field, so the induced field opposes the rise."),
])

CURRENT, PD, POWER, RES = ("Current", "series-parallel-swap"), ("Pd", "series-parallel-swap"), ("Power", "power-formula-choice"), ("Resistance", "assumed-symmetry")


def same_for_both(prompt, right, why):
    pick = {"current": CURRENT, "pd": PD}[right]
    return f"{prompt} Which is the same for both?", pick[0], [c for c in (CURRENT, PD, POWER, RES) if c[0] != pick[0]], why


pool("p03", "2024-34", "sp", "F31", [
    same_for_both("A 2 Ω and a 5 Ω resistor are in series across a cell.", "current", "In series there is only one path, so the current is the same."),
    same_for_both("A 2 Ω and a 5 Ω resistor are in parallel across a cell.", "pd", "Both are joined across the same two points."),
    same_for_both("A thick wire and a thin wire of the same metal are joined end to end in a circuit.", "current", "End to end is series, so the current is the same."),
    same_for_both("A 60 W and a 100 W lamp are both plugged into the mains.", "pd", "Mains sockets are in parallel, so each lamp has the full mains voltage."),
    same_for_both("An ammeter is joined in series with a resistor.", "current", "The same current flows through both."),
    same_for_both("A voltmeter is joined across a resistor.", "pd", "The voltmeter is in parallel with the resistor."),
])

# ---------- L4 templates ----------
template("t01", "2025-6", "sp", "F40", "A {R} Ω and a {S} Ω resistor are joined in parallel, and a {T} Ω resistor is joined in series with the pair. Total resistance?",
         {"R": {"set": [2, 3, 4, 6, 8, 10, 12], "unit": "ohm"}, "S": {"set": [3, 4, 6, 12, 15, 20, 24], "unit": "ohm"}, "T": {"set": [1, 2, 3, 4, 5, 6, 8], "unit": "ohm"}},
         {"expr": "T + R*S/(R + S)", "unit": "Ω", "dim": "ohm"},
         ["1/(answer - T) == 1/R + 1/S"],
         [("series-parallel-swap", "R + S + T"), ("stopped-early", "R*S/(R + S)", "That's only the parallel pair. Add the series resistor."),
          ("wrong-law", "T + (R + S)/2", "Two resistors in parallel don't average. Use product ÷ sum."),
          ("ignored-condition", "T + R", "Current flows through both resistors of the pair, so include S."),
          ("inverted", "1/(1/T + 1/(R + S))")],
         "The pair gives RS/(R + S). Add T in series.",
         constraints=["R < S", "nice(answer, 1)"])
template("t02", "2023-43", "div", "F40", "A {E} V cell with no internal resistance is joined across a {R1} Ω and a {R2} Ω resistor in series. Pd across the {R2} Ω resistor?",
         {"E": {"set": [3, 6, 9, 12, 15, 18, 24], "unit": "V"}, "R1": {"set": [1, 2, 3, 4, 5, 6, 10], "unit": "ohm"}, "R2": {"set": [2, 3, 4, 5, 6, 8, 12, 15], "unit": "ohm"}},
         {"expr": "E*R2/(R1 + R2)", "unit": "V", "dim": "V"},
         ["answer/R2 == (E - answer)/R1"],
         [("wrong-quantity", "E*R1/(R1 + R2)", "That's the pd across the other resistor."), ("assumed-symmetry", "E/2"),
          ("ignored-condition", "E", "The cell's voltage is shared between the two resistors."),
          ("wrong-law", "E*R2/R1", "Divide by the total resistance, not by the other resistor."),
          ("stopped-early", "E/(R1 + R2)", "That's the current. Multiply by the resistance.")],
         "The current is E/(R₁ + R₂), and the pd across R₂ is that current × R₂.",
         constraints=["R1 != R2", "nice(answer, 1)"], exclude=["(E, R1, R2) == (6, 1, 2)"])
template("t03", "2016-26", "rho", "F40", "A wire {l} m long and {d} mm in diameter has a resistance of {R} Ω. Resistance of a wire of the same metal, {l2} m long and {d2} mm in diameter?",
         {"R": {"set": [2, 3, 4, 5, 6, 8, 10, 12], "unit": "ohm"}, "l": {"set": [1, 2, 4], "unit": "m"}, "l2": {"set": [1, 2, 3, 4, 6, 8], "unit": "m"},
          "d": {"set": [0.2, 0.4, 0.6], "unit": "m"}, "d2": {"set": [0.2, 0.4, 0.6, 0.8], "unit": "m"}},
         {"expr": "R*(l2/l)*(d/d2)**2", "unit": "Ω", "dim": "ohm"},
         ["answer*d2**2/l2 == R*d**2/l"],
         [("forgot-square", "R*(l2/l)*(d/d2)"), ("inverted", "R*(l/l2)*(d/d2)**2"),
          ("wrong-law", "R*(l2/l)*(d2/d)**2", "R falls as the wire gets thicker: R ∝ l/d²."),
          ("ignored-condition", "R*l2/l", "The diameter changes too, and R ∝ 1/d²."),
          ("stopped-early", "(l2/l)*(d/d2)**2", "That's only the ratio. Multiply by the first resistance.")],
         "R = ρl/A and A ∝ d², so R ∝ l/d².",
         constraints=["(l, d) != (l2, d2)", "l2 != l", "d2 != d", "nice(answer, 2)"])
template("t04", "2023-18", "heat", "F40", "A heater on fixed mains voltage warms some water in {t} min. Its wire is swapped for one of the same metal, {k} times as long and with {m} times the diameter. Time to warm the same water by the same amount?",
         {"t": {"set": [2, 3, 4, 5, 6, 8, 10, 12], "unit": "s"}, "k": {"set": [1, 2, 3, 4, 6, 8], "unit": "1"}, "m": {"set": [1, 2, 3], "unit": "1"}},
         {"expr": "t*k/m**2", "unit": "min", "dim": "s"},
         ["answer/t == (k/m**2)"],
         [("power-formula-choice", "t*m**2/k"), ("forgot-square", "t*k/m"), ("ignored-condition", "t*k", "The diameter changes too, and R ∝ 1/d²."),
          ("wrong-power", "t*k/m**4"), ("stopped-early", "k/m**2", "That's how R changes. Multiply by the first time.")],
         "R × k/m². With V fixed, P = V²/R, so the time scales the same way as R.",
         constraints=["(k, m) != (1, 1)", "nice(answer, 1)"])
template("t05", "2021-46", "pow", "F40", "A {R} Ω resistor is connected to a supply with an e.m.f. of {E} V and an internal resistance of {r} Ω. Power used in the resistor?",
         {"E": {"set": [2, 3, 4, 6, 8, 9, 12], "unit": "V"}, "r": {"set": [0.5, 1, 2, 3], "unit": "ohm"}, "R": {"set": [1, 1.5, 2, 3, 4, 5, 6, 8, 10], "unit": "ohm"}},
         {"expr": "E**2*R/(R + r)**2", "unit": "W", "dim": "W"},
         ["(answer/R)**0.5*(R + r) == E"],
         [("ignored-condition", "E**2/R", "The internal resistance takes part of the e.m.f."),
          {"tag": "wrong-quantity", "expr": "E**2/(R + r)", "detail": "That's the cell's total power, including the loss inside it."},
          {"tag": "wrong-quantity", "expr": "E**2*r/(R + r)**2", "detail": "That's the power wasted inside the cell."},
          ("stopped-early", "E/(R + r)", "That's the current. Now use P = I²R."),
          ("forgot-square", "E**2*R/(R + r)")],
         "I = E/(R + r), then P = I²R.",
         constraints=["R != r", "nice(answer, 2)"], shared_tags=True)
template("t06", "2022-23", "ir", "F40", "A cell of e.m.f. {E} V and internal resistance {r} Ω drives a {R1} Ω resistor. A {R2} Ω resistor is then joined in parallel with it. New current from the cell?",
         {"E": {"set": [3, 4.5, 6, 9, 12], "unit": "V"}, "r": {"set": [0.5, 1, 2], "unit": "ohm"}, "R1": {"set": [2, 3, 4, 6, 12], "unit": "ohm"}, "R2": {"set": [3, 4, 6, 12], "unit": "ohm"}},
         {"expr": "E/(Rp + r)", "unit": "A", "dim": "A"},
         ["answer*(R1*R2/(R1 + R2) + r) == E"],
         [("ignored-condition", "E/Rp", "The internal resistance still limits the current."), ("stopped-early", "E/(R1 + r)", "That's the current before the second resistor was added."),
          ("series-parallel-swap", "E/(R1 + R2 + r)"), ("assumed-symmetry", "2*E/(R1 + r)"),
          ("wrong-law", "E/r", "That's the current with the terminals shorted. The resistors are still in the circuit.")],
         "Combine R₁ and R₂ in parallel, add r, then I = E ÷ total.",
         derived={"Rp": "R1*R2/(R1 + R2)"}, constraints=["nice(answer, 2)"])
template("t07", "2020-33", "maxp", "F40", "A cell gives the same power to a {R1} Ω resistor as to a {R2} Ω resistor, joined one at a time. Internal resistance of the cell?",
         {"R1": {"set": [1, 2, 3, 4, 5, 6, 8, 9], "unit": "ohm"}, "R2": {"set": [4, 8, 9, 12, 16, 18, 20, 25, 27, 32, 36], "unit": "ohm"}},
         {"expr": "sqrt(R1*R2)", "unit": "Ω", "dim": "ohm"},
         ["R1/(R1 + answer)**2 == R2/(R2 + answer)**2"],
         [("assumed-symmetry", "(R1 + R2)/2"), ("wrong-law", "R2 - R1", "Equal power doesn't give r = R₂ − R₁. Set I²R equal for both loads."),
          ("stopped-early", "R1*R2", "That's r². Take the square root."), ("series-parallel-swap", "R1*R2/(R1 + R2)"), ("wrong-quantity", "R2", "That's one of the loads, not the cell.")],
         "E²R₁/(R₁ + r)² = E²R₂/(R₂ + r)² gives r² = R₁R₂.",
         constraints=["R1 < R2", "answer == int(answer)"])
template("t08", "2016-25", "cells", "F40", "Two cells of e.m.f. {E1} V and {E2} V, each with internal resistance {r} Ω, are joined in parallel, + to +, with nothing else connected. Current flowing round them?",
         {"E1": {"set": [1.5, 2, 3, 6], "unit": "V"}, "dE": {"set": [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 1, 1.5], "unit": "V"}, "r": {"set": [0.1, 0.2, 0.25, 0.4, 0.5, 1], "unit": "ohm"}},
         {"expr": "(E2 - E1)/(2*r)", "unit": "A", "dim": "A"},
         ["answer*2*r + E1 == E2"],
         [("forgot-half", "(E2 - E1)/r"), ("sign", "(E1 + E2)/(2*r)"), ("ignored-condition", "E2/(2*r)", "The other cell pushes back, so use the difference in e.m.f."),
          ("series-parallel-swap", "2*(E2 - E1)/r"), ("wrong-quantity", "(E2 - E1)**2/(2*r)", "That's the power wasted, not the current.")],
         "The net e.m.f. E₂ − E₁ drives current through both internal resistances in series.",
         derived={"E2": "E1 + dE"}, constraints=["nice(answer, 2)"])
template("t09", "2021-31", "potr", "F40", "A potentiometer balances a cell at {l1} cm on open circuit, and at {l2} cm when a {R} Ω resistor is joined across the cell. Internal resistance of the cell?",
         {"l1": {"set": [50, 60, 72, 75, 80, 90, 96, 100], "unit": "m"}, "l2": {"set": [40, 45, 48, 50, 60, 64, 75, 80], "unit": "m"}, "R": {"set": [2, 3, 4, 5, 6, 8, 10], "unit": "ohm"}},
         {"expr": "R*(l1 - l2)/l2", "unit": "Ω", "dim": "ohm"},
         ["(answer + R)/R == l1/l2"],
         [("inverted", "R*(l1 - l2)/l1"), ("stopped-early", "R*l1/l2", "That's R × l₁ ÷ l₂. Subtract R."), ("wrong-law", "R*l2/l1", "E ÷ V = l₁ ÷ l₂ gives r = R(l₁ − l₂) ÷ l₂."),
          ("ignored-condition", "(l1 - l2)/l2", "Multiply by R. The length ratio alone has no unit."), ("sign", "R*(l1 + l2)/l2")],
         "E ÷ V = l₁ ÷ l₂, and E ÷ V = (R + r) ÷ R.",
         constraints=["l2 < l1", "nice(answer, 2)"])
template("t10", "2024-26", "potg", "F40", "A {L} cm potentiometer wire has {V} V across it. A cell balances at {l} cm. E.m.f. of the cell?",
         {"L": {"set": [100, 200], "unit": "m"}, "V": {"set": [1.5, 2, 2.5, 3, 4], "unit": "V"}, "l": {"set": list(range(20, 196, 4)), "unit": "m"}},
         {"expr": "V*l/L", "unit": "V", "dim": "V"},
         ["answer/l == V/L"],
         [("inverted", "V*L/l"), ("ignored-condition", "V", "Only part of the wire balances the cell."), ("wrong-quantity", "V*(L - l)/L", "That's the pd across the rest of the wire."),
          ("wrong-law", "V*l/100", "Divide by the length of this wire, not by 100 cm."), ("assumed-symmetry", "V/2")],
         "Potential gradient = V ÷ L. The e.m.f. = gradient × balance length.",
         constraints=["l < L", "nice(answer, 2)"])
template("t11", "2023-40", "wsb", "F40", "Resistors of {P} Ω and {Q} Ω form one side of a bridge, and {R} Ω and {S} Ω the other, with a {G} Ω resistor joining the middle points. A {E} V cell with no internal resistance drives it. Current through the cell?",
         {"P": {"set": [1, 2, 3, 4], "unit": "ohm"}, "Q": {"set": [2, 3, 4, 6, 8], "unit": "ohm"}, "R": {"set": [2, 3, 4, 6], "unit": "ohm"}, "G": {"set": [5, 10], "unit": "ohm"},
          "E": {"set": [3, 6, 12], "unit": "V"}},
         {"expr": "E/((P + Q)*(R + S)/(P + Q + R + S))", "unit": "A", "dim": "A"},
         ["answer == E/(P + Q) + E/(R + S)"],
         [("ignored-condition", "E/(P + Q)", "Both sides carry current. Combine them in parallel."), ("wrong-quantity", "E/(R + S)", "That's the current in one side only."),
          ("series-parallel-swap", "E/(P + Q + R + S)"), ("stopped-early", "(P + Q)*(R + S)/(P + Q + R + S)", "That's the total resistance. Now find I = E/R."),
          ("wrong-law", "E*(1/(P + Q) + 1/(R + S) + 1/G)", "No current flows in the middle resistor, so leave it out.")],
         "P : Q = R : S, so no current flows in the middle resistor. The two sides are in parallel.",
         derived={"S": "Q*R/P"}, constraints=["S == int(S)", "S <= 24", "nice(answer, 2)"])
template("t12", "2025-9", "far", "F40", "A {N}-turn coil of area {A} cm² lies perpendicular to a magnetic field. The flux density rises steadily from {B1} T to {B2} T in {t} s. Induced e.m.f.?",
         {"N": {"set": [50, 100, 200, 250, 400, 500], "unit": "1"}, "A": {"set": [10, 20, 25, 40, 50, 100], "unit": "m^2"},
          "B1": {"set": [0, 0.02, 0.04, 0.1], "unit": "tesla"}, "B2": {"set": [0.05, 0.1, 0.2, 0.3, 0.5], "unit": "tesla"}, "t": {"set": [0.1, 0.2, 0.4, 0.5, 1, 2], "unit": "s"}},
         {"expr": "N*A*1e-4*(B2 - B1)/t", "unit": "V", "dim": "V"},
         ["answer*t == N*(A/10000)*(B2 - B1)"],
         [("forgot-turns", "A*1e-4*(B2 - B1)/t"), ("flux-not-change", "N*A*1e-4*B2/t"), ("sign", "N*A*1e-4*(B2 + B1)/t"),
          ("stopped-early", "N*A*1e-4*(B2 - B1)", "That's the change in flux linkage. Divide by the time."),
          ("wrong-law", "N*A*1e-4*(B2 - B1)*t", "E.m.f. is a rate: divide by the time, don't multiply.")],
         "E = N × A × ΔB ÷ Δt, with A in m².",
         constraints=["B2 > B1", "nice(answer, 3)", "0.001 <= answer <= 50"], exclude=["B1 == 0.01"])
template("t13", "2024-14", "tr", "F40", "An ideal transformer has {Np} primary turns and {Ns} secondary turns. The primary takes {Ip} A r.m.s. from a {Vp} V r.m.s. supply. Secondary current?",
         {"Np": {"set": [100, 200, 400, 500, 1000, 1200], "unit": "1"}, "Ns": {"set": [50, 100, 200, 400, 600, 2000, 2400], "unit": "1"},
          "Ip": {"set": [0.5, 1, 2, 4, 5, 10], "unit": "A"}, "Vp": {"set": [12, 24, 110, 230], "unit": "V"}},
         {"expr": "Ip*Np/Ns", "unit": "A", "dim": "A"},
         ["answer*Vp*Ns/Np == Vp*Ip"],
         [("inverted", "Ip*Ns/Np"), ("ignored-condition", "Ip", "The current changes the opposite way to the voltage."),
          ("wrong-quantity", "Vp*Ns/Np", "That's the secondary voltage, not the current."), ("stopped-early", "Vp*Ip", "That's the power. Divide by the secondary voltage."),
          ("wrong-power", "Ip*(Np/Ns)**2")],
         "Power in = power out, so Is = Ip × Np ÷ Ns.",
         constraints=["Np != Ns", "nice(answer, 2)"])


def bank(bid, source, skill, statements, why, conflicts=()):
    b = item_base(f"{UNIT}.{bid}", "L4", "F42", skill, source, SOURCE_DIFFICULTY[source])
    b.update(statements=[dict(text=text(t), true=truth, **({"tag": tag} if tag else {})) for t, truth, tag in statements],
             conflicts=[list(c) for c in conflicts], explanation=text(why))
    BANKS.append(b)


bank("b01", "2022-31", "drift", [
    ("The current is the same in the thick and the thin part of a wire.", True, None),
    ("Electrons drift faster in the thin part of a wire.", True, None),
    ("The thin part of a wire has more resistance per metre.", True, None),
    ("More power is turned to heat per metre in the thin part of a wire.", True, None),
    ("The current is smaller in the thin part of a wire.", False, "current-used-up"),
    ("Electrons drift at the same speed in the thick and the thin part.", False, "drift-thin-slower"),
    ("Electrons drift more slowly in the thin part of a wire.", False, "drift-thin-slower"),
    ("The thin part of a wire has less resistance per metre.", False, "inverted"),
], "The same current flows all along, so the electrons drift faster where the area is smaller, and the thin part has more resistance per metre.",
    conflicts=[(0, 4), (1, 5), (1, 6), (5, 6), (2, 7)])
bank("b02", "2016-5", "potp", [
    ("At balance, no current flows through the cell being tested.", True, None),
    ("A longer wire, with the same driver cell, has a smaller potential gradient.", True, None),
    ("A potentiometer measures an e.m.f. without taking current from it.", True, None),
    ("Adding resistance to the driver circuit lowers the potential gradient.", True, None),
    ("At balance, the cell being tested drives a small current through the galvanometer.", False, "pot-draws-current"),
    ("Raising the voltage across the wire makes the potentiometer more sensitive.", False, "inverted"),
    ("Any driver cell gives a balance point, even one weaker than the cell tested.", False, "pot-driver-too-small"),
    ("A shorter wire, with the same driver cell, has a smaller potential gradient.", False, "inverted"),
], "A smaller potential gradient means a longer balance length for the same e.m.f., so the reading is more sensitive.",
    conflicts=[(0, 4), (1, 7), (2, 4)])

data = dict(
    spec_version=SPEC_VERSION, status="draft, not teacher reviewed", medium="en",
    skills=[dict(id=i, name=n, name_si=text(n)["si"], type=t) for i, n, t in SKILLS.values()],
    cards=CARDS, pools=POOLS, templates=TEMPLATES, banks=BANKS,
)
if MISSING and not os.environ.get("ENGLISH_ONLY"):
    (HERE / "missing.txt").write_text("\n".join(sorted(MISSING)) + "\n")
    raise SystemExit(f"no Sinhala for {len(MISSING)} strings (listed in missing.txt)")
(HERE / "items.json").write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
print(f"wrote {len(CARDS)} cards, {len(POOLS)} scenarios, {len(TEMPLATES)} templates, {len(BANKS)} banks")
