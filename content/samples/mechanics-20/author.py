#!/usr/bin/env python3
"""Writes items.json: the Mechanics sample in the format of content authoring spec v0.3.

This is only a compact way to type the items. validate.py reads items.json and nothing from here.
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
SPEC_VERSION = "0.5"
FIGURES = HERE / "figures"

SKILLS = {
    "vec": ("phy.mech.vec.resultant-range", "Range of a resultant force", "procedural"),
    "thr": ("phy.mech.kin.vertical-throw", "Vertical throw symmetry", "procedural"),
    "gr": ("phy.mech.kin.graph-slope-area", "Gradient and area of motion graphs", "conceptual"),
    "avg": ("phy.mech.kin.average-velocity", "Average velocity", "procedural"),
    "n3": ("phy.mech.newton.n3-pairs", "Newton's third-law pairs", "conceptual"),
    "lift": ("phy.mech.newton.apparent-weight", "Apparent weight in a lift", "procedural"),
    "stop": ("phy.mech.fric.stopping-distance", "Stopping distance under friction", "procedural"),
    "grip": ("phy.mech.fric.traction-limit", "Friction limit on acceleration", "procedural"),
    "mom": ("phy.mech.mom.momentum-vs-energy", "Momentum or energy conservation", "procedural"),
    "imp": ("phy.mech.imp.graph-area", "Impulse from a force–time graph", "procedural"),
    "proj": ("phy.mech.proj.components", "Projectile velocity components", "procedural"),
    "circ": ("phy.mech.circ.friction-limit", "Friction limit in circular motion", "procedural"),
    "beam": ("phy.mech.eq.moment-balance", "Moment balance on a beam", "procedural"),
    "pow": ("phy.mech.pow.force-speed", "Power, force and speed", "procedural"),
    "bnc": ("phy.mech.energy.bounce-height", "Rebound height and speed", "procedural"),
    "ang": ("phy.mech.rot.angular-momentum", "Angular momentum conservation", "procedural"),
    "roll": ("phy.mech.rot.rolling-energy", "Energy of a rolling body", "procedural"),
    "moi": ("phy.mech.rot.moi-factors", "What moment of inertia depends on", "conceptual"),
}

SOURCE_DIFFICULTY = {
    "2022-2": 2, "2021-48": 4, "2024-7": 2, "2020-4": 2, "2023-3": 3, "2024-4": 2, "2025-17": 3,
    "2018-14": 2, "2025-12": 3, "2021-6": 2, "2023-16": 4, "2022-18": 2, "2023-17": 3, "2024-15": 3,
    "2025-41": 3, "2023-45": 4, "2019-31": 3, "2016-32": 2, "2025-13": 3, "2021-15": 2,
}

CARDS, POOLS, TEMPLATES, BANKS, MISSING = [], [], [], [], set()


SINHALA = dict(line.rstrip("\n").split("\t", 1) for line in (HERE / "si.tsv").read_text().splitlines() if line.strip())


def needs_translation(s):
    no_units = re.sub(r"\b(rad|rpm|kg|km|kW|sin|cos)\b", "", s)
    return re.search(r"[a-z]{3,}|\\b[A-Z][a-z]+", no_units) is not None


def text(s):
    if s in SINHALA:
        return {"en": s, "si": SINHALA[s]}
    if needs_translation(s):
        MISSING.add(s)
    return {"en": s, "si": s}  # symbols and numbers stay as they are


def item_base(item_id, layer, form, skill, source, difficulty):
    return dict(
        id=item_id, version=1, status="draft", layer=layer, form=form, skills=[SKILLS[skill][0]],
        difficulty_est=difficulty, source_ref=source, note_ref=f"phy.mech.note.{skill}", reviewer=None, review_notes=None,
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
            marker = f"arrow-c{n:03d}-{i}"  # unique, so figures can share one screen
            (FIGURES / f"c{n:03d}-{i}.svg").write_text(body.replace('id="a"', f'id="{marker}"').replace("url(#a)", f"url(#{marker})"))
            assets.append(f"figures/c{n:03d}-{i}.svg")
    c = item_base(f"phy.mech.c{n:03d}", layer, form, skill, source, {"L1": 1, "L2": 2}[layer])
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
        p = item_base(f"phy.mech.{pool_id}-{i:02d}", "L3", form, skill, source, 2)
        order = "fixed" if form == "F32" else "shuffle"
        p.update(pool_id=f"phy.mech.{pool_id}", text=text(prompt), options=options(right, wrong), option_order=order, explanation=text(why))
        POOLS.append(p)


def with_detail_si(d):
    if "detail" in d:
        d["detail_si"] = text(d["detail"])["si"]
    return d


def template(tid, source, skill, form, stem, params, answer, verify, distractors, why, **extra):
    t = item_base(f"phy.mech.{tid}", "L4", form, skill, source, SOURCE_DIFFICULTY[source])
    t.update(text=text(stem), params=params, answer=answer, verify=verify,
             distractors=[with_detail_si(d if isinstance(d, dict) else dict(tag=d[0], expr=d[1], **({"detail": d[2]} if len(d) == 3 else {}))) for d in distractors],
             param_text={"si": {v: text(v)["si"] for p in params.values() for v in p["set"] if isinstance(v, str)}},
             constants=extra.pop("constants", {"g": 10}), option_order=extra.pop("order", "ascending"),
             format={"sig_figs": 3}, explanation=text(why), **extra)
    TEMPLATES.append(t)


# ---------- Figures for cards ----------
def svg(body, w=170, h=120):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" font-family="sans-serif" font-size="11">'
            f'<rect width="{w}" height="{h}" fill="white"/>'
            '<defs><marker id="a" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">'
            f'<path d="M0 0L8 4L0 8z" fill="#222"/></marker></defs>{body}</svg>')


def arrow(x1, y1, x2, y2, label="", dx=4, dy=4):
    label_svg = f'<text x="{x2 + dx}" y="{y2 + dy}" fill="#222">{label}</text>' if label else ""
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#222" stroke-width="1.6" marker-end="url(#a)"/>{label_svg}'


def plot(f, xlabel, ylabel, n=30):
    body = arrow(25, 105, 160, 105, xlabel, -14, 12) + arrow(25, 105, 25, 8, ylabel, 4, 8)
    pts = " ".join(f"{25 + 125 * i / n:.1f},{105 - 90 * f(i / n):.1f}" for i in range(n + 1))
    return svg(body + f'<polyline points="{pts}" fill="none" stroke="#1a5fb4" stroke-width="2"/>')


def ball(*arrows):
    return svg('<circle cx="85" cy="60" r="8" fill="#ddd" stroke="#222"/>' + "".join(arrows))


def slope(*arrows):
    body = '<line x1="10" y1="108" x2="160" y2="28" stroke="#222" stroke-width="2"/>'
    body += '<rect x="-14" y="-18" width="28" height="18" fill="#ddd" stroke="#222" transform="translate(85 68) rotate(-28)"/>'
    return svg(body + "".join(arrows))


MG_BALL, FORWARD = arrow(85, 68, 85, 108, "mg"), arrow(93, 60, 140, 60, "F")
WEIGHT, NORMAL = arrow(85, 68, 85, 112, "mg", 4, -2), arrow(82, 62, 58, 18, "N", -14, 4)
UP, DOWN, NORMAL_UP = arrow(95, 56, 132, 36, "f", 2, -3), arrow(70, 74, 34, 93, "f", -8, -4), arrow(85, 56, 85, 12, "N")

# ---------- L1 and L2 cards ----------
recall("2022-2", "vec", "F01", "Forces A and B act at one point, with A > B. Smallest possible resultant?", "A − B",
       ["0", "A + B", "√(A² − B²)"], "Forces in opposite directions give the smallest resultant, A − B.")
true_false("2022-2", "vec", "Two forces at right angles always have a resultant larger than the bigger force.", True,
           "no-resolve", "R = √(A² + B²), which is always larger than A or B alone.")

card("2021-48", "thr", "L2", "F14",
     "A ball passes a window going up, then again coming down, 6 s later. Student says: \"It takes 6 s to go from the window to the top.\" What's wrong?",
     "The 6 s covers up and down, so window to top is 3 s",
     [("The ball is slower going up, so window to top is over 3 s", "up-down-time"),
      ("The ball's mass decides how long it takes to reach the top", "mass-matters"),
      ("Nothing is wrong: the 6 s only counts the way up", "misread-interval", "The gap covers the way up and the way down.")],
     "With no air resistance, the path is symmetric. Half the gap is spent going up to the top.")

recall("2024-7", "gr", "F03", "On a displacement–time graph, the gradient gives?", "Velocity",
       ["Acceleration", "Displacement", "Force"], "Gradient of s–t is the rate of change of displacement, which is velocity.")
recall("2024-7", "gr", "F03", "On a velocity–time graph, the area under the line gives?", "Displacement",
       ["Acceleration", "Speed", "Force"], "Area under v–t is displacement. Its gradient is acceleration.")
card("2024-7", "gr", "L2", "F15", "An object starts from rest, speeds up, then slows to a stop, never reversing. Pick its s–t graph.",
     "S-shaped rise: flat at the start and flat at the end",
     [("Straight rising line", "graph-shape"), ("Rises, then falls back to zero", "sign"),
      ("Steep at the start, flat only at the end", "ignored-condition", "It starts from rest, so the curve starts flat.")],
     "Zero velocity means zero gradient, so the curve is flat at both ends.",
     figures=[plot(lambda x: x * x * (3 - 2 * x), "t", "s"), plot(lambda x: 0.9 * x, "t", "s"),
              plot(lambda x: 3.6 * x * (1 - x), "t", "s"), plot(lambda x: 1 - (1 - x) ** 2, "t", "s")])

card("2020-4", "avg", "L2", "F14",
     "A runner goes 5 m s⁻¹ for 1 s, then 1 m s⁻¹ for 3 s. Student says: \"Average = (5 + 1) ÷ 2 = 3 m s⁻¹.\" What's wrong?",
     "The times are unequal, so divide total distance by total time",
     [("The runner slowed down, so use the final speed instead", "misread-interval", "Average velocity covers the whole motion, not just the end."),
      ("The faster part counts more, so the average is above 3 m s⁻¹", "mean-of-speeds"),
      ("The times need averaging too, so divide 3 by 2", "wrong-law", "Average velocity is total displacement ÷ total time.")],
     "Average velocity = total displacement ÷ total time, here 8 m ÷ 4 s = 2 m s⁻¹.")

card("2023-3", "n3", "L2", "F18", "What pushes a walking person forward?", "The ground, on the person",
     [("The person, on the ground", "force-on-wrong-body"), ("The person's legs, on the person", "internal-force"), ("The air, on the person", "force-wrong-source")],
     "The foot pushes the ground backward. The ground pushes the person forward.")
card("2023-3", "n3", "L2", "F18", "A car speeds up on a level road. What force pushes it forward?", "The road, on the tyres",
     [("The engine, on the car", "internal-force"), ("The tyres, on the road", "force-on-wrong-body"), ("The air, on the car", "force-wrong-source")],
     "The engine turns the wheels, but an internal force can't accelerate the car. Road friction does.")
true_false("2023-3", "n3", "A truck speeds up while pulling a trailer. The truck's pull on the trailer equals the trailer's pull on the truck.", True,
           "pair-unequal", "A third-law pair is always equal, even during acceleration.")
card("2024-4", "n3", "L2", "F18", "A book rests on a table. Which force pairs with Earth's pull on the book?", "The book's pull on Earth",
     [("The table's push on the book", "balance-vs-pair"), ("The book's push on the table", "force-on-wrong-body"), ("The table's pull on Earth", "pair-wrong-bodies")],
     "A pair involves the same two bodies. The table's push balances the weight, but it isn't the pair.")
card("2024-4", "n3", "L2", "F14", "Student says: \"Action and reaction are equal and opposite, so nothing can ever accelerate.\" What's wrong?",
     "They act on different bodies, so they don't cancel",
     [("The reaction is a little smaller, so a net force remains", "pair-unequal"),
      ("The reaction comes later, so they don't cancel at once", "pair-delay"),
      ("They only cancel when the two bodies are touching", "pair-contact-only")],
     "Add forces only on the same body when finding its acceleration.")

card("2025-17", "lift", "L2", "F13", "A lift moving up is slowing down. Compared with mg, the scale reading is?", "Less than mg",
     [("More than mg", "motion-vs-accel"), ("Equal to mg", "ignored-condition", "Slowing down is acceleration, so the reading changes."), ("Zero", "free-fall-reading")],
     "Slowing while moving up means the acceleration is downward, so N = m(g − a).")
card("2025-17", "lift", "L2", "F13", "A lift moves down at constant speed. Compared with mg, the scale reading is?", "Equal to mg",
     [("Less than mg", "motion-vs-accel"), ("More than mg", "sign"), ("Zero", "free-fall-reading")],
     "Constant speed means zero acceleration, whichever way the lift moves.")

card("2018-14", "stop", "L2", "F12", "A block slides to rest on a rough surface. Initial speed × 2. Stopping distance × ?", "4",
     [("2", "forgot-square"), ("8", "wrong-power"), ("√2", "inverted")], "s = v²/(2μg), so s ∝ v².")
card("2018-14", "stop", "L2", "F12", "A block slides to rest on a rough surface. Mass × 2, same initial speed. Stopping distance × ?", "1",
     [("2", "mass-matters"), ("½", "inverted"), ("4", "wrong-power")], "Mass cancels: both the KE and the friction force are proportional to m.")
card("2018-14", "stop", "L2", "F19", "Blocks X and Y slide on the same rough floor, at 2 m s⁻¹ and 6 m s⁻¹. Ratio of stopping distances, X : Y?", "1 : 9",
     [("1 : 3", "forgot-square"), ("3 : 1", "wrong-power"), ("9 : 1", "inverted")], "s = v²/(2μg), so s ∝ v². Mass doesn't matter.")
card("2018-14", "stop", "L2", "F23", "A block rests on a rough slope without sliding. Pick the diagram of the forces on it.",
     "Weight down, N perpendicular to the slope, friction up the slope",
     [("Weight down, N perpendicular to the slope, friction down the slope", "friction-direction"),
      ("Weight down, N perpendicular to the slope, no friction", "omitted-friction"),
      ("Weight down, N straight up, friction up the slope", "normal-vertical")],
     "Without friction the block would slide down, so friction acts up the slope. N is perpendicular to the surface.",
     figures=[slope(WEIGHT, NORMAL, UP), slope(WEIGHT, NORMAL, DOWN), slope(WEIGHT, NORMAL), slope(WEIGHT, NORMAL_UP, UP)])

recall("2025-12", "grip", "F05", "54 km h⁻¹ in m s⁻¹?", "15", ["54", "30", "194"], "Divide by 3.6: 54 ÷ 3.6 = 15 m s⁻¹.", tag="unit-conversion")
card("2025-12", "grip", "L2", "F13", "All four wheels of a car are driven. Greatest possible acceleration on a level road?", "μₛg",
     [("μₛmg", "forgot-mass"), ("g/μₛ", "inverted"), ("μₛg/2", "assumed-symmetry")],
     "Maximum friction μₛmg = ma, so a = μₛg. All the weight is on the driven wheels.")

card("2021-6", "mom", "L2", "F13", "Equal-mass blocks move towards each other at 6 m s⁻¹ and 2 m s⁻¹, then stick. Their speed after?", "2 m s⁻¹",
     [("4 m s⁻¹", "sign"), ("8 m s⁻¹", "forgot-mass"), ("0", "assumed-symmetry")],
     "Opposite directions: (6 − 2) ÷ 2 = 2 m s⁻¹, in the direction of the faster block.")
true_false("2023-16", "mom", "KE is conserved in a perfectly inelastic collision.", False, "ke-conserved-inelastic",
           "Momentum is conserved, but some KE becomes heat and sound.")

recall("2022-18", "imp", "F03", "The area under a force–time graph gives?", "Impulse", ["Work done", "Power", "Acceleration"],
       "Impulse = ∫F dt = change in momentum. Work is the area under force–distance.")
recall("2022-18", "imp", "F04", "Dimensions of impulse?", "MLT⁻¹", ["MLT⁻²", "ML²T⁻²", "MT⁻¹"], "Impulse = force × time = MLT⁻² × T.")
card("2022-18", "imp", "L2", "F13", "The area under an F–t graph is 30 N s. It acts on a 3 kg body at rest. Final speed?", "10 m s⁻¹",
     [("30 m s⁻¹", "forgot-mass"), ("90 m s⁻¹", "inverted"), ("5 m s⁻¹", "forgot-half")], "Impulse = change in momentum, so v = 30 ÷ 3.")

card("2023-17", "proj", "L2", "F14", "Student says: \"At the top of its path the ball has v = 0, so its KE = 0.\" What's wrong?",
     "Horizontal velocity remains, so KE isn't zero",
     [("KE at the top is always half of K, at any angle", "ke-half-at-top"),
      ("KE is zero only when PE is zero as well", "ke-pe-confusion"),
      ("v = 0 is right, but KE also depends on height", "v-zero-at-top")],
     "Only the vertical component is zero at the top.")
true_false("2023-17", "proj", "A projectile's acceleration is zero at the top of its path.", False, "accel-zero-at-top",
           "Acceleration is g downward throughout the flight.")
card("2023-17", "proj", "L2", "F23", "A ball in flight is at the top of its path, moving right. No air resistance. Pick the diagram of the forces on it.",
     "Only mg, downward",
     [("mg downward and a forward force", "force-along-motion"), ("Only a forward force", "gravity-off-in-flight"), ("No forces at the top", "accel-zero-at-top")],
     "Nothing pushes the ball forward. It keeps moving because no horizontal force acts.",
     figures=[ball(MG_BALL), ball(MG_BALL, FORWARD), ball(FORWARD), ball()])

recall("2024-15", "circ", "F05", "60 rpm in rad s⁻¹?", "2π", ["60", "π", "120π"], "ω = 2π × (rpm ÷ 60) = 2π rad s⁻¹.", tag="unit-conversion")
card("2024-15", "circ", "L2", "F18", "A coin turns with a turntable without sliding. What force keeps it moving in a circle?", "Static friction, towards the centre",
     [("Centrifugal force, outwards", "centrifugal"), ("The normal reaction", "force-wrong-source"), ("A force along its direction of motion", "force-along-motion")],
     "Friction is the only horizontal force, and it provides mrω².")
card("2024-15", "circ", "L2", "F12", "A coin rests on a turntable. Rotation rate × 2. Largest radius without sliding × ?", "¼",
     [("½", "forgot-square"), ("2", "wrong-power"), ("4", "inverted")], "r = μg/ω², so r ∝ 1/ω².")

card("2025-41", "beam", "L2", "F15", "A person walks along a uniform beam from support P to support Q. Pick the graph of the force at Q against distance walked.",
     "Straight rising line that starts above zero",
     [("Curve that rises", "wrong-power"), ("Straight falling line", "swapped-support"), ("Straight rising line that starts at zero", "ignored-condition", "The beam's own weight loads Q even when the person is at P.")],
     "Moments give a force linear in distance. The beam's own weight sets the starting value.",
     figures=[plot(lambda x: 0.3 + 0.6 * x, "d", "force"), plot(lambda x: 0.3 + 0.6 * x ** 2.2, "d", "force"),
              plot(lambda x: 0.9 - 0.6 * x, "d", "force"), plot(lambda x: 0.9 * x, "d", "force")])

recall("2023-45", "pow", "F02", "Power = driving force × ▢", "velocity", ["time", "acceleration", "distance"], "P = Fv at every instant.")
recall("2023-45", "pow", "F04", "Dimensions of power?", "ML²T⁻³", ["ML²T⁻²", "MLT⁻¹", "MLT⁻³"], "Power = energy ÷ time = ML²T⁻² ÷ T.")
true_false("2023-45", "pow", "A car climbs a slope at constant speed. Driving force = resistance + mg sin θ.", True, "no-resolve",
           "Constant speed means zero net force along the slope.")

card("2019-31", "bnc", "L2", "F12", "A ball's rebound speed × ½. Rebound height × ?", "¼",
     [("½", "forgot-square"), ("2", "inverted"), ("√½", "wrong-power")], "h = v²/(2g), so h ∝ v².")
card("2019-31", "bnc", "L2", "F14", "Student says: \"Speed falls by 25% at a bounce, so height falls by 25%.\" What's wrong?",
     "Height ∝ v², so height falls to about 56%",
     [("Height ∝ v², so height falls by 2 × 25% = 50%", "forgot-square"),
      ("Height ∝ √v, so height falls to about 87%", "wrong-power"),
      ("Energy isn't lost, so height doesn't change", "wrong-conservation-law")],
     "0.75² ≈ 0.56, so the height falls by about 44%.")

card("2016-32", "ang", "L2", "F12", "A skater pulls in their arms, and I halves. ω × ?", "2",
     [("½", "inverted"), ("√2", "ke-conserved-rotation"), ("4", "wrong-power")], "Iω is constant.")
card("2016-32", "ang", "L2", "F12", "A skater pulls in their arms, and I halves. Rotational KE × ?", "2",
     [("1", "ke-conserved-rotation"), ("4", "wrong-power"), ("½", "inverted")], "KE = L²/(2I), so it doubles. The skater's muscles supply the extra energy.")

recall("2025-13", "roll", "F02", "KE of a rolling body = ½mv² + ½ ▢ ω²", "I", ["m", "r", "v"], "Translation + rotation, with I as the rotational mass.")
card("2025-13", "roll", "L2", "F11", "A solid sphere and a hoop of equal mass and radius roll down the same slope. Which gets down first?", "Sphere",
     [("Hoop", "moi-shape-swap"), ("They tie", "moi-mass-only"), ("Depends on the mass", "mass-matters")],
     "The sphere has the smaller I/(MR²), so less energy goes into rotation.")
card("2025-13", "roll", "L2", "F19", "A hoop and a disc have equal M and R, and roll at equal speed. Ratio of rotational KE, hoop : disc?", "2 : 1",
     [("1 : 2", "inverted"), ("1 : 1", "moi-mass-only"), ("4 : 1", "wrong-power")], "Same ω, and I is MR² against ½MR².")

card("2021-15", "moi", "L2", "F11", "A ring and a disc have equal mass and radius. Which has the larger I about the central axis?", "Ring",
     [("Disc", "moi-shape-swap"), ("Equal", "moi-mass-only"), ("Depends on speed", "moi-depends-on-omega")],
     "All of the ring's mass is at distance r: MR², against ½MR² for the disc.")
recall("2021-15", "moi", "F04", "Dimensions of moment of inertia?", "ML²", ["ML", "ML⁻²", "ML²T⁻²"], "I = Σmr².")

# ---------- L3 scenario pools ----------
PRINCIPLES = lambda a, b, c, d: [("Conservation of momentum", a), ("Conservation of energy", b), ("F = ma with a constant force", c), ("Equations of uniform acceleration", d)]


def principle_scenario(prompt, right, why):
    tag = {"Conservation of momentum": "momentum-external-force", "Conservation of energy": "ke-conserved-inelastic"}
    choices = PRINCIPLES(tag["Conservation of momentum"], tag["Conservation of energy"], "unknown-not-eliminated", "suvat-nonuniform")
    return prompt, right, [c for c in choices if c[0] != right], why


pool("p01", "2021-6", "mom", "F30", [
    principle_scenario("Two rail wagons collide and couple together. Most direct principle for their common speed?", "Conservation of momentum", "No external horizontal force acts. Coupling loses KE, so energy won't give it."),
    principle_scenario("A bullet embeds in a block on a smooth table. Most direct principle for the speed just after?", "Conservation of momentum", "The impact force is internal and unknown. KE turns into heat."),
    principle_scenario("A gun recoils when it fires a shell. Most direct principle for the recoil speed?", "Conservation of momentum", "Total momentum stays zero. Chemical energy makes KE unusable here."),
    principle_scenario("A ball rolls without friction down a curved track. Most direct principle for its speed at the bottom?", "Conservation of energy", "The acceleration changes along a curve. PE lost becomes KE."),
    principle_scenario("A pendulum bob swings down from rest. Most direct principle for its speed at the lowest point?", "Conservation of energy", "Tension does no work, so PE lost becomes KE. The acceleration isn't uniform."),
    principle_scenario("A compressed spring launches a block across a smooth table. Most direct principle for the launch speed?", "Conservation of energy", "The spring force varies. Stored energy becomes KE."),
])

SAME, DIFFERENT = "Same method", "Different methods"
same_scenario = lambda a, b, right, why: (f"\"{a}\" and \"{b}\" Same method?", right, [(DIFFERENT if right == SAME else SAME, "wrong-conservation-law")], why)
pool("p02", "2023-16", "mom", "F32", [
    same_scenario("Wagons couple after a collision.", "A skater throws a ball and recoils.", SAME, "Both use conservation of momentum, as no external force acts."),
    same_scenario("A bullet embeds in a block.", "A gun recoils on firing.", SAME, "Both use momentum. KE changes in both."),
    same_scenario("A ball rolls down a smooth curved track.", "A pendulum bob swings to its lowest point.", SAME, "Both use energy conservation."),
    same_scenario("Wagons couple after a collision.", "A block slides down a smooth curved slope; find its speed at the bottom.", DIFFERENT, "Wagons use momentum. On the slope, use energy."),
    same_scenario("A bullet embeds in a block.", "A spring launches a block.", DIFFERENT, "The bullet uses momentum. The spring uses energy."),
    same_scenario("A pendulum bob swings to its lowest point.", "A shell splits into two at its highest point.", DIFFERENT, "The pendulum uses energy. The split shell uses momentum."),
])

ASK = "Which quantity stays constant?"
pool("p03", "2023-17", "proj", "F31", [
    (f"A stone is thrown at 40° to the horizontal, with no air resistance. {ASK}", "Horizontal velocity", [("Vertical velocity", "gravity-off-in-flight"), ("Speed", "speed-constant"), ("Kinetic energy", "ke-pe-confusion")], "No horizontal force acts, so the horizontal velocity doesn't change."),
    (f"A marble rolls off a table and falls to the floor, with no air resistance. {ASK}", "Horizontal velocity", [("Vertical velocity", "gravity-off-in-flight"), ("Speed", "speed-constant"), ("Kinetic energy", "ke-pe-confusion")], "Gravity changes only the vertical velocity."),
    (f"A parcel drops from a plane flying level, with no air resistance. {ASK}", "Horizontal velocity", [("Height above ground", "gravity-off-in-flight"), ("Speed", "speed-constant"), ("Kinetic energy", "ke-pe-confusion")], "It keeps the plane's horizontal velocity as it falls."),
    (f"A ball is thrown straight up, with no air resistance. {ASK}", "Acceleration", [("Velocity", "gravity-off-in-flight"), ("Speed", "speed-constant"), ("Kinetic energy", "ke-pe-confusion")], "Acceleration is g throughout, including at the top."),
    (f"A ball is thrown at 30° to the horizontal, with no air resistance. {ASK}", "Acceleration", [("Vertical velocity", "gravity-off-in-flight"), ("Speed", "speed-constant"), ("Kinetic energy", "ke-pe-confusion")], "Gravity is the only force, so acceleration stays at g downward."),
    (f"A stone falls from a bridge from rest, with no air resistance. {ASK}", "Acceleration", [("Velocity", "gravity-off-in-flight"), ("Speed", "speed-constant"), ("Kinetic energy", "ke-pe-confusion")], "Velocity grows at a steady rate g."),
])

moments = lambda prompt, right, other, why: (f"{prompt} Most direct first step?", f"Take moments about {right}",
                                              [(f"Take moments about {other}", "unknown-not-eliminated"), ("Share the load equally", "assumed-symmetry"), ("Use conservation of energy", "wrong-law", "A balance problem needs moments, not energy.")], why)
pool("p04", "2025-41", "beam", "F33", [
    moments("A beam rests on supports P and Q, with a person on it. You need the force at Q.", "P", "Q", "Moments about P remove the unknown force at P."),
    moments("A plank rests on supports A and B, with a painter on it. You need the force at A.", "B", "A", "Moments about B remove the unknown force at B."),
    moments("A rod is hinged at one end and held level by a string at the other. You need the string's tension.", "the hinge", "the string", "Moments about the hinge remove the unknown hinge force."),
    moments("A ladder leans on a smooth wall and stands on rough ground. You need the wall's force.", "the ladder's foot", "the top of the ladder", "The foot carries two unknown forces, and moments about it remove both."),
    moments("A shelf is hinged to a wall and held by a sloping strut. You need the strut's force.", "the hinge", "the strut's joint", "Moments about the hinge remove the unknown hinge force."),
    moments("A bridge deck rests on piers X and Y, with a truck on it. You need the force at Y.", "X", "Y", "Moments about X remove the unknown force at X."),
])


def spin(prompt, right, why):
    choices = [("Conservation of angular momentum", "wrong-conservation-law"), ("Conservation of energy", "ke-conserved-rotation"),
               ("τ = Iα", "wrong-law", "τ = Iα needs a known constant torque, and this isn't that."), ("Conservation of linear momentum", "linear-vs-angular")]
    return prompt, right, [c for c in choices if c[0] != right], why


pool("p05", "2016-32", "ang", "F30", [
    spin("A diver tucks in mid-air and spins faster. Most direct principle for the new spin rate?", "Conservation of angular momentum", "No external torque acts about the centre of mass, so Iω is constant."),
    spin("Clay drops onto a spinning disc and sticks. Most direct principle for the new spin rate?", "Conservation of angular momentum", "The sticking is internal, and KE is lost."),
    spin("A solid cylinder rolls down a slope from rest. Most direct principle for its speed at the bottom?", "Conservation of energy", "PE lost becomes translational and rotational KE."),
    spin("A wheel falls, unwinding a string round its axle. Most direct principle for its speed after a known drop?", "Conservation of energy", "PE lost becomes both kinds of KE, and the string does no net work."),
    spin("A constant torque spins up a flywheel from rest. Most direct principle for its angular speed after a known time?", "τ = Iα", "Constant torque gives constant α, so ω = αt."),
    spin("A constant friction torque slows a wheel. Most direct principle for the time it takes to stop?", "τ = Iα", "Constant torque gives constant α, so t = ω/α."),
])

# ---------- L4 templates ----------
template("t01", "2022-2", "vec", "F40", "Forces of {F1} N and {F2} N act at one point. Which can be the size of their resultant?",
         {"F1": {"set": list(range(6, 31)), "unit": "N"}, "F2": {"set": list(range(2, 29)), "unit": "N"}},
         {"expr": "lo + (3*F1 + F2) % (hi - lo + 1)", "unit": "N", "dim_skip": True},
         ["res_min(F1, F2) <= answer <= res_max(F1, F2)", "hi + 2 > res_max(F1, F2)", "lo - 2 < res_min(F1, F2)"],
         [("boundary", "hi + 2"), ("boundary", "hi + 4"), ("boundary", "hi + 7"), ("boundary", "lo - 2"), ("boundary", "lo - 4"), ("boundary", "lo - 7")],
         "The resultant lies between the difference and the sum of the two forces.",
         derived={"lo": "F1 - F2", "hi": "F1 + F2"}, constraints=["lo >= 3"], exclude=["(F1, F2) in ((11, 5), (9, 6))"], shared_tags=True, constants={})
template("t02", "2021-48", "thr", "F40", "A ball thrown straight up from the ground passes a point {h} m high twice, {dt} s apart. Launch speed?",
         {"h": {"set": list(range(5, 205, 5)), "unit": "m"}, "dt": {"set": [1, 2, 3, 4, 5, 6, 7, 8], "unit": "s"}},
         {"expr": "sqrt(v_h**2 + 2*g*h)", "unit": "m s⁻¹", "dim": "m s^-1"},
         ["(answer + sqrt(answer**2 - 2*g*h))/g - (answer - sqrt(answer**2 - 2*g*h))/g == dt"],
         [("stopped-early", "v_h", "That's the speed at that height, not at launch."), ("misread-interval", "g*dt", "Only half the gap is spent rising from that height."),
          ("ignored-condition", "sqrt(2*g*h)", "That assumes the ball stops at that height, but it's still moving there."), ("forgot-square", "v_h + sqrt(2*g*h)"),
          ("sign", "sqrt(abs(2*g*h - v_h**2))"), ("wrong-law", "h/dt", "Height ÷ gap isn't the speed at any point here.")],
         "Half the gap gives the speed at that height, v = gt. Then u² = v² + 2gh.",
         derived={"v_h": "g*dt/2"}, constraints=["answer == int(answer)", "answer % 5 == 0"], exclude=["(h, dt) == (25, 4)"])
template("t03", "2020-4", "avg", "F44", "The graph shows the velocity of an object moving in a straight line. Average velocity over the whole motion?",
         {"v1": {"set": [2, 3, 4, 5, 6, 8], "unit": "m s^-1"}, "t1": {"set": [1, 2, 3, 4, 5], "unit": "s"},
          "v2": {"set": [1, 2, 3, 4], "unit": "m s^-1"}, "t2": {"set": [1, 2, 3, 4, 5], "unit": "s"}},
         {"expr": "(v1*t1 + v2*t2)/(t1 + t2)", "unit": "m s⁻¹", "dim": "m s^-1"},
         ["answer == step_average(v1, t1, v2, t2)"],
         [("mean-of-speeds", "(v1 + v2)/2"), ("misread-interval", "(v1*t1 + v2*t2)/t1", "Divide by the total time, not the first part."),
          ("wrong-law", "(v1*t1 + v2*t2)/2", "Divide by the total time, not by the number of stages."), ("stopped-early", "v1*t1 + v2*t2", "That's the displacement. Now divide by the total time."),
          ("wrong-quantity", "v2", "That's only the final velocity."), ("ignored-condition", "v1", "The object doesn't stay at its first velocity.")],
         "Average velocity = total area under the graph ÷ total time.",
         constraints=["v1 > v2", "t1 != t2", "nice(answer, 1)"], exclude=["(v1, t1, v2, t2) == (3, 3, 1, 1)"],
         figure={"engine": "vt-steps", "params": {"v1": "v1", "t1": "t1", "v2": "v2", "t2": "t2"}})
template("t04", "2025-17", "lift", "F40", "A lift is moving {motion}. Its speed changes by {dv} m s⁻¹ in {t} s. Force from the floor on a {m} kg block?",
         {"motion": {"set": ["down, speeding up", "down, slowing to a stop", "up, speeding up", "up, slowing to a stop"]},
          "m": {"set": [2, 5, 40, 50, 60], "unit": "kg"}, "dv": {"set": [2, 4, 6, 8], "unit": "m s^-1"}, "t": {"set": [2, 4], "unit": "s"}},
         {"expr": "m*(g + s_up*a)", "unit": "N", "dim": "N"},
         ["m*g - answer == m*(v_after - v_before)/t"],
         [("ignored-condition", "m*g", "The lift is accelerating, so the floor force isn't mg."), ("motion-vs-accel", "m*(g - s_up*a)"),
          ("wrong-law", "m*a", "The floor also holds up the weight, so ma alone isn't enough."), ("forgot-mass", "g + s_up*a"),
          ("wrong-quantity", "m*(g + s_up*dv)", "Δv isn't the acceleration. Divide by the time first.")],
         "Find the direction of the acceleration first. Then N = m(g + a) if it points up, or m(g − a) if it points down.",
         derived={"a": "dv/t", "s_up": "{'down, speeding up': -1, 'down, slowing to a stop': 1, 'up, speeding up': 1, 'up, slowing to a stop': -1}[motion]",
                  "v_before": "{'down, speeding up': 0*dv, 'down, slowing to a stop': dv, 'up, speeding up': 0*dv, 'up, slowing to a stop': -1*dv}[motion]",
                  "v_after": "{'down, speeding up': dv, 'down, slowing to a stop': 0*dv, 'up, speeding up': -1*dv, 'up, slowing to a stop': 0*dv}[motion]"},
         exclude=["(m, dv / t) == (1, 1)"])
template("t05", "2018-14", "stop", "F40", "A block sliding at {v} m s⁻¹ on a rough level floor comes to rest. μ = {mu}. Distance moved?",
         {"v": {"set": [2, 3, 4, 5, 6, 8, 10, 12, 14, 15, 16, 18, 20], "unit": "m s^-1"}, "mu": {"set": [0.1, 0.2, 0.25, 0.4, 0.5], "unit": "1"}},
         {"expr": "v**2/(2*mu*g)", "unit": "m", "dim": "m"},
         ["mu*m*g*answer == m*v**2/2"],
         [("forgot-half", "v**2/(mu*g)"), ("forgot-mu", "v**2/(2*g)"), ("forgot-square", "v/(2*mu*g)"), ("inverted", "mu*v**2/(2*g)"), ("forgot-g", "v**2/(2*mu)"),
          ("wrong-law", "2*v**2/(mu*g)", "½mv² = μmgs puts the 2 below the line, not above it.")],
         "Work done by friction = loss of KE: μmgs = ½mv², so s = v²/(2μg).",
         verify_given={"m": 3}, constraints=["answer <= 100"])
template("t06", "2025-12", "grip", "F40", "A car with all wheels driven reaches {kmh} km h⁻¹ from rest in {t} s on a level road, at uniform acceleration. Smallest μₛ needed?",
         {"kmh": {"set": [18, 36, 54, 72, 90, 108, 126, 144], "unit": "m s^-1"}, "t": {"set": list(range(2, 21)), "unit": "s"}},
         {"expr": "v/(t*g)", "unit": "", "dim": "1"},
         ["answer*m*g/m*t == v"],
         [("unit-conversion", "kmh/(t*g)"), ("assumed-symmetry", "2*v/(t*g)"), ("forgot-half", "v/(2*t*g)"), ("forgot-g", "v/t"), ("inverted", "v/(3.6*t*g)")],
         "Friction gives the acceleration: μₛmg = ma, so μₛ = a/g, with the speed in m s⁻¹.",
         derived={"v": "kmh/3.6"}, verify_given={"m": 3}, constraints=["answer <= 1", "nice(answer, 2)"], exclude=["(kmh, t) == (72, 5)"])
template("t07", "2021-6", "mom", "F40", "A {m1} kg cart at {u1} m s⁻¹ catches a {m2} kg cart moving the same way at {u2} m s⁻¹. They couple. Common speed?",
         {"m1": {"set": [1, 2, 3, 4, 5, 6], "unit": "kg"}, "m2": {"set": [1, 2, 3, 4, 5, 6], "unit": "kg"},
          "u1": {"set": [4, 6, 8, 10], "unit": "m s^-1"}, "u2": {"set": [1, 2, 3], "unit": "m s^-1"}},
         {"expr": "(m1*u1 + m2*u2)/(m1 + m2)", "unit": "m s⁻¹", "dim": "m s^-1"},
         ["(m1 + m2)*answer == m1*u1 + m2*u2", "(m1 + m2)*answer**2 <= m1*u1**2 + m2*u2**2"],
         [("mean-of-speeds", "(u1 + u2)/2"), ("sign", "(m1*u1 - m2*u2)/(m1 + m2)"), ("forgot-mass", "(m1*u1 + m2*u2)/m1"),
          ("ke-conserved-inelastic", "sqrt((m1*u1**2 + m2*u2**2)/(m1 + m2))"), ("stopped-early", "m1*u1 + m2*u2", "That's the total momentum. Now divide by the total mass."),
          ("forgot-mass", "(m1*u1 + m2*u2)/m2")],
         "Momentum is conserved: m₁u₁ + m₂u₂ = (m₁ + m₂)v.",
         constraints=["m1 != m2", "nice(answer, 1)"])
template("t08", "2022-18", "imp", "F44", "The graph shows the force on a {m} kg body, at rest at first on a smooth surface. Final speed?",
         {"F": {"set": [4, 6, 8, 12], "unit": "N"}, "t1": {"set": [1, 2, 3, 4], "unit": "s"}, "t2": {"set": [1, 2, 3, 4, 5], "unit": "s"}, "m": {"set": [2, 4, 5], "unit": "kg"}},
         {"expr": "F*(t1/2 + t2)/m", "unit": "m s⁻¹", "dim": "m s^-1"},
         ["answer*m == ramp_area(F, t1, t2)"],
         [("area-shape", "F*(t1 + t2)/m"), ("misread-interval", "F*t2/m", "The rising part adds area too."), ("forgot-mass", "F*(t1/2 + t2)"), ("inverted", "F*(t1/2 + t2)*m"),
          ("stopped-early", "F*t1/(2*m)", "That's only the rising part. Add the flat part."), ("wrong-quantity", "F/m", "That's the acceleration at full force, not the final speed.")],
         "Impulse = area under the graph = change in momentum.",
         constraints=["nice(answer, 1)"], figure={"engine": "ft-ramp", "params": {"F": "F", "t1": "t1", "t2": "t2"}}, constants={})
template("t09", "2023-17", "proj", "F40", "A ball is thrown at {angle}° to the horizontal with {K} J of KE. {ask} (No air resistance)",
         {"angle": {"set": [30, 60], "unit": "1"}, "K": {"set": [40, 80, 100, 120, 160, 200, 240, 400], "unit": "J"},
          "ask": {"set": ["KE at the top of its path?", "PE gained by the top of its path?"]}},
         {"expr": "K*(c2 if ask.startswith('KE') else s2)", "unit": "J", "dim": "J", "dim_skip": True},
         ["approx(answer, K*(cos(radians(angle))**2 if ask.startswith('KE') else sin(radians(angle))**2))", "K - K*c2 == K*s2"],
         [("sin-cos-swap", "K*(s2 if ask.startswith('KE') else c2)"), ("forgot-square", "K*cos(radians(angle))"),
          ("ignored-condition", "K", "The vertical speed is lost by the top, so it isn't all of K."), ("v-zero-at-top", "0"), ("ke-half-at-top", "K/2"), ("wrong-power", "K/4")],
         "At the top, only u cos θ remains, so KE = K cos²θ and the PE gained is K sin²θ.",
         derived={"c2": "{30: 3/4, 60: 1/4}[angle]", "s2": "{30: 1/4, 60: 3/4}[angle]"}, constants={})
template("t10", "2024-15", "circ", "F40", "A coin sits on a turntable spinning at {rpm} rpm. μₛ = {mu}. Largest distance from the centre without sliding? (Take π = 3)",
         {"mu": {"set": [0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.45, 0.5, 0.6, 0.8, 0.9], "unit": "1"}, "rpm": {"set": [30, 40, 50, 60, 80, 100, 120, 150], "unit": "s^-1"}},
         {"expr": "mu*g/w**2*100", "unit": "cm", "dim": "m"},
         ["w**2*(answer/100) == mu*g", "w**2*(1.1*answer/100) > mu*g"],
         [("forgot-square", "mu*g/w*100"), ("forgot-mu", "g/w**2*100"), ("radius-diameter", "2*mu*g/w**2*100"), ("radius-diameter", "mu*g/w**2*50"),
          ("wrong-power", "mu**2*g/w**2*100"), ("unit-conversion", "mu*g/w**2")],
         "At the limit, μmg = mrω², so r = μg/ω².",
         derived={"w": "rpm*2*pi/60"}, constraints=["2 <= answer <= 30", "nice(answer, 1)"], exclude=["(mu, rpm) == (0.36, 30)"], constants={"g": 10, "pi": 3})
template("t11", "2025-41", "beam", "F44", "The figure shows a uniform {M} kg beam on supports at P and Q, with a {m} kg person standing on it. Force from support Q?",
         {"L": {"set": [4, 5, 6, 8, 10], "unit": "m"}, "M": {"set": [40, 60, 80, 100], "unit": "kg"}, "m": {"set": [50, 60, 70], "unit": "kg"}, "d": {"set": [1, 2, 3, 4, 5, 6, 7], "unit": "m"}},
         {"expr": "(M*g*L/2 + m*g*d)/L", "unit": "N", "dim": "N"},
         ["((M + m)*g - answer)*L == M*g*L/2 + m*g*(L - d)"],
         [("ignored-condition", "m*g*d/L", "The beam's own weight also loads the supports."), ("swapped-support", "(M*g*L/2 + m*g*(L - d))/L"), ("assumed-symmetry", "(M + m)*g/2"), ("forgot-g", "(M*L/2 + m*d)/L"),
          ("wrong-quantity", "(M + m)*g", "That's the total of both support forces."), ("forgot-mass", "M*g/2"), ("stopped-early", "m*g", "That's the person's whole weight, but the supports share it.")],
         "Moments about P remove the force at P: Q × L = Mg × L/2 + mg × d.",
         constraints=["d < L", "2*d != L", "answer == int(answer)"], figure={"engine": "beam", "params": {"L": "L", "d": "d"}})
template("t12", "2023-45", "pow", "F40", "{article} {m} kg car needs {p0} kW to hold {v} m s⁻¹ on a level road. Power to hold the same speed up a slope with sin θ = {s}, same resistance?",
         {"m": {"set": [800, 1000, 1500], "unit": "kg"}, "v": {"set": [10, 15, 20, 25], "unit": "m s^-1"},
          "p0": {"set": [10, 12, 15, 18, 20, 24, 25, 30], "unit": "W"}, "s": {"set": [0.05, 0.1], "unit": "1"}},
         {"expr": "p0 + m*g*s*v/1000", "unit": "kW", "dim": "W"},
         ["(p0*1000/v + m*g*s)*v/1000 == answer"],
         [("ignored-condition", "m*g*s*v/1000", "The level-road resistance still acts on the slope."), ("no-resolve", "p0 + m*g*v/1000"), ("forgot-g", "p0 + m*s*v/1000"),
          ("wrong-quantity", "p0", "That's the power on the level road."), ("wrong-law", "p0*(1 + s)", "Add the power needed against gravity. Don't scale by the slope."),
          ("misread-interval", "2*p0 + m*g*s*v/1000", "Count the level-road power once.")],
         "Driving force = resistance + mg sin θ, and P = Fv.",
         derived={"article": "'An' if m == 800 else 'A'"})
template("t13", "2019-31", "bnc", "F41", "A ball is dropped from {h0} m. Each bounce cuts its speed by {pct}%. Height reached after {n} bounces?",
         {"pct": {"set": [10, 20, 25, 50], "unit": "1"}, "n": {"set": [3, 4], "unit": "1"}, "h0": {"set": [2, 3, 5], "unit": "m"}},
         {"expr": "h0*k**(2*n)", "unit": "m", "dim": "m", "display": "{h0} × ({k}){sup(2*n)} m"},
         ["answer == bounce_height(h0, k, n, g)"],
         [{"tag": "forgot-square", "expr": "h0*k**n", "display": "{h0} × ({k}){sup(n)} m"},
          {"tag": "stopped-early", "expr": "h0*k**2", "display": "{h0} × ({k}){sup(2)} m", "detail": "That's only one bounce."},
          {"tag": "wrong-power", "expr": "h0*k**(3*n)", "display": "{h0} × ({k}){sup(3*n)} m"},
          {"tag": "misread-interval", "expr": "h0*k**(n + 1)", "display": "{h0} × ({k}){sup(n + 1)} m", "detail": "Count two powers of k for each bounce."}],
         "Each bounce multiplies the speed by k, and height ∝ v², so each bounce multiplies the height by k².",
         derived={"k": "1 - pct/100"}, order="shuffle")
template("t14", "2016-32", "ang", "F40", "A student spins on a smooth turntable at {w0} rad s⁻¹ with I = {I0} kg m². Pulling in the weights makes I = {I1} kg m². New angular speed?",
         {"I0": {"set": [2, 3, 4, 5, 6, 8], "unit": "kg m^2"}, "I1": {"set": [1, 2, 3, 4], "unit": "kg m^2"}, "w0": {"set": [2, 3, 4, 5, 6, 10], "unit": "s^-1"}},
         {"expr": "I0*w0/I1", "unit": "rad s⁻¹", "dim": "s^-1"},
         ["I1*answer == I0*w0", "I1*answer**2 > I0*w0**2"],
         [("ignored-condition", "w0", "Pulling in the weights changes I, so ω must change."), ("inverted", "I1*w0/I0"), ("ke-conserved-rotation", "w0*sqrt(I0/I1)"), ("wrong-power", "w0*(I0/I1)**2"),
          ("stopped-early", "I0*w0", "That's the angular momentum. Now divide by the new I.")],
         "No external torque acts, so Iω is constant.",
         constraints=["I1 < I0", "nice(answer, 1)"], constants={})
template("t15", "2025-13", "roll", "F41", "A {shape} (I = {frac(c)} MR²) rolls without slipping. Find total KE ÷ {target} KE.",
         {"shape": {"set": ["solid sphere", "hollow sphere", "solid cylinder"]}, "target": {"set": ["rotational", "translational"]}},
         {"expr": "(1 + c)/c if target == 'rotational' else 1 + c", "unit": "", "dim": "1", "display": "{frac(value)}", "dim_skip": True},
         ["approx(answer, (M*v**2/2 + c*M*v**2/2)/(c*M*v**2/2 if target == 'rotational' else M*v**2/2))"],
         [{"tag": "wrong-quantity", "expr": "1 + c if target == 'rotational' else (1 + c)/c", "display": "{frac(value)}", "detail": "That's the other ratio. Check which KE goes below the line."},
          {"tag": "misread-interval", "expr": "1/c", "display": "{frac(value)}", "detail": "That's translational ÷ rotational, not total."},
          {"tag": "stopped-early", "expr": "c", "display": "{frac(value)}", "detail": "c is only the factor in I. Now build the ratio."},
          {"tag": "inverted", "expr": "c/(1 + c) if target == 'rotational' else 1/(1 + c)", "display": "{frac(value)}"}],
         "KE total = ½Mv²(1 + c), and rotational KE = ½Mv²c.",
         derived={"c": "{'solid sphere': Fraction(2, 5), 'hollow sphere': Fraction(2, 3), 'solid cylinder': Fraction(1, 2)}[shape]"},
         verify_given={"M": 2, "v": 3}, exclude=["(shape, target) == ('solid cylinder', 'rotational')"], constants={}, exact="fraction")


def bank(bid, source, skill, statements, why, conflicts=()):
    b = item_base(f"phy.mech.{bid}", "L4", "F42", skill, source, SOURCE_DIFFICULTY[source])
    b.update(statements=[dict(text=text(t), true=truth, **({"tag": tag} if tag else {})) for t, truth, tag in statements],
             conflicts=[list(c) for c in conflicts], explanation=text(why))
    BANKS.append(b)


bank("b01", "2024-4", "n3", [
    ("The two forces of a pair are equal in size.", True, None),
    ("The two forces of a pair are of the same type.", True, None),
    ("Earth's pull on a book and the book's pull on Earth form a pair.", True, None),
    ("The two forces of a pair act on different bodies.", True, None),
    ("The two forces of a pair cancel each other.", False, "pair-cancels"),
    ("A pair of forces can exist only between bodies in contact.", False, "pair-contact-only"),
    ("The reaction appears slightly after the action.", False, "pair-delay"),
    ("A table's push on a book and the book's weight form a pair.", False, "balance-vs-pair"),
], "The two forces of a pair are equal, simultaneous, of one type, and act on different bodies.",
    conflicts=[(3, 4), (2, 7)])
bank("b02", "2021-15", "moi", [
    ("Moment of inertia depends on the axis chosen.", True, None),
    ("Doubling every mass, at the same positions, doubles the moment of inertia.", True, None),
    ("Moving mass further from the axis increases the moment of inertia.", True, None),
    ("About the central axis, a ring has a larger moment of inertia than a disc of equal mass and radius.", True, None),
    ("Moment of inertia increases when the body spins faster.", False, "moi-depends-on-omega"),
    ("Moment of inertia has the same value about every axis.", False, "moi-axis-free"),
    ("Two bodies of equal mass always have equal moments of inertia.", False, "moi-mass-only"),
    ("The SI unit of moment of inertia is kg m.", False, "wrong-power"),
], "I = Σmr² depends on the masses and their distances from the axis, not on how fast the body spins.",
    conflicts=[(0, 5), (3, 6), (1, 6)])

data = dict(
    spec_version=SPEC_VERSION, status="draft, not teacher reviewed", medium="en",
    skills=[dict(id=i, name=n, name_si=text(n)["si"], type=t) for i, n, t in SKILLS.values()],
    cards=CARDS, pools=POOLS, templates=TEMPLATES, banks=BANKS,
)
if MISSING:
    raise SystemExit("no Sinhala for:\n" + "\n".join(sorted(MISSING)))
(HERE / "items.json").write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
print(f"wrote {len(CARDS)} cards, {len(POOLS)} scenarios, {len(TEMPLATES)} templates, {len(BANKS)} banks")
