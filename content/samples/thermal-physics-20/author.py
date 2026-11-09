#!/usr/bin/env python3
"""Writes items.json: the Thermal Physics sample in the format of content authoring spec v0.5.

This is only a compact way to type the items. validate.py reads items.json and nothing from here.
Set ENGLISH_ONLY=1 to write items.json before every string has Sinhala, to check the English first.
Skill IDs come from content/skills/thermal-physics/graph.json.
"""
import json
import os
import re
from pathlib import Path

HERE = Path(__file__).parent
SPEC_VERSION = "0.5"
FIGURES = HERE / "figures"
UNIT = "phy.therm"

SKILLS = {
    "lin": ("phy.therm.exp.linear", "Linear expansion", "procedural"),
    "mix": ("phy.therm.heat.mixtures", "Method of mixtures", "procedural"),
    "flow": ("phy.therm.heat.continuous-flow", "Continuous-flow heating", "procedural"),
    "mixc": ("phy.therm.state.mixtures-with-change", "Mixtures that melt or boil", "procedural"),
    "lat": ("phy.therm.state.latent-errors", "Latent heat by mixtures: sources of error", "conceptual"),
    "ggr": ("phy.therm.gas.graphs", "Gas law graphs", "conceptual"),
    "igl": ("phy.therm.gas.ideal-gas-equation", "Ideal gas equation", "procedural"),
    "ke": ("phy.therm.kin.mean-ke-temperature", "Mean molecular KE and absolute temperature", "conceptual"),
    "rms": ("phy.therm.kin.rms-speed", "r.m.s. speed and gas pressure", "procedural"),
    "cool": ("phy.therm.heat.newton-cooling", "Newton's law of cooling", "procedural"),
    "abs": ("phy.therm.hum.absolute-humidity", "Absolute humidity and the mass of water vapour", "procedural"),
    "rh": ("phy.therm.hum.relative-humidity", "Relative humidity", "procedural"),
    "mixa": ("phy.therm.hum.mixing-air", "Humidity when air is mixed", "procedural"),
    "rht": ("phy.therm.hum.rh-temperature", "How relative humidity changes with temperature", "conceptual"),
    "dew": ("phy.therm.hum.dew-point", "Dew point", "conceptual"),
    "fl": ("phy.therm.thermo.first-law", "First law of thermodynamics", "procedural"),
    "proc": ("phy.therm.thermo.processes", "Thermodynamic processes", "conceptual"),
    "rods": ("phy.therm.cond.composite-rods", "Rods in series", "procedural"),
    "prof": ("phy.therm.cond.temperature-profile", "Temperature along lagged and unlagged rods", "conceptual"),
}

SOURCE_DIFFICULTY = {
    "2023-27": 3, "2025-42": 3, "2024-33": 4, "2020-35": 4, "2019-42": 3, "2025-20": 2, "2017-36": 3, "2023-9": 2,
    "2016-42": 4, "2021-5": 1, "2019-15": 2, "2020-34": 3, "2024-28": 2, "2020-13": 4, "2025-23": 3, "2019-13": 3,
    "2021-30": 4, "2023-10": 3, "2018-40": 4, "2024-47": 3,
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




# ---------- L1 and L2 cards ----------
WATER = "(c of water = 4200 J kg⁻¹ K⁻¹)"

recall("2023-27", "lin", "F02", "ΔL = L₀ α ▢", "Δθ", ["θ", "ΔL", "t"], "Change in length = original length × expansivity × change in temperature.")
recall("2023-27", "lin", "F04", "SI unit of linear expansivity?", "K⁻¹", ["K", "m K⁻¹", "m⁻¹"], "α = ΔL ÷ (L₀ Δθ): a length ÷ a length ÷ a temperature.")
card("2023-27", "lin", "L2", "F13", "A steel tape, correct at 20 °C, is used outdoors at 40 °C. Compared with the true length, its reading is?", "Too small",
     [("Too large", "expansion-reading"), ("Correct, as the object expands too", "ignored-condition", "The tape's marks spread apart whatever the object does."),
      ("Too small only for long objects", "wrong-law", "Every reading is short by the same fraction, αΔθ.")],
     "The hot tape's marks spread apart, so fewer of them fit along the object.")
card("2023-27", "lin", "L2", "F12", "A metal rod's rise in temperature × 2. Increase in its length × ?", "2",
     [("4", "wrong-power"), ("1", "ignored-condition", "ΔL is proportional to Δθ."), ("½", "inverted")], "ΔL = L₀αΔθ, so ΔL ∝ Δθ.")
card("2025-42", "lin", "L2", "F14", "A brass plate has a hole slightly too small for an iron ball. Student says: \"Heating the plate shrinks the hole, as the brass expands into it.\" What's wrong?",
     "The hole grows as if it were made of brass",
     [("Nothing: the brass fills the hole", "hole-shrinks"), ("The hole stays the same size", "ignored-condition", "Every length in the plate grows, including the hole's diameter."),
      ("The hole grows only if the plate is thin", "wrong-law", "Thickness doesn't matter: all lengths grow by the same fraction.")],
     "The whole plate scales up, so the hole scales up with it.")

recall("2019-42", "mix", "F02", "Heat to warm a body: Q = m c ▢", "Δθ", ["θ", "t", "L"], "Q = mcΔθ, using the change in temperature.")
card("2019-42", "mix", "L2", "F13", "100 g of water at 80 °C is mixed with 300 g of water at 20 °C, with no heat loss. Final temperature?", "35 °C",
     [("50 °C", "assumed-symmetry"), ("65 °C", "inverted"), ("60 °C", "wrong-quantity", "That's the difference of the two temperatures.")],
     "Heat lost = heat gained: 100 × (80 − θ) = 300 × (θ − 20), so θ = 35 °C.")
card("2019-42", "mix", "L2", "F14", "Student says: \"In a method-of-mixtures experiment, the hot metal's fall in temperature equals the water's rise.\" What's wrong?",
     "Heat lost equals heat gained, not Δθ",
     [("Nothing: energy is conserved", "assumed-symmetry"), ("The changes are equal only for metals", "wrong-law", "Temperature changes depend on m and c, for any substance."),
      ("Heat flows until both hold the same heat", "ignored-condition", "Heat flows until the temperatures are equal, not the heat.")],
     "m₁c₁Δθ₁ = m₂c₂Δθ₂, so the temperature changes differ unless mc is equal.")

card("2025-20", "flow", "L2", "F12", "Water flows through a heater of fixed power. Flow rate × 2. Rise in temperature × ?", "½",
     [("2", "inverted"), ("1", "ignored-condition", "Twice the water shares the same heat each second."), ("¼", "wrong-power")],
     "P = (m/t) c Δθ, so with P fixed, Δθ ∝ 1 ÷ flow rate.")
card("2025-20", "flow", "L2", "F13", f"Water flows through a 2.1 kW heater at 0.5 kg per minute. Rise in temperature? {WATER}", "60 K",
     [("1 K", "unit-conversion"), ("15 K", "wrong-law", "Divide by the mass per second, don't multiply."), ("30 K", "forgot-mass")],
     "0.5 kg per minute is 1/120 kg s⁻¹. Δθ = 2100 ÷ (1/120 × 4200) = 60 K.")

card("2024-33", "mixc", "L2", "F13", "Water at 30 °C meets ice at −10 °C in an insulated flask. The water gives 12.6 kJ cooling to 0 °C, but the ice needs 35.7 kJ to warm and fully melt. Final state?",
     "0 °C, with some ice left",
     [("10 °C, the average", "assumed-symmetry"), ("Above 0 °C, with all the ice melted", "ice-all-melts"),
      ("Below 0 °C, with all the water frozen", "ignored-condition", "The water has more heat to give than the ice needs to reach 0 °C.")],
     "12.6 kJ is less than 35.7 kJ, so only part of the ice melts and the mix stays at 0 °C.")
card("2020-35", "mixc", "L2", "F14", "Student says: \"Ice at 0 °C and water at 0 °C cool a drink equally well.\" What's wrong?", "Melting ice also takes in latent heat",
     [("Nothing: same temperature, same cooling", "forgot-latent"), ("Water cools better, as its c is larger", "inverted"),
      ("Ice is better only if it is crushed", "ignored-condition", "Crushing changes how fast it cools, not the total heat taken in.")],
     "Each kilogram of ice takes in about 3.4 × 10⁵ J just to melt, before it warms.")
true_false("2020-35", "mixc", "While ice melts at 0 °C, it takes in heat but its temperature stays at 0 °C.", True, "heat-during-change",
           "The heat goes into breaking bonds, not into raising the temperature.")

recall("2017-36", "lat", "F01", "To find the latent heat of fusion of ice by mixtures, the ice should be?", "Dry and at 0 °C",
       ["Wet and at 0 °C", "Dry and well below 0 °C", "Crushed and wet"], "Water on the ice, or ice below 0 °C, adds heat terms the calculation leaves out.")

recall("2023-9", "ggr", "F03", "A fixed mass of gas at constant temperature. The graph of p against 1/V is?", "A straight line through the origin",
       ["A curve", "A horizontal line", "A straight line with a negative gradient"], "pV = constant, so p ∝ 1/V.")
card("2023-9", "ggr", "L2", "F15", "A fixed mass of ideal gas at constant pressure. Pick the graph of its density ρ against absolute temperature T.", "Falling curve, ρ ∝ 1/T",
     [("Falling straight line", "wrong-power"), ("Rising straight line through the origin", "inverted"),
      ("Horizontal line", "ignored-condition", "The volume grows with T, so the density falls.")],
     "V ∝ T at constant p, and ρ = m/V, so ρ ∝ 1/T.",
     figures=[plot(lambda x: min(1, 0.13 / (x + 0.11)), "T", "ρ"), plot(lambda x: 0.95 - 0.8 * x, "T", "ρ"),
              plot(lambda x: 0.95 * x, "T", "ρ"), plot(lambda x: 0.55, "T", "ρ")])
card("2023-9", "ggr", "L2", "F11", "A fixed mass of ideal gas is kept at constant temperature. As its pressure rises, the product pV?", "Stays the same",
     [("Increases", "wrong-law", "Boyle's law: pV is constant at a fixed temperature."), ("Decreases", "inverted"), ("Rises, then falls", "graph-shape")],
     "At constant temperature, pV = nRT is constant.")

recall("2016-42", "igl", "F01", "In pV = nRT, the temperature T must be in?", "kelvin", ["°C", "°F", "Either °C or kelvin"],
       "Gas laws use the absolute temperature.", tag="celsius-in-gas-law")
card("2016-42", "igl", "L2", "F13", "A sealed gas at 27 °C is heated to 127 °C at constant volume. Pressure × ?", "4/3",
     [("127/27", "celsius-in-gas-law"), ("1", "ignored-condition", "At constant volume, p rises with T."), ("3/4", "inverted")],
     "p ∝ T in kelvin: 400 K ÷ 300 K.")
card("2016-42", "igl", "L2", "F14", "Student says: \"Doubling a gas's Celsius temperature doubles its pressure at constant volume.\" What's wrong?", "p ∝ T only in kelvin",
     [("Nothing: p ∝ θ", "celsius-in-gas-law"), ("The pressure halves instead", "inverted"),
      ("Pressure doesn't depend on temperature", "wrong-law", "At constant volume, p ∝ T in kelvin.")],
     "20 °C to 40 °C is 293 K to 313 K, a rise of only about 7%.")

recall("2021-5", "ke", "F01", "The mean KE of an ideal gas molecule depends on?", "The absolute temperature only",
       ["The pressure", "The volume", "The molar mass of the gas"], "Mean KE = (3/2)kT.", tag="ke-depends-on-gas")
card("2021-5", "ke", "L2", "F12", "Absolute temperature × 2. Mean molecular KE × ?", "2",
     [("4", "wrong-power"), ("√2", "wrong-quantity", "√2 is for the r.m.s. speed, not the KE."), ("1", "ignored-condition", "Mean KE ∝ T in kelvin.")],
     "Mean KE = (3/2)kT, so it is proportional to T.")
card("2021-5", "ke", "L2", "F19", "Helium (M = 4) and oxygen (M = 32) are at the same temperature. Mean molecular KE, helium : oxygen?", "1 : 1",
     [("8 : 1", "ke-depends-on-gas"), ("1 : 8", "inverted"), ("√8 : 1", "wrong-quantity", "Lighter molecules move faster, but the mean KE is the same.")],
     "Mean KE depends only on T, whatever the gas.")

recall("2019-15", "rms", "F01", "Kinetic theory: p = ?", "⅓ρc̄²", ["½ρc̄²", "ρc̄²", "⅓ρc̄"], "p = ⅓ρc̄², where c̄² is the mean square speed.")
card("2019-15", "rms", "L2", "F12", "The same gas, absolute temperature × 4. r.m.s. speed × ?", "2",
     [("4", "forgot-square"), ("16", "wrong-power"), ("½", "inverted")], "c_rms ∝ √T.")
card("2019-15", "rms", "L2", "F13", "A gas at 1.2 × 10⁵ Pa has an r.m.s. molecular speed of 600 m s⁻¹. Its density?", "1.0 kg m⁻³",
     [("0.33 kg m⁻³", "ignored-condition", "Include the 3: ρ = 3p ÷ c̄²."), ("0.67 kg m⁻³", "wrong-law", "The factor is ⅓, not ½."), ("600 kg m⁻³", "forgot-square")],
     "ρ = 3p ÷ c̄² = 3.6 × 10⁵ ÷ 3.6 × 10⁵.")

recall("2020-34", "cool", "F01", "Newton's law of cooling: rate of heat loss ∝ ?", "Excess temperature over the surroundings",
       ["The body's temperature", "The surroundings' temperature", "The square of the excess temperature"], "Rate of loss ∝ (θ − θ_room).")
card("2020-34", "cool", "L2", "F13", "A body in a room at 20 °C cools from 70 °C to 60 °C in 4 min. Using average temperatures, time to cool from 40 °C to 30 °C?", "12 min",
     [("4 min", "cooling-constant-rate"), ("7.4 min", "room-temp-excess"), ("1.3 min", "inverted")],
     "Average excess falls from 45 K to 15 K, so the rate falls to a third and the time triples.")
card("2020-34", "cool", "L2", "F14", "Student says: \"Tea cools from 80 °C to 70 °C in 2 min, so it cools from 50 °C to 40 °C in 2 min too.\" What's wrong?",
     "It cools more slowly nearer room temperature",
     [("Nothing: cooling is steady", "cooling-constant-rate"), ("It cools faster at lower temperatures", "inverted"),
      ("It takes 2 min only if the cup is covered", "ignored-condition", "Covering changes the rate, but the rate still falls as the tea cools.")],
     "The rate of cooling is proportional to the excess over room temperature.")

recall("2024-28", "abs", "F01", "Absolute humidity is?", "Mass of water vapour per unit volume of air",
       ["Vapour pressure ÷ saturated vapour pressure", "Mass of water vapour per unit mass of air", "Volume of water vapour per unit volume of air"],
       "It is measured in kg m⁻³ or g m⁻³.")

card("2019-13", "rh", "L2", "F13", "Air at 30 °C has a dew point of 20 °C. The SVP of water is 4.2 kPa at 30 °C and 2.3 kPa at 20 °C. Relative humidity?", "55%",
     [("182%", "inverted"), ("67%", "wrong-law", "RH uses vapour pressures, not temperatures."), ("45%", "wrong-quantity", "That's 100% minus the RH.")],
     "The vapour pressure equals the SVP at the dew point, so RH = 2.3 ÷ 4.2.")

recall("2019-13", "dew", "F01", "The dew point is the temperature at which?", "The air's own vapour just saturates it",
       ["Water starts to boil", "Water starts to freeze", "All the vapour in the air condenses"], "Cooled to the dew point, the air becomes saturated with the vapour it already holds.")
true_false("2019-13", "dew", "Reducing the volume of saturated air at constant temperature raises its vapour pressure.", False, "svp-boyle",
           "Extra vapour condenses, so the saturated vapour pressure stays the same.")

card("2020-13", "mixa", "L2", "F13", "Room A (volume 2V) at RH 50% and room B (volume V) at RH 80% are at the same temperature. The door between them stays open. Final RH?", "60%",
     [("65%", "assumed-symmetry"), ("130%", "sign"), ("70%", "inverted")],
     "The vapour spreads through 3V: (2 × 50 + 1 × 80) ÷ 3 = 60%.")

recall("2021-30", "fl", "F01", "First law of thermodynamics, with ΔW the work done by the gas: ΔQ = ?", "ΔU + ΔW", ["ΔU − ΔW", "ΔW − ΔU", "ΔU × ΔW"],
       "Heat in = rise in internal energy + work done by the gas.")
card("2021-30", "fl", "L2", "F13", "A gas takes in 500 J of heat and does 200 J of work on its surroundings. Change in its internal energy?", "+300 J",
     [("+700 J", "sign"), ("+500 J", "ignored-condition", "Some of the heat leaves as work."), ("−300 J", "inverted")],
     "ΔU = ΔQ − ΔW = 500 − 200.")

card("2023-10", "proc", "L2", "F11", "In which process does all the heat given to an ideal gas become work done by the gas?", "Isothermal",
     [("Constant volume", "wrong-law", "At constant volume no work is done."), ("Constant pressure", "ignored-condition", "At constant pressure, part of the heat raises U."),
      ("Adiabatic", "adiabatic-constant-t")],
     "Isothermal means ΔU = 0, so ΔQ = ΔW.")
card("2023-10", "proc", "L2", "F11", "In which process is the rise in internal energy equal to the heat supplied?", "Constant volume",
     [("Constant pressure", "ignored-condition", "At constant pressure the gas also does work."), ("Isothermal", "isothermal-no-heat"), ("Adiabatic", "adiabatic-constant-t")],
     "At constant volume ΔW = 0, so ΔQ = ΔU.")
true_false("2023-10", "proc", "In an adiabatic expansion, an ideal gas's temperature stays the same.", False, "adiabatic-constant-t",
           "No heat flows in, so the work done comes from U and the gas cools.")
true_false("2023-10", "proc", "In an isothermal expansion of an ideal gas, heat flows into the gas.", True, "isothermal-no-heat",
           "ΔU = 0, so the heat taken in equals the work done by the gas.")

card("2018-40", "rods", "L2", "F19", "Two rods of the same size, with conductivities k and 3k, are joined end to end between two reservoirs. Temperature drop across the k rod ÷ total drop?", "¾",
     [("¼", "inverted"), ("½", "assumed-symmetry"), ("1", "ignored-condition", "The other rod has a temperature drop across it too.")],
     "The same heat flows through both, so the drop is larger where k is smaller: 3 : 1.")

LAG_STRAIGHT, LAG_UP, LAG_DOWN = (lambda x: 0.9 - 0.8 * x), (lambda x: 0.1 + 0.8 * (1 - x) ** 2.2), (lambda x: 0.9 - 0.8 * x ** 2.2)
card("2024-47", "prof", "L2", "F15", "A uniform copper bar is fully lagged, and its ends are held at θ₁ and θ₂ (θ₁ > θ₂). Pick the graph of temperature θ along the bar, in steady state.",
     "Straight line falling from θ₁ to θ₂",
     [("Curve falling steeply, then gently", "ignored-condition", "No heat escapes a lagged bar, so the gradient is the same all along."),
      ("Straight line rising along the bar", "inverted"), ("Horizontal line", "wrong-quantity", "Steady state means steady temperatures, not equal ones.")],
     "The same heat flows through every section, so the temperature gradient is constant.",
     figures=[plot(LAG_STRAIGHT, "x", "θ"), plot(LAG_UP, "x", "θ"), plot(lambda x: 0.1 + 0.8 * x, "x", "θ"), plot(lambda x: 0.5, "x", "θ")])
card("2024-47", "prof", "L2", "F15", "The same copper bar, now unlagged, with its ends held at θ₁ and θ₂ (θ₁ > θ₂). Pick the graph of θ along the bar, in steady state.",
     "Curve falling steeply, then gently",
     [("Straight line falling from θ₁ to θ₂", "lagged-linear"), ("Curve falling gently, then steeply", "inverted"),
      ("Horizontal line", "wrong-quantity", "Steady state means steady temperatures, not equal ones.")],
     "Heat leaks out of the sides, so less flows further along and the gradient gets smaller.",
     figures=[plot(LAG_UP, "x", "θ"), plot(LAG_STRAIGHT, "x", "θ"), plot(LAG_DOWN, "x", "θ"), plot(lambda x: 0.5, "x", "θ")])
true_false("2024-47", "prof", "In an unlagged bar in steady state, the same heat flows through every cross-section.", False, "lagged-linear",
           "Heat escapes from the sides, so less heat reaches the far end.")

# ---------- L3 scenario pools ----------
def zero_scenario(prompt, right, tags, why):
    opts = ["ΔU", "ΔW", "ΔQ", "None of them"]
    return f"{prompt} Which is zero?", right, [(o, *tags[o]) for o in opts if o != right], why


pool("p01", "2023-10", "proc", "F31", [
    zero_scenario("An ideal gas expands slowly at constant temperature.", "ΔU",
                  {"ΔW": ("wrong-law", "The gas expands, so it does work."), "ΔQ": ("isothermal-no-heat",), "None of them": ("ignored-condition", "At constant T, the U of an ideal gas doesn't change.")},
                  "U of an ideal gas depends only on T, which doesn't change."),
    zero_scenario("A gas in a sealed, rigid tank is heated.", "ΔW",
                  {"ΔU": ("ignored-condition", "Heating at constant volume raises U."), "ΔQ": ("wrong-quantity", "Heat is supplied, so ΔQ isn't zero."), "None of them": ("wrong-law", "The volume can't change, so no work is done.")},
                  "The volume can't change, so no work is done."),
    zero_scenario("A gas is compressed quickly in an insulated cylinder.", "ΔQ",
                  {"ΔU": ("adiabatic-constant-t",), "ΔW": ("wrong-law", "The gas is compressed, so work is done on it."), "None of them": ("ignored-condition", "Insulated means no heat flows.")},
                  "Insulated and quick means adiabatic: no heat flows."),
    zero_scenario("A gas is squeezed slowly in a cylinder that sits in a large water bath.", "ΔU",
                  {"ΔW": ("wrong-law", "The gas is compressed, so work is done on it."), "ΔQ": ("isothermal-no-heat",), "None of them": ("ignored-condition", "The water bath keeps T, and so U, the same.")},
                  "The water bath keeps the temperature constant, so U doesn't change."),
    zero_scenario("A gas in a sealed steel cylinder cools overnight.", "ΔW",
                  {"ΔU": ("ignored-condition", "The gas cools, so its U falls."), "ΔQ": ("wrong-quantity", "Heat flows out as it cools."), "None of them": ("wrong-law", "A steel cylinder can't change volume, so no work is done.")},
                  "The volume is fixed, so ΔW = 0."),
    zero_scenario("A gas expands quickly through a valve into an insulated cylinder, pushing a piston.", "ΔQ",
                  {"ΔU": ("adiabatic-constant-t",), "ΔW": ("wrong-law", "The gas pushes a piston, so it does work."), "None of them": ("ignored-condition", "Insulated means no heat flows.")},
                  "No heat can flow, so the process is adiabatic."),
])

BOYLE, CHARLES, PRESSURE, DALTON = "Boyle's law", "Charles's law", "The pressure law", "Dalton's law"


def gas_law(prompt, right, why):
    tags = {
        BOYLE: ("ignored-condition", "The temperature changes here, so pV isn't constant."),
        CHARLES: ("wrong-quantity", "Charles's law needs constant pressure, and it isn't constant here."),
        PRESSURE: ("ignored-condition", "The volume changes here, so the pressure law doesn't apply.") if right == BOYLE else ("wrong-quantity", "The pressure law needs constant volume, and the volume changes here."),
        DALTON: ("wrong-law", "Dalton's law is for a mixture of gases. There's only one here."),
    }
    if right == CHARLES:
        tags[PRESSURE] = ("wrong-quantity", "The pressure is fixed here. It's the volume that changes.")
    return f"{prompt} Most direct law?", right, [(o, *tags[o]) for o in (BOYLE, CHARLES, PRESSURE, DALTON) if o != right], why


pool("p02", "2016-42", "igl", "F30", [
    gas_law("A balloon is squeezed slowly at room temperature. You need its new pressure.", BOYLE, "The temperature and the amount of gas stay fixed."),
    gas_law("A sealed syringe is pushed in slowly, with its temperature unchanged. You need the new pressure.", BOYLE, "Fixed mass and temperature: pV is constant."),
    gas_law("A sealed, rigid can of gas is heated. You need the new pressure.", PRESSURE, "The volume can't change, so p ∝ T."),
    gas_law("A closed steel cylinder of gas warms in the sun. You need the new pressure.", PRESSURE, "Fixed volume, so p ∝ T."),
    gas_law("Gas under a free, frictionless piston is heated. You need its new volume.", CHARLES, "The piston keeps the pressure fixed, so V ∝ T."),
    gas_law("A soap bubble's air cools at constant pressure. You need its new volume.", CHARLES, "Constant pressure, so V ∝ T."),
])

# ---------- L4 templates ----------
template("t01", "2023-27", "lin", "F40", "A steel tape, correct at {t0} °C, is used at {t} °C to measure {L} m. How far out is its reading, in mm? (α of steel = {a} × 10⁻⁵ K⁻¹)",
         {"L": {"set": [10, 20, 25, 30, 40, 50], "unit": "m"}, "t0": {"set": [15, 20, 25], "unit": "K"}, "t": {"set": [30, 35, 40, 45, 50, 55, 60, 65, 70], "unit": "K"}, "a": {"set": [1.1, 1.2], "unit": "K^-1"}},
         {"expr": "L*a*1e-5*(t - t0)*1000", "unit": "mm", "dim": "m"},
         ["answer/1000 == L*(a/100000)*(t - t0)"],
         [("misread-interval", "L*a*1e-5*t*1000", "Use the change in temperature, not the temperature itself."),
          ("wrong-quantity", "L*a*1e-5*t0*1000", "That uses the calibration temperature, not the change."),
          ("sign", "L*a*1e-5*(t + t0)*1000"), ("unit-conversion", "L*a*1e-5*(t - t0)*100"),
          ("ignored-condition", "L*a*1e-6*(t - t0)*1000", "α is × 10⁻⁵, not × 10⁻⁶.")],
         "Error = L × α × Δθ. The tape reads short, because its marks have spread apart.",
         constraints=["t > t0", "nice(answer, 1)"])
template("t02", "2020-35", "mixc", "F40", "Heat needed to turn {m} g of ice at {Ti} °C into water at {Tf} °C? (c of ice = 2100, c of water = 4200 J kg⁻¹ K⁻¹; latent heat of fusion = 3.36 × 10⁵ J kg⁻¹)",
         {"m": {"set": [50, 100, 200, 250, 500], "unit": "kg"}, "Ti": {"set": [-4, -5, -8, -10, -15, -20], "unit": "K"}, "Tf": {"set": [5, 10, 15, 20, 25, 30, 40, 50], "unit": "K"}},
         {"expr": "m/1000*(2100*(-Ti) + 336000 + 4200*Tf)/1000", "unit": "kJ", "dim_skip": True},
         ["answer*1000 == m/1000*2100*(0 - Ti) + m/1000*336000 + m/1000*4200*(Tf - 0)"],
         [("forgot-latent", "m/1000*(2100*(-Ti) + 4200*Tf)/1000"), ("ignored-condition", "m/1000*(336000 + 4200*Tf)/1000", "The ice must warm to 0 °C before it melts."),
          ("wrong-law", "m/1000*(4200*(-Ti) + 336000 + 4200*Tf)/1000", "Warm the ice with c of ice, 2100, not c of water."),
          ("stopped-early", "m/1000*336000/1000", "That's only the melting. Add the warming before and after."),
          ("sign", "m/1000*(2100*Ti + 336000 + 4200*Tf)/1000"), ("forgot-mass", "(2100*(-Ti) + 336000 + 4200*Tf)/1000")],
         "Three steps: warm the ice to 0 °C, melt it, then warm the water to the final temperature.",
         constraints=["nice(answer, 1)"])
template("t03", "2019-42", "mix", "F40", "A {m1} g metal block at 100 °C is dropped into {m2} g of water at {T2} °C. The final temperature is {Tf} °C. Specific heat capacity of the metal, with no heat loss? " + WATER,
         {"m1": {"set": [100, 200, 250, 300, 400, 500], "unit": "kg"}, "m2": {"set": [100, 150, 200, 250, 300], "unit": "kg"}, "T2": {"set": [20, 25, 30], "unit": "K"},
          "Tf": {"set": [24, 25, 26, 28, 30, 32, 35, 40], "unit": "K"}},
         {"expr": "m2*4200*(Tf - T2)/(m1*(100 - Tf))", "unit": "J kg⁻¹ K⁻¹", "dim_skip": True},
         ["answer*m1*(100 - Tf) == m2*4200*(Tf - T2)"],
         [("inverted", "m1*4200*(Tf - T2)/(m2*(100 - Tf))"), ("misread-interval", "m2*4200*(Tf - T2)/(m1*(100 - T2))", "The metal cools from 100 °C to the final temperature, not to the water's start."),
          ("forgot-mass", "4200*(Tf - T2)/(100 - Tf)"), ("assumed-symmetry", "4200*m2/m1"),
          ("wrong-quantity", "m2*4200*(Tf - T2)/(m1*Tf)", "Use the metal's fall in temperature, not the final temperature.")],
         "Heat lost by the metal = heat gained by the water: m₁c(100 − θ) = m₂ × 4200 × (θ − θ₂).",
         constraints=["Tf > T2", "200 <= answer <= 1000", "nice(answer, 0)"])
template("t04", "2016-42", "igl", "F40", "A rigid cylinder holds gas at {p1} kPa and {T1} °C. Some gas leaks out, and the rest is heated to {T2} °C. The pressure is now {p2} kPa. Fraction of the gas that leaked out?",
         {"p1": {"set": [100, 120, 150, 200, 240, 300], "unit": "1"}, "p2": {"set": [60, 75, 80, 90, 100, 120, 150, 160, 180, 200], "unit": "1"},
          "T1": {"set": [27, 77, 127], "unit": "1"}, "T2": {"set": [77, 127, 227, 327, 427], "unit": "1"}},
         {"expr": "1 - (p2/p1)*(T1 + 273)/(T2 + 273)", "unit": "", "dim": "1"},
         ["(1 - answer)*p1/(T1 + 273) == p2/(T2 + 273)"],
         [("celsius-in-gas-law", "1 - (p2/p1)*T1/T2"), ("stopped-early", "(p2/p1)*(T1 + 273)/(T2 + 273)", "That's the fraction left. Subtract it from 1."),
          ("ignored-condition", "1 - p2/p1", "Heating also raised the pressure, so allow for T."), ("inverted", "1 - (p1/p2)*(T1 + 273)/(T2 + 273)"),
          ("wrong-law", "1 - (T1 + 273)/(T2 + 273)", "The pressure changed too. Use n ∝ p/T."),
          ("misread-interval", "(1 - p2/p1)*(T1 + 273)/(T2 + 273)", "Scale the whole of p₂/p₁ by the temperatures, then subtract from 1.")],
         "n ∝ p/T at fixed volume. Fraction left = (p₂/T₂) ÷ (p₁/T₁), with T in kelvin.",
         constraints=["T2 > T1", "0.1 <= answer <= 0.9"])
template("t05", "2020-34", "cool", "F40", "In a room kept at {Tr} °C, a body cools from {a1} °C to {b1} °C in {t1} min. Using average temperatures, time for it to cool from {a2} °C to {b2} °C?",
         {"Tr": {"set": [15, 20, 25, 30], "unit": "K"}, "a1": {"set": [62, 65, 70, 75, 80, 85, 90, 100], "unit": "K"}, "t1": {"set": [2, 3, 4, 5, 6], "unit": "s"}, "a2": {"set": [35, 40, 45, 50, 55, 58], "unit": "K"}},
         {"expr": "t1*((a1 + b1)/2 - Tr)/((a2 + b2)/2 - Tr)", "unit": "min", "dim": "s", "dim_skip": True},
         ["(10/answer)/(10/t1) == ((a2 + b2)/2 - Tr)/((a1 + b1)/2 - Tr)"],
         [("cooling-constant-rate", "t1"), ("room-temp-excess", "t1*(a1 + b1)/(a2 + b2)"), ("inverted", "t1*((a2 + b2)/2 - Tr)/((a1 + b1)/2 - Tr)"),
          ("misread-interval", "t1*(a1 - Tr)/(a2 - Tr)", "Use the average temperature over each interval, not the start."),
          ("wrong-power", "t1*(((a1 + b1)/2 - Tr)/((a2 + b2)/2 - Tr))**2")],
         "Both drops are 10 K. The time is inversely proportional to the average excess over the room.",
         derived={"b1": "a1 - 10", "b2": "a2 - 10"}, exclude=["a2 - 10 <= Tr + 5"], constraints=["nice(answer, 1)"])
template("t06", "2024-28", "abs", "F40", "A closed room of {V} m³ has an absolute humidity of {a} g m⁻³ and a relative humidity of {rh}%. Extra water vapour needed to saturate it, at the same temperature?",
         {"V": {"set": [50, 60, 75, 80, 100, 120], "unit": "m^3"}, "a": {"set": [12, 15, 18, 20, 24, 30], "unit": "kg m^-3"}, "rh": {"set": [40, 50, 60, 75, 80], "unit": "1"}},
         {"expr": "V*a*(100/rh - 1)/1000", "unit": "kg", "dim_skip": True},
         ["(answer*1000/V + a)*rh/100 == a"],
         [("wrong-law", "V*a*(1 - rh/100)/1000", "Saturation needs a ÷ RH per m³, not a × (1 − RH)."),
          ("stopped-early", "V*a*100/rh/1000", "That's the total at saturation. Subtract what's already there."),
          ("ignored-condition", "a*(100/rh - 1)/1000", "Multiply by the room's volume."), ("wrong-quantity", "V*a/1000", "That's the vapour already in the room."),
          ("inverted", "V*a*rh/100/1000")],
         "At saturation the absolute humidity would be a × 100/RH. The extra is V × (that − a).",
         constraints=["nice(answer, 2)"])
template("t07", "2020-13", "mixa", "F40", "Room A ({VA} m³) is at RH {ha}% and room B ({VB} m³) at RH {hb}%, both at the same temperature. The door between them is left open for a long time. Final RH?",
         {"VA": {"set": [20, 30, 40, 50, 60], "unit": "m^3"}, "VB": {"set": [10, 20, 30, 40], "unit": "m^3"}, "ha": {"set": [30, 40, 50, 60], "unit": "1"}, "hb": {"set": [60, 70, 80, 90], "unit": "1"}},
         {"expr": "(VA*ha + VB*hb)/(VA + VB)", "unit": "%", "dim": "1"},
         ["answer*(VA + VB) == VA*ha + VB*hb"],
         [("assumed-symmetry", "(ha + hb)/2"), ("inverted", "(VB*ha + VA*hb)/(VA + VB)"), ("sign", "ha + hb"),
          ("ignored-condition", "hb", "The vapour spreads through both rooms, so B's RH falls."), ("wrong-quantity", "hb - ha", "That's the difference between the rooms.")],
         "At the same temperature, RH ∝ vapour per m³, so the final RH is the volume-weighted average.",
         constraints=["VA != VB", "ha < hb", "nice(answer, 0)"])
template("t08", "2021-30", "fl", "F40", "A gas under a free, frictionless piston is heated by a {R} Ω coil carrying {I} A for {t} min. It expands from {V1} m³ to {V2} m³ at a constant {p} kPa. Rise in its internal energy?",
         {"R": {"set": [40, 50, 80, 100, 200], "unit": "ohm"}, "I": {"set": [1, 1.5, 2], "unit": "A"}, "t": {"set": [2, 5, 10], "unit": "s"}, "V1": {"set": [0.2, 0.4], "unit": "m^3"},
          "dV": {"set": [0.02, 0.05, 0.1, 0.2], "unit": "m^3"}, "p": {"set": [100, 120, 150, 200], "unit": "Pa"}},
         {"expr": "(I**2*R*t*60 - p*1000*(V2 - V1))/1000", "unit": "kJ", "dim_skip": True},
         ["answer*1000 + p*1000*dV == I*I*R*t*60"],
         [("sign", "(I**2*R*t*60 + p*1000*(V2 - V1))/1000"), ("ignored-condition", "I**2*R*t*60/1000", "The gas does work pushing the piston, so subtract pΔV."),
          ("wrong-quantity", "p*1000*(V2 - V1)/1000", "That's the work done by the gas."), ("forgot-square", "(I*R*t*60 - p*1000*(V2 - V1))/1000"),
          ("misread-interval", "(I**2*R*t*60 - p*1000*V2)/1000", "Work uses the change in volume, not the final volume.")],
         "ΔQ = I²Rt, ΔW = pΔV, and ΔU = ΔQ − ΔW.",
         derived={"V2": "V1 + dV"}, constraints=["answer > 0", "nice(answer, 1)"])
template("t09", "2018-40", "rods", "F40", "Two rods of equal length and cross-section, with conductivities {k1} and {k2} W m⁻¹ K⁻¹, are joined end to end and lagged. The free end of the first is held at {Th} °C, and of the second at {Tc} °C. Temperature of the joint?",
         {"k1": {"set": [10, 20, 30, 40, 50, 60, 90, 120, 200, 400], "unit": "1"}, "k2": {"set": [10, 20, 30, 40, 50, 60, 90, 120, 200, 400], "unit": "1"},
          "Th": {"set": [80, 100], "unit": "K"}, "Tc": {"set": [10, 20, 30], "unit": "K"}},
         {"expr": "(k1*Th + k2*Tc)/(k1 + k2)", "unit": "°C", "dim": "K"},
         ["k1*(Th - answer) == k2*(answer - Tc)"],
         [("inverted", "(k2*Th + k1*Tc)/(k1 + k2)"), ("assumed-symmetry", "(Th + Tc)/2"),
          ("stopped-early", "(Th - Tc)*k1/(k1 + k2)", "That's the rise above the cold end. Add the cold end's temperature."),
          ("misread-interval", "Th*k1/(k1 + k2)", "Share out the drop between the two ends, not from 0 °C."), ("sign", "(k1*Th - k2*Tc)/(k1 + k2)")],
         "The same heat flows through both rods: k₁(θ_h − θ) = k₂(θ − θ_c).",
         constraints=["k1 != k2", "nice(answer, 1)"])


def bank(bid, source, skill, statements, why, conflicts=()):
    b = item_base(f"{UNIT}.{bid}", "L4", "F42", skill, source, SOURCE_DIFFICULTY[source])
    b.update(statements=[dict(text=text(t), true=truth, **({"tag": tag} if tag else {})) for t, truth, tag in statements],
             conflicts=[list(c) for c in conflicts], explanation=text(why))
    BANKS.append(b)


bank("b01", "2017-36", "lat", [
    ("Heat taken in from the room makes the measured latent heat of ice too small.", True, None),
    ("Wet ice makes the measured latent heat of ice too small.", True, None),
    ("Ice colder than 0 °C makes the measured latent heat too large.", True, None),
    ("Ending as far below room temperature as you started above it cancels most heat exchange.", True, None),
    ("Wet ice makes the measured latent heat of ice too large.", False, "inverted"),
    ("Ice colder than 0 °C makes the measured latent heat too small.", False, "inverted"),
    ("The mixture's temperature rises steadily while the ice melts.", False, "heat-during-change"),
    ("Dew forming on the calorimeter gives it no extra heat.", False, "forgot-latent"),
], "Any heat the calculation leaves out shows up as an error in L: heat from the room or dew adds heat, wet ice adds mass that never melted, and cold ice needs extra heat to warm.",
    conflicts=[(1, 4), (2, 5)])
bank("b02", "2021-5", "ke", [
    ("At 0 K, the mean KE of an ideal gas molecule is zero.", True, None),
    ("The mean molecular KE of an ideal gas is proportional to its absolute temperature.", True, None),
    ("Two ideal gases at the same temperature have the same mean molecular KE.", True, None),
    ("At the same temperature, lighter molecules have a higher r.m.s. speed.", True, None),
    ("Water freezes at absolute zero.", False, "absolute-zero-myth"),
    ("At the same temperature, heavier molecules have more mean KE.", False, "ke-depends-on-gas"),
    ("Doubling the Celsius temperature of a gas doubles its mean molecular KE.", False, "celsius-in-gas-law"),
    ("Compressing a gas at constant temperature raises its mean molecular KE.", False, "ke-depends-on-gas"),
], "Mean molecular KE = (3/2)kT. It depends only on the absolute temperature.",
    conflicts=[(2, 5), (1, 6)])
bank("b03", "2025-23", "rht", [
    ("At constant absolute humidity, the relative humidity falls as the air warms.", True, None),
    ("Cooling air to its dew point brings its relative humidity to 100%.", True, None),
    ("Below the dew point, some of the vapour condenses.", True, None),
    ("Saturated vapour pressure rises with temperature.", True, None),
    ("A higher relative humidity always means more water vapour per m³.", False, "rh-vs-absolute"),
    ("Warming air with no change in its vapour raises its relative humidity.", False, "inverted"),
    ("Compressing saturated vapour at constant temperature raises its pressure.", False, "svp-boyle"),
    ("Saturated air holds the same mass of vapour per m³ at every temperature.", False, "rh-vs-absolute"),
], "RH = vapour pressure ÷ SVP. SVP rises with temperature, so warming air with the same vapour lowers its RH.",
    conflicts=[(0, 5), (3, 7)])

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
