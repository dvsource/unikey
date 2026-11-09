"""Build the A/L Physics Current Electricity skill graph (Unit 8) and its past-paper mapping.

Source of the graph: NIE syllabus (2017) Unit 8, competency levels 8.1-8.6, and the
NIE Grade 13 resource book (Units 5-8). Past papers are mapped onto the graph afterwards;
they never add skills.

Run:  python3 content/skills/current-electricity/author.py [--db ~/Work/ALPhysics/db/alphysics.db]
Writes: graph.json, question-map.json, coverage.md, skills.md
Then: python3 content/skills/current-electricity/validate.py
"""
import argparse
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import graphkit  # noqa: E402
from graphkit import C, P, R  # noqa: E402

REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SAMPLE = os.path.join(REPO, "content", "samples", "current-electricity-20", "items.json")
SPEC_VERSION = "0.5"

UNIT = {"id": "phy.elec", "name": "Current Electricity", "syllabus_unit": 8, "periods": 70}
SOURCES = [
    "resources/nie/physics/en/syllabus/AL-Physics-Syllabus-Gr12-13-en.pdf (Unit 8)",
    "resources/nie/physics/en/resource-books/Gr13-Physics-RB-Unit05-08-en.pdf",
]
CANDIDATE_SQL = ("unit_no = 8 OR (unit_no = 7 AND subtopic IN "
                 "('Electromagnetic Induction', 'Transformer', 'Motional EMF', 'Eddy Currents'))")
CANDIDATE_RULE = "unit_no = 8, plus the unit_no = 7 induction subtopics that the NIE syllabus puts in Unit 8 (8.6)"

# NIE competency levels (syllabus Unit 8) and their periods.
TOPICS = {
    "8.1": ("Current, resistance and resistor networks", 12),
    "8.2": ("Electrical energy and power", 6),
    "8.3": ("Electromotive force and internal resistance", 12),
    "8.4": ("Kirchhoff's laws", 8),
    "8.5": ("Measuring instruments, bridges and the potentiometer", 12),
    "8.6": ("Electromagnetic induction, a.c. and transformers", 20),
}

# Shared maths layer (targets of uses-math edges). Same IDs as Mechanics.
MATH = {
    "math.algebra.rearrange": "Rearranging a formula for one variable",
    "math.algebra.proportion": "Ratio, proportion and scaling",
    "math.algebra.simultaneous": "Solving two simultaneous linear equations",
    "math.graph.gradient": "Gradient of a straight line or tangent",
    "math.geometry.mensuration": "Areas and volumes of circles, cylinders, spheres",
    "math.trig.ratios": "sin, cos, tan and the special angles 30°, 45°, 60°",
}

# Skills outside Unit 8 that Electricity skills link to, or that its questions test. Stubs only.
EXTERNAL = {
    "phy.estat.cap.capacitance": ("Capacitance and Q = CV", "6.4"),
    "phy.mag.force.conductor": ("Force on a current-carrying conductor, F = BIl", "7.1"),
    "phy.mag.field.wire-field": ("Magnetic field of a current-carrying conductor", "7.2"),
    "phy.therm.heat.specific-heat": ("Heat capacity and specific heat capacity", "4.5"),
}

# id, name, competency level, sub-topic (NIE content heading), type, est_minutes, math deps
SKILLS = [
    # 8.1 Fundamental concepts
    ("phy.elec.cur.charge-current", "Current as the rate of flow of charge", "8.1", "Fundamental concepts", C, 10, []),
    ("phy.elec.cur.drift-velocity", "Drift velocity and current density, I = nAve", "8.1", "Mechanism of conduction", P, 20, ["math.algebra.proportion", "math.geometry.mensuration"]),
    ("phy.elec.res.ohms-law-iv", "Ohm's law and I–V curves", "8.1", "Ohm's law", C, 15, ["math.graph.gradient"]),
    ("phy.elec.res.resistivity", "Resistance and resistivity, R = ρl/A", "8.1", "Resistance and resistivity", P, 20, ["math.algebra.proportion", "math.geometry.mensuration"]),
    ("phy.elec.res.temperature", "Change of resistance with temperature", "8.1", "Variation of resistance with temperature", P, 15, ["math.algebra.rearrange"]),
    ("phy.elec.res.superconductors", "Superconductors: properties and uses", "8.1", "Superconductivity", R, 10, []),
    ("phy.elec.res.series-parallel", "Resistors in series and parallel", "8.1", "Combination of resistors", P, 20, ["math.algebra.rearrange"]),
    ("phy.elec.res.network-reduction", "Reducing networks: symmetry, bridges and ladders", "8.1", "Combination of resistors", P, 25, []),
    ("phy.elec.res.circuit-changes", "What changes when a component is removed, shorted or burns out", "8.1", "Combination of resistors", C, 15, []),
    ("phy.elec.cur.potential-divider", "Potential divider", "8.1", "Potential divider circuit", P, 20, ["math.algebra.proportion"]),
    # 8.2 Energy and power
    ("phy.elec.pow.power-formulas", "Electrical power: P = VI = I²R = V²/R", "8.2", "Energy and power", P, 15, ["math.algebra.rearrange"]),
    ("phy.elec.pow.joule-heating", "Joule heating: heaters, energy and time", "8.2", "Energy and power", P, 20, ["math.algebra.proportion"]),
    ("phy.elec.pow.power-graphs", "How power varies with current, voltage and resistance", "8.2", "Energy and power", C, 15, ["math.graph.gradient"]),
    ("phy.elec.pow.ratings", "Appliance ratings, energy in kWh and cost", "8.2", "Energy and power", P, 10, []),
    # 8.3 Electromotive force
    ("phy.elec.emf.sources", "Sources of e.m.f. and their energy changes", "8.3", "Electromotive force", R, 10, []),
    ("phy.elec.emf.definition", "E.m.f. and potential difference", "8.3", "Electromotive force", C, 10, []),
    ("phy.elec.emf.internal-resistance", "Terminal pd and internal resistance, V = E − Ir", "8.3", "Internal resistance", P, 20, ["math.algebra.rearrange"]),
    ("phy.elec.emf.ir-graph", "E and r from a V–I graph", "8.3", "Internal resistance", P, 15, ["math.graph.gradient"]),
    ("phy.elec.emf.cell-combinations", "Cells in series, and identical cells in parallel", "8.3", "Combination of sources of e.m.f.", P, 20, []),
    ("phy.elec.emf.max-power", "Maximum power transfer", "8.3", "Combination of sources of e.m.f.", P, 15, ["math.algebra.proportion"]),
    # 8.4 Kirchhoff's laws
    ("phy.elec.kir.junction-rule", "Kirchhoff's first law", "8.4", "Kirchhoff's laws", C, 10, []),
    ("phy.elec.kir.loop-rule", "Kirchhoff's second law and circuits with several sources", "8.4", "Kirchhoff's laws", P, 25, ["math.algebra.simultaneous"]),
    ("phy.elec.kir.potential-at-point", "Potential at a point, and pd between two points", "8.4", "Kirchhoff's laws", P, 20, []),
    ("phy.elec.kir.capacitor-dc", "Steady d.c. circuits with a capacitor", "8.4", "Kirchhoff's laws", P, 20, []),
    # 8.5 Measuring instruments
    ("phy.elec.meter.ammeter-voltmeter", "Ammeters, voltmeters and ideal meters", "8.5", "Ammeter, voltmeter and multimeter", C, 15, []),
    ("phy.elec.meter.multimeter", "Using and reading a multimeter", "8.5", "Ammeter, voltmeter and multimeter", P, 15, []),
    ("phy.elec.bridge.wheatstone-balance", "Balanced Wheatstone bridge", "8.5", "Wheatstone bridge", P, 20, ["math.algebra.proportion"]),
    ("phy.elec.bridge.metre-bridge", "Metre bridge: unknown resistance and temperature coefficient", "8.5", "Metre bridge", P, 20, ["math.algebra.proportion"]),
    ("phy.elec.pot.principle", "Potentiometer principle and sensitivity", "8.5", "Potentiometer", C, 15, []),
    ("phy.elec.pot.potential-gradient", "Potential gradient along a potentiometer wire", "8.5", "Potentiometer", P, 20, ["math.algebra.proportion"]),
    ("phy.elec.pot.compare-emf", "Comparing e.m.f.s with a potentiometer", "8.5", "Uses of the potentiometer", P, 15, ["math.algebra.proportion"]),
    ("phy.elec.pot.internal-resistance", "Internal resistance with a potentiometer", "8.5", "Uses of the potentiometer", P, 20, ["math.algebra.rearrange"]),
    # 8.6 Electromagnetic induction
    ("phy.elec.emi.flux", "Magnetic flux and flux linkage", "8.6", "Magnetic flux", P, 15, ["math.trig.ratios"]),
    ("phy.elec.emi.faraday", "Faraday's law: e.m.f. from the rate of change of flux", "8.6", "Laws of electromagnetic induction", P, 20, ["math.algebra.rearrange"]),
    ("phy.elec.emi.lenz", "Lenz's law: direction of the induced current", "8.6", "Laws of electromagnetic induction", C, 20, []),
    ("phy.elec.emi.lenz-energy", "Lenz's law, energy and magnetic braking", "8.6", "Laws of electromagnetic induction", C, 15, []),
    ("phy.elec.emi.moving-rod", "E.m.f. in a moving rod, E = Blv, and the right-hand rule", "8.6", "Moving and rotating conductors", P, 20, []),
    ("phy.elec.emi.loop-through-field", "A loop moving through a field region", "8.6", "Moving and rotating conductors", P, 25, ["math.graph.gradient"]),
    ("phy.elec.emi.rotating-rod-disc", "E.m.f. of a rotating rod or disc, E = ½Bωr²", "8.6", "Moving and rotating conductors", P, 15, []),
    ("phy.elec.emi.rotating-coil", "Rotating coil and the a.c. generator, E = NBAω sin ωt", "8.6", "Alternating current generator", P, 20, ["math.trig.ratios"]),
    ("phy.elec.ac.rms", "r.m.s. and peak values, and average power", "8.6", "Alternating current", P, 15, ["math.algebra.proportion"]),
    ("phy.elec.emi.eddy-currents", "Eddy currents and their uses", "8.6", "Eddy currents", C, 10, []),
    ("phy.elec.emi.back-emf", "Back e.m.f. of a motor and the starter", "8.6", "Back e.m.f. of an electric motor", C, 15, []),
    ("phy.elec.tr.ideal-transformer", "Ideal transformer: turns ratio and voltage", "8.6", "Transformers", P, 15, ["math.algebra.proportion"]),
    ("phy.elec.tr.power-current", "Transformer power and current ratio", "8.6", "Transformers", P, 15, ["math.algebra.proportion"]),
    ("phy.elec.tr.losses-transmission", "Transformer losses and power transmission", "8.6", "Transmission of electric power", C, 15, []),
]

# Hard prerequisites only (DR-0022): the skill can't be done without these.
REQUIRES = {
    "phy.elec.cur.drift-velocity": ["phy.elec.cur.charge-current"],
    "phy.elec.res.ohms-law-iv": ["phy.elec.cur.charge-current"],
    "phy.elec.res.temperature": ["phy.elec.res.resistivity"],
    "phy.elec.res.superconductors": ["phy.elec.res.temperature"],
    "phy.elec.res.series-parallel": ["phy.elec.res.ohms-law-iv"],
    "phy.elec.res.network-reduction": ["phy.elec.res.series-parallel"],
    "phy.elec.res.circuit-changes": ["phy.elec.res.series-parallel"],
    "phy.elec.cur.potential-divider": ["phy.elec.res.series-parallel"],
    "phy.elec.pow.power-formulas": ["phy.elec.res.ohms-law-iv"],
    "phy.elec.pow.joule-heating": ["phy.elec.pow.power-formulas"],
    "phy.elec.pow.power-graphs": ["phy.elec.pow.power-formulas"],
    "phy.elec.pow.ratings": ["phy.elec.pow.power-formulas"],
    "phy.elec.emf.internal-resistance": ["phy.elec.emf.definition", "phy.elec.res.series-parallel"],
    "phy.elec.emf.ir-graph": ["phy.elec.emf.internal-resistance"],
    "phy.elec.emf.cell-combinations": ["phy.elec.emf.internal-resistance"],
    "phy.elec.emf.max-power": ["phy.elec.emf.internal-resistance", "phy.elec.pow.power-formulas"],
    "phy.elec.kir.junction-rule": ["phy.elec.cur.charge-current"],
    "phy.elec.kir.loop-rule": ["phy.elec.kir.junction-rule", "phy.elec.res.ohms-law-iv"],
    "phy.elec.kir.potential-at-point": ["phy.elec.res.series-parallel"],
    "phy.elec.kir.capacitor-dc": ["phy.elec.res.series-parallel", "phy.estat.cap.capacitance"],
    "phy.elec.meter.ammeter-voltmeter": ["phy.elec.res.series-parallel"],
    "phy.elec.meter.multimeter": ["phy.elec.meter.ammeter-voltmeter"],
    "phy.elec.bridge.wheatstone-balance": ["phy.elec.cur.potential-divider"],
    "phy.elec.bridge.metre-bridge": ["phy.elec.bridge.wheatstone-balance", "phy.elec.res.resistivity"],
    "phy.elec.pot.principle": ["phy.elec.cur.potential-divider", "phy.elec.emf.definition"],
    "phy.elec.pot.potential-gradient": ["phy.elec.pot.principle"],
    "phy.elec.pot.compare-emf": ["phy.elec.pot.principle"],
    "phy.elec.pot.internal-resistance": ["phy.elec.pot.potential-gradient", "phy.elec.emf.internal-resistance"],
    "phy.elec.emi.faraday": ["phy.elec.emi.flux"],
    "phy.elec.emi.lenz": ["phy.elec.emi.flux"],
    "phy.elec.emi.lenz-energy": ["phy.elec.emi.lenz"],
    "phy.elec.emi.moving-rod": ["phy.elec.emi.faraday"],
    "phy.elec.emi.loop-through-field": ["phy.elec.emi.moving-rod", "phy.elec.emi.lenz"],
    "phy.elec.emi.rotating-rod-disc": ["phy.elec.emi.moving-rod"],
    "phy.elec.emi.rotating-coil": ["phy.elec.emi.faraday"],
    "phy.elec.ac.rms": ["phy.elec.pow.power-formulas"],
    "phy.elec.emi.eddy-currents": ["phy.elec.emi.lenz"],
    "phy.elec.emi.back-emf": ["phy.elec.emi.faraday", "phy.mag.force.conductor"],
    "phy.elec.tr.ideal-transformer": ["phy.elec.emi.faraday"],
    "phy.elec.tr.power-current": ["phy.elec.tr.ideal-transformer", "phy.elec.pow.power-formulas"],
    "phy.elec.tr.losses-transmission": ["phy.elec.tr.power-current"],
}

HELPS = [
    ("phy.elec.res.ohms-law-iv", "phy.elec.res.resistivity"),
    ("phy.elec.res.resistivity", "phy.elec.res.series-parallel"),           # identical wires side by side
    ("phy.elec.bridge.wheatstone-balance", "phy.elec.res.network-reduction"), # a balanced bridge drops a resistor
    ("phy.elec.meter.ammeter-voltmeter", "phy.elec.cur.potential-divider"),  # a real voltmeter loads the divider
    ("phy.therm.heat.specific-heat", "phy.elec.pow.joule-heating"),
    ("phy.elec.emf.sources", "phy.elec.emf.definition"),
    ("phy.elec.emf.definition", "phy.elec.kir.loop-rule"),
    ("phy.elec.kir.loop-rule", "phy.elec.kir.potential-at-point"),
    ("phy.elec.kir.loop-rule", "phy.elec.emf.cell-combinations"),           # cells of unequal e.m.f. in parallel
    ("phy.elec.res.temperature", "phy.elec.bridge.metre-bridge"),
    ("phy.elec.emi.lenz", "phy.elec.emi.moving-rod"),
    ("phy.mag.field.wire-field", "phy.elec.emi.lenz"),                     # most Lenz questions use a wire's field
    ("phy.mag.force.conductor", "phy.elec.emi.lenz-energy"),               # the braking force is BIl
    ("phy.elec.emi.rotating-coil", "phy.elec.ac.rms"),
    ("phy.elec.emi.eddy-currents", "phy.elec.tr.losses-transmission"),
    ("phy.elec.pot.compare-emf", "phy.elec.pot.internal-resistance"),     # same balance-length method
    ("phy.elec.pot.potential-gradient", "phy.elec.pot.compare-emf"),
]

# (from, to, credit weight for implicit review, 0.3–0.7 per DR-0022)
ENCOMPASSES = [
    ("phy.elec.res.network-reduction", "phy.elec.res.series-parallel", 0.6),
    ("phy.elec.res.circuit-changes", "phy.elec.res.series-parallel", 0.4),
    ("phy.elec.cur.potential-divider", "phy.elec.res.series-parallel", 0.4),
    ("phy.elec.pow.joule-heating", "phy.elec.pow.power-formulas", 0.5),
    ("phy.elec.pow.power-graphs", "phy.elec.pow.power-formulas", 0.4),
    ("phy.elec.emf.ir-graph", "phy.elec.emf.internal-resistance", 0.5),
    ("phy.elec.emf.cell-combinations", "phy.elec.emf.internal-resistance", 0.5),
    ("phy.elec.emf.max-power", "phy.elec.emf.internal-resistance", 0.5),
    ("phy.elec.kir.capacitor-dc", "phy.elec.kir.loop-rule", 0.4),
    ("phy.elec.kir.potential-at-point", "phy.elec.cur.potential-divider", 0.4),
    ("phy.elec.bridge.metre-bridge", "phy.elec.bridge.wheatstone-balance", 0.6),
    ("phy.elec.pot.compare-emf", "phy.elec.pot.potential-gradient", 0.5),
    ("phy.elec.pot.internal-resistance", "phy.elec.pot.compare-emf", 0.5),
    ("phy.elec.emi.faraday", "phy.elec.emi.flux", 0.5),
    ("phy.elec.emi.lenz-energy", "phy.elec.emi.lenz", 0.4),
    ("phy.elec.emi.loop-through-field", "phy.elec.emi.moving-rod", 0.6),
    ("phy.elec.emi.loop-through-field", "phy.elec.emi.lenz", 0.4),
    ("phy.elec.emi.rotating-rod-disc", "phy.elec.emi.moving-rod", 0.4),
    ("phy.elec.emi.eddy-currents", "phy.elec.emi.lenz", 0.4),
    ("phy.elec.tr.power-current", "phy.elec.tr.ideal-transformer", 0.6),
]

# (a, b, why): only pairs where students pick the wrong idea or method (DR-0022)
CONFUSABLE = [
    ("phy.elec.pot.compare-emf", "phy.elec.emf.internal-resistance", "emf-vs-terminal-pd"),
    ("phy.elec.meter.ammeter-voltmeter", "phy.elec.cur.potential-divider", "an ideal voltmeter draws no current; a real one changes the divider"),
    ("phy.elec.emi.moving-rod", "phy.mag.force.conductor", "hand-rule-direction"),
    ("phy.elec.tr.ideal-transformer", "phy.elec.ac.rms", "peak and r.m.s. values mixed in one calculation"),
]

# Past-paper mapping: uid -> (primary skill, [secondary skills], note)
QMAP = {
    # Meters
    "2016-7": ("phy.elec.meter.ammeter-voltmeter", [], ""),
    "2019-26": ("phy.elec.meter.multimeter", [], ""),
    # Capacitors in d.c. circuits
    "2018-21": ("phy.elec.kir.capacitor-dc", ["phy.estat.cap.capacitance"], ""),
    "2022-30": ("phy.elec.kir.capacitor-dc", ["phy.elec.kir.loop-rule"], ""),
    "2020-14": ("phy.elec.kir.capacitor-dc", ["phy.elec.kir.loop-rule"], "DB files this as Kirchhoff's laws"),
    # Current and drift velocity
    "2022-31": ("phy.elec.cur.drift-velocity", ["phy.elec.pow.power-formulas"], ""),
    "2023-48": ("phy.elec.cur.drift-velocity", [], ""),
    # Power
    "2017-40": ("phy.elec.pow.power-graphs", [], ""),
    "2018-25": ("phy.elec.pow.power-formulas", ["phy.elec.res.series-parallel"], ""),
    "2019-47": ("phy.elec.ac.rms", ["phy.elec.pow.power-formulas"], "average power from voltage and current waveforms"),
    "2021-46": ("phy.elec.pow.power-formulas", ["phy.elec.emf.internal-resistance"], ""),
    "2023-18": ("phy.elec.pow.joule-heating", ["phy.elec.res.resistivity"], ""),
    "2024-24": ("phy.elec.pow.power-graphs", [], ""),
    # E.m.f. and internal resistance
    "2018-9": ("phy.elec.emf.sources", [], ""),
    "2016-25": ("phy.elec.emf.cell-combinations", ["phy.elec.pow.power-formulas"], "two cells of unequal e.m.f. in parallel"),
    "2019-45": ("phy.elec.emf.cell-combinations", ["phy.elec.kir.potential-at-point"], ""),
    "2019-46": ("phy.elec.emf.internal-resistance", ["phy.elec.kir.loop-rule"], "a reversible source in series with the cell"),
    "2020-33": ("phy.elec.emf.max-power", ["phy.elec.emf.internal-resistance"], "equal power in two resistors gives r = √(R₁R₂)"),
    "2022-23": ("phy.elec.emf.internal-resistance", [], ""),
    # Kirchhoff and potentials
    "2016-43": ("phy.elec.kir.loop-rule", ["phy.elec.kir.potential-at-point"], ""),
    "2021-23": ("phy.elec.kir.potential-at-point", ["phy.elec.cur.potential-divider"], "DB files this as a Wheatstone bridge"),
    # Potential divider
    "2017-41": ("phy.elec.cur.potential-divider", ["phy.elec.kir.potential-at-point"], ""),
    "2018-42": ("phy.elec.cur.potential-divider", ["phy.elec.meter.ammeter-voltmeter"], ""),
    "2020-38": ("phy.elec.cur.potential-divider", ["phy.elec.meter.ammeter-voltmeter"], ""),
    "2023-43": ("phy.elec.cur.potential-divider", [], ""),
    # Potentiometer
    "2016-5": ("phy.elec.pot.principle", ["phy.elec.pot.potential-gradient"], ""),
    "2017-5": ("phy.elec.pot.principle", [], ""),
    "2020-17": ("phy.elec.pot.potential-gradient", ["phy.elec.pot.compare-emf"], ""),
    "2021-31": ("phy.elec.pot.internal-resistance", [], ""),
    "2024-26": ("phy.elec.pot.potential-gradient", [], ""),
    "2025-24": ("phy.elec.pot.internal-resistance", [], ""),
    # Resistors and networks
    "2016-26": ("phy.elec.res.resistivity", ["phy.elec.res.series-parallel"], ""),
    "2017-8": ("phy.elec.res.network-reduction", [], ""),
    "2018-24": ("phy.elec.res.series-parallel", ["phy.elec.meter.ammeter-voltmeter"], "voltmeter resistance in parallel"),
    "2018-26": ("phy.elec.res.circuit-changes", [], "bulbs burning out"),
    "2019-49": ("phy.elec.res.network-reduction", [], ""),
    "2020-47": ("phy.elec.res.network-reduction", [], "infinite ladder"),
    "2021-40": ("phy.elec.res.network-reduction", [], ""),
    "2021-43": ("phy.elec.res.series-parallel", ["phy.elec.res.resistivity"], "two arcs of a ring in parallel"),
    "2022-41": ("phy.elec.res.network-reduction", [], ""),
    "2023-29": ("phy.elec.res.network-reduction", [], ""),
    "2024-18": ("phy.elec.res.series-parallel", ["phy.elec.cur.potential-divider"], ""),
    "2024-34": ("phy.elec.res.series-parallel", [], ""),
    "2025-6": ("phy.elec.res.series-parallel", [], ""),
    "2025-29": ("phy.elec.res.series-parallel", ["phy.elec.cur.potential-divider"], ""),
    # Wheatstone bridge
    "2016-40": ("phy.elec.bridge.wheatstone-balance", ["phy.elec.kir.loop-rule"], "bridge with a cell in each arm"),
    "2017-26": ("phy.elec.bridge.wheatstone-balance", ["phy.elec.emf.internal-resistance"], ""),
    "2023-40": ("phy.elec.bridge.wheatstone-balance", [], ""),
    # Electromagnetic induction (DB unit 7)
    "2016-48": ("phy.elec.emi.loop-through-field", ["phy.elec.emi.lenz"], ""),
    "2017-34": ("phy.elec.emi.lenz", [], ""),
    "2017-48": ("phy.elec.emi.lenz", ["phy.mag.field.wire-field"], ""),
    "2019-20": ("phy.elec.emi.faraday", ["phy.elec.emi.flux", "phy.mag.field.wire-field"], ""),
    "2020-29": ("phy.elec.emi.faraday", [], ""),
    "2021-50": ("phy.elec.emi.loop-through-field", [], ""),
    "2022-5": ("phy.elec.emi.back-emf", [], ""),
    "2022-39": ("phy.elec.emi.rotating-rod-disc", [], ""),
    "2023-23": ("phy.elec.emi.lenz", ["phy.mag.field.wire-field"], ""),
    "2024-11": ("phy.elec.emi.lenz-energy", [], ""),
    "2025-9": ("phy.elec.emi.faraday", ["phy.elec.emi.flux"], ""),
    "2018-49": ("phy.elec.emi.moving-rod", [], ""),
    "2023-47": ("phy.elec.emi.loop-through-field", ["phy.elec.emi.moving-rod"], ""),
    "2017-49": ("phy.elec.emi.eddy-currents", ["phy.elec.emi.lenz"], ""),
    "2025-33": ("phy.elec.emi.eddy-currents", ["phy.elec.emi.lenz-energy"], ""),
    # Transformers (DB unit 7)
    "2016-6": ("phy.elec.tr.ideal-transformer", [], ""),
    "2017-30": ("phy.elec.tr.ideal-transformer", [], "a d.c. offset is not passed to the secondary"),
    "2018-8": ("phy.elec.tr.ideal-transformer", [], ""),
    "2019-19": ("phy.elec.tr.power-current", ["phy.elec.tr.ideal-transformer"], ""),
    "2024-14": ("phy.elec.tr.power-current", ["phy.elec.tr.ideal-transformer"], ""),
}

# Skills the syllabus pairs with a set practical or activity. Draft list.
PRACTICAL = {
    "phy.elec.res.ohms-law-iv",          # I–V curves of ohmic and non-ohmic conductors
    "phy.elec.emf.ir-graph",             # e.m.f. and internal resistance by the graphical method
    "phy.elec.meter.multimeter",         # using a multimeter
    "phy.elec.bridge.metre-bridge",      # metre bridge, temperature coefficient of resistance
    "phy.elec.pot.compare-emf",          # comparing e.m.f.s
    "phy.elec.pot.internal-resistance",  # internal resistance by potentiometer
}


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=graphkit.DEFAULT_DB)
    graphkit.build(sys.modules[__name__], ap.parse_args().db)
