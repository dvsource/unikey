"""Build the A/L Physics Thermal Physics skill graph (Unit 4) and its past-paper mapping.

Source of the graph: NIE syllabus (2017) Unit 4, competency levels 4.1-4.9, and the
NIE Grade 12 resource book (Unit 4). Past papers are mapped onto the graph afterwards;
they never add skills.

Run:  python3 content/skills/thermal-physics/author.py [--db ~/Work/ALPhysics/db/alphysics.db]
Writes: graph.json, question-map.json, coverage.md, skills.md
Then: python3 content/skills/thermal-physics/validate.py
"""
import argparse
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
import graphkit  # noqa: E402
from graphkit import C, P, R  # noqa: E402

REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SAMPLE = os.path.join(REPO, "content", "samples", "thermal-physics-20", "items.json")
SPEC_VERSION = "0.5"

UNIT = {"id": "phy.therm", "name": "Thermal Physics", "syllabus_unit": 4, "periods": 60}
SOURCES = [
    "resources/nie/physics/en/syllabus/AL-Physics-Syllabus-Gr12-13-en.pdf (Unit 4)",
    "resources/nie/physics/en/resource-books/Gr12-Physics-RB-Unit04-en.pdf",
]
CANDIDATE_SQL = "unit_no = 4"
CANDIDATE_RULE = "unit_no = 4. The 3 thermal radiation questions map to a Unit 11 stub, because the syllabus puts Stefan's and Wien's laws in 11.1"

# NIE competency levels (syllabus Unit 4) and their periods.
TOPICS = {
    "4.1": ("Temperature and thermometers", 6),
    "4.2": ("Thermal expansion of solids and liquids", 6),
    "4.3": ("Gas laws", 10),
    "4.4": ("Kinetic theory of gases", 4),
    "4.5": ("Heat capacity and heat exchange", 8),
    "4.6": ("Change of state", 8),
    "4.7": ("Vapour and humidity", 8),
    "4.8": ("Thermodynamics", 4),
    "4.9": ("Transfer of heat", 6),
}

# Shared maths layer (targets of uses-math edges). Same IDs as Mechanics.
MATH = {
    "math.algebra.rearrange": "Rearranging a formula for one variable",
    "math.algebra.proportion": "Ratio, proportion and scaling",
    "math.algebra.simultaneous": "Solving two simultaneous linear equations",
    "math.graph.gradient": "Gradient of a straight line or tangent",
    "math.graph.area": "Area under a graph from simple shapes",
    "math.geometry.mensuration": "Areas and volumes of circles, cylinders, spheres",
}

# Skills outside Unit 4 that Thermal skills link to, or that its questions test. Stubs only.
EXTERNAL = {
    "phy.mech.hydro.pressure-depth": ("Pressure at a depth in a fluid", "2.7"),
    "phy.mech.mom.linear-momentum": ("Linear momentum", "2.3"),
    "phy.mech.energy.ke-pe": ("Kinetic and potential energy", "2.5"),
    "phy.elec.pow.power-formulas": ("Electrical power: P = VI = I²R = V²/R", "8.2"),
    "phy.matrad.rad.blackbody": ("Black-body radiation: Stefan's and Wien's laws", "11.1"),
}

# id, name, competency level, sub-topic (NIE content heading), type, est_minutes, math deps
SKILLS = [
    # 4.1 Temperature
    ("phy.therm.temp.thermal-equilibrium", "Thermal equilibrium and the zeroth law", "4.1", "Temperature", C, 10, []),
    ("phy.therm.temp.thermometric-property", "Thermometric properties and fixed points", "4.1", "Temperature", R, 10, []),
    ("phy.therm.temp.kelvin-celsius", "Kelvin and Celsius scales, absolute zero", "4.1", "Absolute scale", R, 10, []),
    ("phy.therm.temp.scale-equation", "Temperature from a thermometric property", "4.1", "Temperature scales", P, 15, ["math.algebra.proportion"]),
    ("phy.therm.temp.liquid-thermometer", "Liquid-in-glass thermometers: design and sensitivity", "4.1", "Thermometers", C, 15, []),
    # 4.2 Thermal expansion
    ("phy.therm.exp.linear", "Linear expansion", "4.2", "Expansion of solids", P, 20, ["math.algebra.rearrange"]),
    ("phy.therm.exp.area-volume", "Area and volume expansion, and α : β : γ", "4.2", "Expansion of solids", P, 15, ["math.algebra.proportion"]),
    ("phy.therm.exp.real-apparent", "Real and apparent expansion of a liquid", "4.2", "Volume expansion of liquids", P, 20, ["math.algebra.rearrange"]),
    ("phy.therm.exp.density-temperature", "Density change with temperature", "4.2", "Variation of density with temperature", P, 15, ["math.algebra.proportion"]),
    ("phy.therm.exp.water-anomaly", "Anomalous expansion of water", "4.2", "Anomalous expansion of water", C, 10, []),
    # 4.3 Gas laws
    ("phy.therm.gas.boyle", "Boyle's law", "4.3", "Gas laws", P, 15, ["math.algebra.proportion"]),
    ("phy.therm.gas.charles-pressure", "Charles's law and the pressure law", "4.3", "Gas laws", P, 15, ["math.algebra.proportion"]),
    ("phy.therm.gas.ideal-gas-equation", "Ideal gas equation pV = nRT", "4.3", "Ideal gas equation", P, 20, ["math.algebra.rearrange"]),
    ("phy.therm.gas.graphs", "Gas law graphs", "4.3", "Gas laws", C, 20, ["math.graph.gradient"]),
    ("phy.therm.gas.trapped-column", "Gas trapped by a liquid column", "4.3", "Gas laws", P, 25, ["math.algebra.rearrange"]),
    ("phy.therm.gas.dalton", "Dalton's law of partial pressures", "4.3", "Ideal gas equation", P, 15, []),
    # 4.4 Kinetic theory
    ("phy.therm.kin.assumptions", "Kinetic theory: assumptions and the origin of pressure", "4.4", "Kinetic theory of gases", C, 10, []),
    ("phy.therm.kin.mean-ke-temperature", "Mean molecular KE and absolute temperature", "4.4", "Kinetic theory of gases", C, 10, ["math.algebra.proportion"]),
    ("phy.therm.kin.rms-speed", "pV = ⅓Nmc̄² and r.m.s. speed", "4.4", "Kinetic theory of gases", P, 20, ["math.algebra.rearrange"]),
    # 4.5 Heat exchange
    ("phy.therm.heat.specific-heat", "Heat capacity and specific heat capacity", "4.5", "Heat capacity", P, 15, ["math.algebra.rearrange"]),
    ("phy.therm.heat.mixtures", "Method of mixtures", "4.5", "Heat capacity", P, 20, ["math.algebra.rearrange"]),
    ("phy.therm.heat.continuous-flow", "Continuous-flow heating", "4.5", "Heat capacity", P, 15, ["math.algebra.rearrange"]),
    ("phy.therm.heat.molar-heat-capacity", "Molar heat capacities of a gas", "4.5", "Molar heat capacities of gases", C, 10, []),
    ("phy.therm.heat.newton-cooling", "Newton's law of cooling", "4.5", "Newton's law of cooling", P, 20, ["math.algebra.proportion"]),
    ("phy.therm.heat.cooling-method", "Specific heat capacity of a liquid by the method of cooling", "4.5", "Newton's law of cooling", P, 15, ["math.algebra.proportion"]),
    # 4.6 Change of state
    ("phy.therm.state.molecular-states", "Molecular picture of the states of matter", "4.6", "Change of state", C, 10, []),
    ("phy.therm.state.latent-heat", "Specific latent heat", "4.6", "Latent heat", P, 15, ["math.algebra.rearrange"]),
    ("phy.therm.state.mixtures-with-change", "Mixtures that melt or boil", "4.6", "Latent heat", P, 25, ["math.algebra.rearrange"]),
    ("phy.therm.state.heating-curve", "Temperature–time graphs through a change of state", "4.6", "Change of state", C, 15, ["math.graph.gradient"]),
    ("phy.therm.state.latent-errors", "Latent heat by mixtures: sources of error", "4.6", "Latent heat", C, 15, []),
    ("phy.therm.state.pressure-effect", "Effect of pressure on melting and boiling points", "4.6", "Change of state", C, 10, []),
    # 4.7 Vapour and humidity
    ("phy.therm.hum.vapour-pressure", "Saturated and unsaturated vapour pressure", "4.7", "Vapour pressure", C, 20, []),
    ("phy.therm.hum.dew-point", "Dew point", "4.7", "Humidity", C, 10, []),
    ("phy.therm.hum.relative-humidity", "Relative humidity from vapour pressures or dew point", "4.7", "Humidity", P, 20, ["math.algebra.proportion"]),
    ("phy.therm.hum.absolute-humidity", "Absolute humidity and the mass of water vapour", "4.7", "Humidity", P, 15, ["math.algebra.rearrange"]),
    ("phy.therm.hum.mixing-air", "Humidity when air is mixed, cooled or heated", "4.7", "Humidity", P, 25, ["math.algebra.proportion"]),
    ("phy.therm.hum.rh-temperature", "How relative humidity changes with temperature and volume", "4.7", "Humidity", C, 15, []),
    # 4.8 Thermodynamics
    ("phy.therm.thermo.internal-energy", "Heat, work and internal energy", "4.8", "First law of thermodynamics", C, 10, []),
    ("phy.therm.thermo.first-law", "First law of thermodynamics", "4.8", "First law of thermodynamics", P, 20, ["math.algebra.rearrange"]),
    ("phy.therm.thermo.processes", "Constant-pressure, constant-volume, isothermal and adiabatic processes", "4.8", "Thermodynamic processes", C, 20, []),
    ("phy.therm.thermo.pv-work", "Work done from a p–V graph", "4.8", "Thermodynamic processes", P, 15, ["math.graph.area"]),
    ("phy.therm.thermo.cycles", "Cyclic processes and paths on a p–V graph", "4.8", "Thermodynamic processes", P, 25, ["math.graph.area"]),
    # 4.9 Transfer of heat
    ("phy.therm.cond.mechanisms", "Conduction, convection and radiation", "4.9", "Transfer of heat", C, 10, []),
    ("phy.therm.cond.rate-equation", "Rate of conduction, and Searle's method", "4.9", "Conduction", P, 20, ["math.algebra.rearrange"]),
    ("phy.therm.cond.composite-rods", "Rods in series and parallel", "4.9", "Conduction", P, 25, ["math.algebra.proportion"]),
    ("phy.therm.cond.temperature-profile", "Temperature along lagged, unlagged and tapered rods", "4.9", "Conduction", C, 20, ["math.graph.gradient"]),
]

# Hard prerequisites only (DR-0022): the skill can't be done without these.
REQUIRES = {
    "phy.therm.temp.scale-equation": ["phy.therm.temp.thermometric-property"],
    "phy.therm.temp.liquid-thermometer": ["phy.therm.temp.thermometric-property"],
    "phy.therm.exp.area-volume": ["phy.therm.exp.linear"],
    "phy.therm.exp.real-apparent": ["phy.therm.exp.area-volume"],
    "phy.therm.exp.density-temperature": ["phy.therm.exp.area-volume"],
    "phy.therm.exp.water-anomaly": ["phy.therm.exp.density-temperature"],
    "phy.therm.gas.charles-pressure": ["phy.therm.temp.kelvin-celsius"],
    "phy.therm.gas.ideal-gas-equation": ["phy.therm.gas.boyle", "phy.therm.gas.charles-pressure"],
    "phy.therm.gas.graphs": ["phy.therm.gas.ideal-gas-equation"],
    "phy.therm.gas.trapped-column": ["phy.therm.gas.boyle", "phy.mech.hydro.pressure-depth"],
    "phy.therm.gas.dalton": ["phy.therm.gas.ideal-gas-equation"],
    "phy.therm.kin.mean-ke-temperature": ["phy.therm.kin.assumptions", "phy.therm.temp.kelvin-celsius"],
    "phy.therm.kin.rms-speed": ["phy.therm.kin.assumptions"],
    "phy.therm.heat.mixtures": ["phy.therm.heat.specific-heat"],
    "phy.therm.heat.continuous-flow": ["phy.therm.heat.specific-heat"],
    "phy.therm.heat.molar-heat-capacity": ["phy.therm.heat.specific-heat"],
    "phy.therm.heat.cooling-method": ["phy.therm.heat.newton-cooling", "phy.therm.heat.specific-heat"],
    "phy.therm.state.mixtures-with-change": ["phy.therm.state.latent-heat", "phy.therm.heat.mixtures"],
    "phy.therm.state.heating-curve": ["phy.therm.state.latent-heat"],
    "phy.therm.state.latent-errors": ["phy.therm.state.mixtures-with-change"],
    "phy.therm.hum.dew-point": ["phy.therm.hum.vapour-pressure"],
    "phy.therm.hum.relative-humidity": ["phy.therm.hum.dew-point"],
    "phy.therm.hum.mixing-air": ["phy.therm.hum.relative-humidity", "phy.therm.hum.absolute-humidity"],
    "phy.therm.hum.rh-temperature": ["phy.therm.hum.relative-humidity"],
    "phy.therm.thermo.first-law": ["phy.therm.thermo.internal-energy"],
    "phy.therm.thermo.processes": ["phy.therm.thermo.first-law"],
    "phy.therm.thermo.cycles": ["phy.therm.thermo.first-law", "phy.therm.thermo.pv-work"],
    "phy.therm.cond.composite-rods": ["phy.therm.cond.rate-equation"],
    "phy.therm.cond.temperature-profile": ["phy.therm.cond.rate-equation"],
}

HELPS = [
    ("phy.therm.temp.thermal-equilibrium", "phy.therm.temp.thermometric-property"),
    ("phy.therm.temp.thermal-equilibrium", "phy.therm.heat.mixtures"),         # the mixture ends at one common temperature
    ("phy.therm.temp.kelvin-celsius", "phy.therm.temp.scale-equation"),
    ("phy.therm.exp.real-apparent", "phy.therm.temp.liquid-thermometer"),
    ("phy.therm.gas.graphs", "phy.therm.thermo.pv-work"),
    ("phy.therm.gas.ideal-gas-equation", "phy.therm.thermo.cycles"),          # temperatures at the corners of a cycle
    ("phy.therm.gas.ideal-gas-equation", "phy.therm.kin.rms-speed"),
    ("phy.therm.gas.dalton", "phy.therm.hum.vapour-pressure"),
    ("phy.therm.kin.mean-ke-temperature", "phy.therm.thermo.internal-energy"),
    ("phy.mech.energy.ke-pe", "phy.therm.kin.mean-ke-temperature"),
    ("phy.mech.mom.linear-momentum", "phy.therm.kin.assumptions"),
    ("phy.therm.heat.specific-heat", "phy.therm.heat.newton-cooling"),
    ("phy.therm.heat.molar-heat-capacity", "phy.therm.thermo.processes"),      # Cp > Cv because work is done at constant p
    ("phy.therm.thermo.internal-energy", "phy.therm.heat.molar-heat-capacity"),
    ("phy.therm.state.molecular-states", "phy.therm.state.latent-heat"),
    ("phy.therm.state.molecular-states", "phy.therm.hum.vapour-pressure"),
    ("phy.therm.hum.vapour-pressure", "phy.therm.state.pressure-effect"),      # boiling starts when SVP equals the outside pressure
    ("phy.therm.hum.vapour-pressure", "phy.therm.hum.absolute-humidity"),
    ("phy.therm.cond.mechanisms", "phy.therm.cond.rate-equation"),
    ("phy.therm.cond.mechanisms", "phy.matrad.rad.blackbody"),
    ("phy.elec.pow.power-formulas", "phy.therm.heat.continuous-flow"),
    ("phy.elec.pow.power-formulas", "phy.therm.thermo.first-law"),            # heat from a coil, Q = I²Rt
]

# (from, to, credit weight for implicit review, 0.3–0.7 per DR-0022)
ENCOMPASSES = [
    ("phy.therm.temp.scale-equation", "phy.therm.temp.kelvin-celsius", 0.3),
    ("phy.therm.exp.area-volume", "phy.therm.exp.linear", 0.4),
    ("phy.therm.exp.real-apparent", "phy.therm.exp.area-volume", 0.4),
    ("phy.therm.exp.density-temperature", "phy.therm.exp.area-volume", 0.4),
    ("phy.therm.gas.ideal-gas-equation", "phy.therm.gas.boyle", 0.4),
    ("phy.therm.gas.ideal-gas-equation", "phy.therm.gas.charles-pressure", 0.4),
    ("phy.therm.gas.trapped-column", "phy.therm.gas.boyle", 0.6),
    ("phy.therm.gas.dalton", "phy.therm.gas.ideal-gas-equation", 0.4),
    ("phy.therm.gas.graphs", "phy.therm.gas.ideal-gas-equation", 0.3),
    ("phy.therm.kin.rms-speed", "phy.therm.kin.assumptions", 0.4),
    ("phy.therm.heat.mixtures", "phy.therm.heat.specific-heat", 0.6),
    ("phy.therm.heat.continuous-flow", "phy.therm.heat.specific-heat", 0.5),
    ("phy.therm.heat.cooling-method", "phy.therm.heat.newton-cooling", 0.5),
    ("phy.therm.state.mixtures-with-change", "phy.therm.heat.mixtures", 0.6),
    ("phy.therm.state.mixtures-with-change", "phy.therm.state.latent-heat", 0.5),
    ("phy.therm.state.latent-errors", "phy.therm.state.mixtures-with-change", 0.3),
    ("phy.therm.hum.relative-humidity", "phy.therm.hum.vapour-pressure", 0.5),
    ("phy.therm.hum.mixing-air", "phy.therm.hum.relative-humidity", 0.6),
    ("phy.therm.hum.mixing-air", "phy.therm.hum.absolute-humidity", 0.5),
    ("phy.therm.hum.rh-temperature", "phy.therm.hum.relative-humidity", 0.4),
    ("phy.therm.thermo.processes", "phy.therm.thermo.first-law", 0.5),
    ("phy.therm.thermo.cycles", "phy.therm.thermo.first-law", 0.6),
    ("phy.therm.thermo.cycles", "phy.therm.thermo.pv-work", 0.6),
    ("phy.therm.cond.composite-rods", "phy.therm.cond.rate-equation", 0.6),
    ("phy.therm.cond.temperature-profile", "phy.therm.cond.rate-equation", 0.4),
]

# (a, b, why): only pairs where students pick the wrong idea or method (DR-0022)
CONFUSABLE = [
    ("phy.therm.heat.specific-heat", "phy.therm.state.latent-heat", "uses mcΔθ while the substance is melting or boiling"),
    ("phy.therm.hum.relative-humidity", "phy.therm.hum.absolute-humidity", "a higher relative humidity is not always more water vapour"),
    ("phy.therm.hum.vapour-pressure", "phy.therm.gas.boyle", "applies Boyle's law to a saturated vapour"),
    ("phy.therm.thermo.pv-work", "phy.therm.thermo.first-law", "work done by the gas against work done on it"),
]

# Past-paper mapping: uid -> (primary skill, [secondary skills], note)
QMAP = {
    # Calorimetry & latent heat
    "2016-21": ("phy.therm.state.latent-heat", [], ""),
    "2017-36": ("phy.therm.state.latent-errors", ["phy.therm.state.mixtures-with-change"], ""),
    "2018-20": ("phy.therm.heat.continuous-flow", ["phy.therm.state.latent-heat"], "water is heated, then boiled"),
    "2019-42": ("phy.therm.heat.mixtures", [], "identify the metal from its specific heat capacity"),
    "2020-35": ("phy.therm.state.mixtures-with-change", [], ""),
    "2021-42": ("phy.therm.state.mixtures-with-change", [], "water poured into a hot vessel partly boils off"),
    "2024-33": ("phy.therm.state.mixtures-with-change", [], ""),
    "2025-20": ("phy.therm.heat.continuous-flow", [], ""),
    # First law of thermodynamics
    "2016-22": ("phy.therm.thermo.cycles", ["phy.therm.thermo.first-law"], "two paths between the same states"),
    "2017-32": ("phy.therm.thermo.cycles", ["phy.therm.thermo.pv-work"], ""),
    "2018-6": ("phy.therm.thermo.processes", [], ""),
    "2019-30": ("phy.therm.thermo.cycles", ["phy.therm.thermo.first-law"], "two paths between the same states"),
    "2020-24": ("phy.therm.thermo.cycles", ["phy.therm.thermo.first-law"], "all five options were accepted (see content/source-issues.md)"),
    "2021-30": ("phy.therm.thermo.first-law", ["phy.therm.thermo.pv-work", "phy.elec.pow.power-formulas"], "heat from a coil at constant pressure"),
    "2023-10": ("phy.therm.thermo.processes", [], ""),
    "2025-44": ("phy.therm.thermo.pv-work", ["phy.therm.thermo.cycles"], ""),
    # Gas laws
    "2016-42": ("phy.therm.gas.ideal-gas-equation", ["phy.therm.gas.graphs"], "gas removed, then reheated"),
    "2017-42": ("phy.therm.gas.dalton", ["phy.therm.gas.graphs"], ""),
    "2021-19": ("phy.therm.gas.graphs", ["phy.therm.gas.boyle"], ""),
    "2022-37": ("phy.therm.gas.trapped-column", ["phy.therm.gas.ideal-gas-equation"], "sealed tube, one side heated"),
    "2022-42": ("phy.therm.gas.graphs", ["phy.therm.kin.mean-ke-temperature"], ""),
    "2023-9": ("phy.therm.gas.graphs", ["phy.therm.gas.ideal-gas-equation"], "gas density against T"),
    "2024-46": ("phy.therm.gas.ideal-gas-equation", ["phy.therm.gas.graphs"], "temperature at a corner of a cycle"),
    # Kinetic theory
    "2016-20": ("phy.therm.heat.specific-heat", ["phy.therm.cond.mechanisms"], "DB files this as kinetic theory; it asks why a room re-warms (heat capacity of air vs walls)"),
    "2019-15": ("phy.therm.kin.rms-speed", [], ""),
    "2021-5": ("phy.therm.kin.mean-ke-temperature", [], ""),
    "2022-15": ("phy.therm.kin.mean-ke-temperature", ["phy.therm.temp.kelvin-celsius"], ""),
    # Newton's law of cooling
    "2020-34": ("phy.therm.heat.newton-cooling", [], ""),
    "2024-31": ("phy.therm.heat.newton-cooling", ["phy.therm.heat.specific-heat"], "cooling rate against size"),
    # Humidity
    "2016-44": ("phy.therm.hum.mixing-air", ["phy.therm.hum.absolute-humidity"], ""),
    "2017-37": ("phy.therm.hum.vapour-pressure", ["phy.therm.hum.dew-point"], "does sweat evaporate in a saturated room?"),
    "2018-39": ("phy.therm.hum.relative-humidity", ["phy.therm.hum.absolute-humidity"], "RH ∝ vapour mass at constant T"),
    "2019-13": ("phy.therm.hum.dew-point", ["phy.therm.hum.vapour-pressure"], ""),
    "2020-13": ("phy.therm.hum.mixing-air", [], ""),
    "2022-47": ("phy.therm.hum.mixing-air", ["phy.therm.hum.dew-point"], "air cooled, dried, then reheated"),
    "2024-28": ("phy.therm.hum.absolute-humidity", ["phy.therm.hum.relative-humidity"], ""),
    "2025-23": ("phy.therm.hum.rh-temperature", ["phy.therm.hum.dew-point"], ""),
    # Conduction
    "2017-35": ("phy.therm.cond.composite-rods", [], ""),
    "2018-40": ("phy.therm.cond.composite-rods", [], ""),
    "2020-27": ("phy.therm.cond.temperature-profile", [], ""),
    "2021-36": ("phy.therm.cond.composite-rods", [], ""),
    "2022-40": ("phy.therm.cond.temperature-profile", ["phy.therm.cond.composite-rods"], ""),
    "2023-36": ("phy.therm.cond.temperature-profile", ["phy.therm.cond.composite-rods"], ""),
    "2024-47": ("phy.therm.cond.temperature-profile", [], "half lagged, half unlagged"),
    "2025-34": ("phy.therm.cond.temperature-profile", [], ""),
    # Expansion and thermometers
    "2016-3": ("phy.therm.temp.liquid-thermometer", ["phy.therm.temp.thermometric-property"], ""),
    "2016-19": ("phy.therm.exp.linear", [], ""),
    "2018-7": ("phy.therm.exp.linear", [], ""),
    "2018-19": ("phy.therm.temp.liquid-thermometer", ["phy.therm.exp.real-apparent"], ""),
    "2018-41": ("phy.therm.exp.water-anomaly", [], "DB files this as thermal expansion"),
    "2020-46": ("phy.therm.exp.real-apparent", ["phy.mech.hydro.pressure-depth"], "balancing columns at two temperatures"),
    "2023-27": ("phy.therm.exp.linear", [], "tape read at another temperature"),
    "2024-17": ("phy.therm.exp.linear", [], ""),
    "2025-42": ("phy.therm.exp.linear", [], "ball and hole expand at different rates"),
    "2019-6": ("phy.therm.temp.liquid-thermometer", ["phy.therm.temp.thermometric-property"], ""),
    # Thermal radiation: Unit 11 in the syllabus
    "2017-17": ("phy.matrad.rad.blackbody", [], "Unit 11 (11.1); DB files it under Unit 4"),
    "2022-8": ("phy.matrad.rad.blackbody", [], "Unit 11 (11.1); DB files it under Unit 4"),
    "2023-6": ("phy.matrad.rad.blackbody", [], "Unit 11 (11.1); DB files it under Unit 4"),
}

# Skills the syllabus pairs with a set practical or activity. Draft list.
PRACTICAL = {
    "phy.therm.gas.trapped-column",      # atmospheric pressure with a quill tube
    "phy.therm.heat.mixtures",           # specific heat capacity of a solid by mixtures
    "phy.therm.heat.cooling-method",     # specific heat capacity of a liquid by cooling
    "phy.therm.state.latent-errors",     # latent heat of fusion of ice, and of vaporisation of water
    "phy.therm.hum.relative-humidity",   # relative humidity with a polished calorimeter
    "phy.therm.cond.rate-equation",      # Searle's method
}


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=graphkit.DEFAULT_DB)
    graphkit.build(sys.modules[__name__], ap.parse_args().db)
