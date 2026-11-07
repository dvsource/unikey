"""Build the A/L Physics Mechanics skill graph (Unit 2) and its past-paper mapping.

Source of the graph: NIE syllabus (2017) Unit 2, competency levels 2.1-2.8, and the
NIE Grade 12 resource book (Units 1-2). Past papers are mapped onto the graph
afterwards; they never add skills.

Run:  python3 content/skills/mechanics/author.py [--db ~/Work/ALPhysics/db/alphysics.db]
Writes: graph.json, question-map.json, sample-crosswalk.json, coverage.md, skills.md
Then: python3 content/skills/mechanics/validate.py
"""
import argparse
import json
import os
import sqlite3
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SAMPLE = os.path.join(REPO, "content", "samples", "mechanics-20", "items.json")
DEFAULT_DB = os.path.expanduser("~/Work/ALPhysics/db/alphysics.db")

REAL_PAPERS = [str(y) for y in range(2016, 2026)]  # not predict-2026, not model-*
SPEC_VERSION = "0.5"

# NIE competency levels (syllabus Unit 2) and their periods.
TOPICS = {
    "2.1": ("Kinematics: one- and two-dimensional motion", 15),
    "2.2": ("Resultant force, moment of a force and centre of gravity", 15),
    "2.3": ("Newton's laws of motion", 20),
    "2.4": ("Equilibrium of forces", 10),
    "2.5": ("Work, energy and power", 15),
    "2.6": ("Rotational motion and circular motion", 15),
    "2.7": ("Hydrostatics", 12),
    "2.8": ("Fluid dynamics", 8),
}

# Shared maths layer (targets of uses-math edges).
MATH = {
    "math.trig.ratios": "sin, cos, tan and the special angles 30°, 45°, 60°",
    "math.trig.cosine-rule": "Cosine rule / parallelogram rule for two vectors",
    "math.algebra.rearrange": "Rearranging a formula for one variable",
    "math.algebra.simultaneous": "Solving two simultaneous linear equations",
    "math.algebra.quadratic": "Solving or reasoning with a quadratic",
    "math.algebra.proportion": "Ratio, proportion and scaling",
    "math.graph.gradient": "Gradient of a straight line or tangent",
    "math.graph.area": "Area under a graph from simple shapes",
    "math.geometry.mensuration": "Areas and volumes of circles, cylinders, spheres",
    "math.geometry.perpendicular": "Perpendicular distance, angles and similar triangles",
    "math.angle.radian": "Radian measure, rpm and revolutions",
}

# Skills outside Unit 2 that Mechanics skills require. Stubs only: Unit 1 owns them.
EXTERNAL = {
    "phy.meas.vec.scalar-vector": ("Scalars and vectors", "1.5"),
    "phy.meas.vec.addition": ("Adding vectors (triangle and parallelogram)", "1.5"),
}

# id, name, competency level, sub-topic (NIE content heading), type, est_minutes, math deps
R, C, P, M = "recall", "conceptual", "procedural", "method-selection"
SKILLS = [
    # 2.1 Kinematics
    ("phy.mech.kin.motion-quantities", "Displacement, velocity and acceleration", "2.1", "Kinematics", C, 15, []),
    ("phy.mech.kin.average-velocity", "Average velocity", "2.1", "Kinematics", P, 15, ["math.algebra.rearrange"]),
    ("phy.mech.kin.relative-velocity", "Relative velocity on parallel paths", "2.1", "Relative motion", P, 20, ["math.algebra.rearrange"]),
    ("phy.mech.kin.graph-slope-area", "Gradient and area of motion graphs", "2.1", "Graphs of motion", C, 20, ["math.graph.gradient", "math.graph.area"]),
    ("phy.mech.kin.graph-convert", "Converting between s–t, v–t and a–t graphs", "2.1", "Graphs of motion", P, 25, ["math.graph.gradient", "math.graph.area"]),
    ("phy.mech.kin.suvat", "Equations of motion for constant acceleration", "2.1", "Equations of motion", P, 25, ["math.algebra.rearrange", "math.algebra.quadratic"]),
    ("phy.mech.kin.vertical-throw", "Vertical throw symmetry", "2.1", "Equations of motion", P, 20, ["math.algebra.quadratic"]),
    ("phy.mech.kin.smooth-incline", "Motion down a smooth inclined plane", "2.1", "Equations of motion", P, 15, ["math.trig.ratios"]),
    ("phy.mech.proj.components", "Projectile velocity components", "2.1", "Projectile motion", P, 20, ["math.trig.ratios"]),
    ("phy.mech.proj.horizontal-launch", "Horizontal launch from a height", "2.1", "Projectile motion", P, 20, ["math.algebra.rearrange"]),
    ("phy.mech.proj.angled-launch", "Time of flight, maximum height and range", "2.1", "Projectile motion", P, 25, ["math.trig.ratios", "math.algebra.rearrange"]),
    ("phy.mech.proj.ke-at-top", "Kinetic energy at the top of a projectile path", "2.1", "Projectile motion", P, 15, ["math.trig.ratios"]),
    # 2.2 Resultant, moments, centre of gravity
    ("phy.mech.vec.resolve", "Resolving a force into components", "2.2", "Resultant of forces", P, 20, ["math.trig.ratios"]),
    ("phy.mech.vec.resultant-two", "Resultant of two forces (parallelogram law)", "2.2", "Resultant of forces", P, 20, ["math.trig.cosine-rule"]),
    ("phy.mech.vec.resultant-range", "Range of a resultant force", "2.2", "Resultant of forces", P, 10, []),
    ("phy.mech.vec.resultant-system", "Resultant of a system of coplanar forces", "2.2", "Resultant of forces", P, 25, ["math.trig.ratios"]),
    ("phy.mech.moment.moment-of-force", "Moment of a force about a point", "2.2", "Moment of a force", P, 15, ["math.geometry.perpendicular"]),
    ("phy.mech.moment.couple", "Moment of a couple", "2.2", "Moment of a force", C, 10, ["math.geometry.perpendicular"]),
    ("phy.mech.moment.parallel-resultant", "Resultant and line of action of parallel forces", "2.2", "Moment of a force", P, 20, ["math.algebra.rearrange"]),
    ("phy.mech.cg.regular-bodies", "Centre of gravity of regular bodies and by suspension", "2.2", "Centre of gravity", C, 15, []),
    ("phy.mech.cg.composite-bodies", "Centre of gravity of compound bodies and bodies with parts removed", "2.2", "Centre of gravity", P, 25, ["math.geometry.mensuration", "math.algebra.proportion"]),
    ("phy.mech.cg.force-through-cm", "Force through or away from the centre of mass", "2.2", "Centre of gravity", C, 10, []),
    # 2.3 Newton's laws
    ("phy.mech.newton.inertia-first-law", "Inertia, mass and Newton's first law", "2.3", "Force and motion", C, 15, []),
    ("phy.mech.newton.free-body", "Free-body force diagrams", "2.3", "Free body force diagrams", P, 20, []),
    ("phy.mech.newton.second-law", "Newton's second law for one body", "2.3", "Force and motion", P, 20, ["math.algebra.rearrange"]),
    ("phy.mech.newton.n3-pairs", "Newton's third-law pairs", "2.3", "Force and motion", C, 15, []),
    ("phy.mech.newton.contact-forces", "Self-adjusting forces: tension, normal reaction, thrust", "2.3", "Self adjusting forces", C, 15, []),
    ("phy.mech.newton.connected-bodies", "Connected bodies: pulleys, strings and blocks in contact", "2.3", "Applications of Newton's laws", P, 30, ["math.algebra.simultaneous"]),
    ("phy.mech.newton.apparent-weight", "Apparent weight in a lift", "2.3", "Applications of Newton's laws", P, 15, []),
    ("phy.mech.fric.friction-states", "Static, limiting and dynamic friction", "2.3", "Frictional forces", C, 15, []),
    ("phy.mech.fric.friction-force", "Limiting and dynamic friction force (μR)", "2.3", "Frictional forces", P, 20, ["math.trig.ratios"]),
    ("phy.mech.fric.stopping-distance", "Stopping distance under friction", "2.3", "Frictional forces", P, 15, ["math.algebra.rearrange"]),
    ("phy.mech.fric.traction-limit", "Friction limit on acceleration", "2.3", "Frictional forces", P, 15, []),
    ("phy.mech.fric.rough-incline", "Block on a rough inclined plane", "2.3", "Frictional forces", P, 25, ["math.trig.ratios"]),
    ("phy.mech.mom.linear-momentum", "Linear momentum and force as rate of change of momentum", "2.3", "Momentum", P, 15, []),
    ("phy.mech.imp.impulse", "Impulse and impulsive forces", "2.3", "Impulse", P, 15, ["math.algebra.rearrange"]),
    ("phy.mech.imp.graph-area", "Impulse from a force–time graph", "2.3", "Impulse", P, 15, ["math.graph.area"]),
    ("phy.mech.mom.conservation", "Conservation of linear momentum in one dimension", "2.3", "Momentum", P, 20, ["math.algebra.rearrange"]),
    ("phy.mech.mom.explosions", "Explosions and fragments, including in flight", "2.3", "Momentum", P, 20, []),
    ("phy.mech.mom.elastic-inelastic", "Elastic and inelastic collisions", "2.3", "Momentum", P, 20, ["math.algebra.simultaneous"]),
    ("phy.mech.mom.momentum-vs-energy", "Momentum or energy conservation", "2.3", "Momentum", M, 20, []),
    # 2.4 Equilibrium
    ("phy.mech.eq.conditions", "Conditions for equilibrium", "2.4", "Conditions for equilibrium", C, 15, []),
    ("phy.mech.eq.concurrent-forces", "Three non-parallel forces and the triangle of forces", "2.4", "Equilibrium of coplanar forces", P, 25, ["math.trig.ratios", "math.geometry.perpendicular"]),
    ("phy.mech.eq.resolve-forces", "Equilibrium by resolving forces", "2.4", "Equilibrium of coplanar forces", P, 25, ["math.trig.ratios", "math.algebra.simultaneous"]),
    ("phy.mech.eq.moment-balance", "Moment balance on a beam", "2.4", "Principle of moments", P, 25, ["math.algebra.simultaneous"]),
    ("phy.mech.eq.stability", "Stable, unstable and neutral equilibrium", "2.4", "States of equilibrium", C, 10, []),
    # 2.5 Work, energy, power
    ("phy.mech.work.work-done", "Work done by a force, and its sign", "2.5", "Work", P, 15, ["math.trig.ratios"]),
    ("phy.mech.energy.ke-pe", "Kinetic and gravitational potential energy", "2.5", "Mechanical energy", P, 15, []),
    ("phy.mech.energy.elastic-pe", "Elastic potential energy", "2.5", "Mechanical energy", P, 15, ["math.graph.area"]),
    ("phy.mech.energy.work-energy", "Work–energy principle with friction", "2.5", "Work-energy principle", P, 25, ["math.algebra.rearrange"]),
    ("phy.mech.energy.mech-conservation", "Conservation of mechanical energy", "2.5", "Conservation of energy", P, 20, ["math.algebra.rearrange"]),
    ("phy.mech.energy.bounce-height", "Rebound height and speed", "2.5", "Conservation of energy", P, 15, ["math.algebra.proportion"]),
    ("phy.mech.pow.power-efficiency", "Power and efficiency", "2.5", "Power and efficiency", P, 15, ["math.algebra.proportion"]),
    ("phy.mech.pow.force-speed", "Power, force and speed", "2.5", "Power and efficiency", P, 15, []),
    # 2.6 Rotational and circular motion
    ("phy.mech.rot.angular-quantities", "Angular displacement, velocity, acceleration, period and rpm", "2.6", "Rotational motion", P, 15, ["math.angle.radian"]),
    ("phy.mech.rot.linear-angular", "Linking linear and angular quantities (v = rω)", "2.6", "Rotational motion", P, 15, []),
    ("phy.mech.rot.rotational-suvat", "Equations of rotational motion", "2.6", "Rotational motion", P, 20, ["math.angle.radian"]),
    ("phy.mech.rot.moi-standard", "Moment of inertia of a point mass and standard bodies", "2.6", "Moment of inertia", P, 15, []),
    ("phy.mech.rot.moi-factors", "What moment of inertia depends on", "2.6", "Moment of inertia", C, 15, []),
    ("phy.mech.rot.torque-alpha", "Torque and angular acceleration (τ = Iα)", "2.6", "Torque", P, 25, ["math.algebra.simultaneous"]),
    ("phy.mech.rot.angular-momentum", "Angular momentum conservation", "2.6", "Angular momentum", P, 20, ["math.algebra.proportion"]),
    ("phy.mech.rot.rotational-ke-work", "Rotational kinetic energy, work and power", "2.6", "Rotational kinetic energy", P, 20, []),
    ("phy.mech.rot.rolling-energy", "Energy of a rolling body", "2.6", "Rotational kinetic energy", P, 20, []),
    ("phy.mech.rot.rolling-kinematics", "Velocity of points on a rolling wheel", "2.6", "Rotational motion", C, 15, []),
    ("phy.mech.circ.centripetal-accel", "Centripetal acceleration and change of velocity on a circle", "2.6", "Circular motion", P, 15, ["math.angle.radian"]),
    ("phy.mech.circ.centripetal-force", "Which force provides the centripetal force", "2.6", "Circular motion", C, 15, []),
    ("phy.mech.circ.friction-limit", "Friction limit in circular motion", "2.6", "Circular motion", P, 15, []),
    ("phy.mech.circ.inclined-forces", "Horizontal circles with inclined strings or surfaces", "2.6", "Circular motion", P, 25, ["math.trig.ratios"]),
    ("phy.mech.circ.vertical-tension", "Forces at the top and bottom of a vertical circle", "2.6", "Circular motion", P, 20, []),
    # 2.7 Hydrostatics
    ("phy.mech.hydro.pressure-depth", "Pressure at a depth and force on a surface", "2.7", "Hydrostatic pressure", P, 20, ["math.geometry.mensuration"]),
    ("phy.mech.hydro.compare-densities", "Comparing densities with a U-tube or Hare's apparatus", "2.7", "Hydrostatic pressure", P, 15, ["math.algebra.proportion"]),
    ("phy.mech.hydro.pascal", "Pascal's principle and hydraulic systems", "2.7", "Transmission of pressure", P, 15, ["math.algebra.proportion"]),
    ("phy.mech.hydro.upthrust", "Archimedes' principle and apparent weight in a fluid", "2.7", "Up thrust", P, 20, ["math.geometry.mensuration"]),
    ("phy.mech.hydro.floatation", "Condition for floating and fraction submerged", "2.7", "Floatation", P, 20, ["math.algebra.proportion"]),
    ("phy.mech.hydro.float-changes", "What changes when a floating system is rearranged", "2.7", "Floatation", C, 20, []),
    ("phy.mech.hydro.hydrometer", "Hydrometer and weighted test tube", "2.7", "Floatation", P, 15, ["math.algebra.proportion"]),
    ("phy.mech.hydro.buoyancy-motion", "Motion of a body under upthrust", "2.7", "Up thrust", P, 20, []),
    # 2.8 Fluid dynamics
    ("phy.mech.flow.streamline", "Streamline and turbulent flow", "2.8", "Streamline flow", C, 10, []),
    ("phy.mech.flow.continuity", "Equation of continuity", "2.8", "Equation of continuity", P, 15, ["math.geometry.mensuration"]),
    ("phy.mech.flow.bernoulli", "Bernoulli's principle in pipes", "2.8", "Bernoulli's principle", P, 25, ["math.algebra.rearrange"]),
    ("phy.mech.flow.bernoulli-applications", "Applications of Bernoulli's principle (lift, roofs, sprayers)", "2.8", "Bernoulli's principle", C, 15, []),
    ("phy.mech.flow.efflux", "Speed of efflux and siphons", "2.8", "Bernoulli's principle", P, 20, []),
    ("phy.mech.flow.jet-force", "Force exerted by a fluid jet", "2.8", "Equation of continuity", P, 15, []),
]

# Edges. requires/helps/encompasses are directed: (from, to).
#   requires:    `from` cannot be done without `to` (to is the prerequisite)
#   helps:       knowing `from` makes `to` easier
#   encompasses: practising `from` partly reviews `to`, with credit weight w
#   confusable:  undirected pair, interleave them
REQUIRES = {
    "phy.mech.kin.motion-quantities": ["phy.meas.vec.scalar-vector"],
    "phy.mech.kin.average-velocity": ["phy.mech.kin.motion-quantities"],
    "phy.mech.kin.relative-velocity": ["phy.mech.kin.motion-quantities"],
    "phy.mech.kin.graph-slope-area": ["phy.mech.kin.motion-quantities"],
    "phy.mech.kin.graph-convert": ["phy.mech.kin.graph-slope-area"],
    "phy.mech.kin.suvat": ["phy.mech.kin.motion-quantities"],
    "phy.mech.kin.vertical-throw": ["phy.mech.kin.suvat"],
    "phy.mech.kin.smooth-incline": ["phy.mech.kin.suvat", "phy.mech.vec.resolve"],
    "phy.mech.proj.components": ["phy.mech.kin.suvat", "phy.mech.vec.resolve"],
    "phy.mech.proj.horizontal-launch": ["phy.mech.proj.components"],
    "phy.mech.proj.angled-launch": ["phy.mech.proj.components"],
    "phy.mech.proj.ke-at-top": ["phy.mech.proj.components", "phy.mech.energy.ke-pe"],
    "phy.mech.vec.resolve": ["phy.meas.vec.addition"],
    "phy.mech.vec.resultant-two": ["phy.meas.vec.addition"],
    "phy.mech.vec.resultant-range": ["phy.mech.vec.resultant-two"],
    "phy.mech.vec.resultant-system": ["phy.mech.vec.resolve"],
    "phy.mech.moment.couple": ["phy.mech.moment.moment-of-force"],
    "phy.mech.moment.parallel-resultant": ["phy.mech.moment.moment-of-force"],
    "phy.mech.cg.composite-bodies": ["phy.mech.cg.regular-bodies", "phy.mech.moment.parallel-resultant"],
    "phy.mech.cg.force-through-cm": ["phy.mech.cg.regular-bodies"],
    "phy.mech.newton.inertia-first-law": ["phy.mech.kin.motion-quantities"],
    "phy.mech.newton.second-law": ["phy.mech.newton.free-body"],
    "phy.mech.newton.contact-forces": ["phy.mech.newton.free-body"],
    "phy.mech.newton.connected-bodies": ["phy.mech.newton.second-law", "phy.mech.newton.contact-forces"],
    "phy.mech.newton.apparent-weight": ["phy.mech.newton.second-law", "phy.mech.newton.contact-forces"],
    "phy.mech.fric.friction-states": ["phy.mech.newton.contact-forces"],
    "phy.mech.fric.friction-force": ["phy.mech.fric.friction-states", "phy.mech.newton.second-law"],
    "phy.mech.fric.stopping-distance": ["phy.mech.fric.friction-force"],
    "phy.mech.fric.traction-limit": ["phy.mech.fric.friction-force"],
    "phy.mech.fric.rough-incline": ["phy.mech.fric.friction-force", "phy.mech.vec.resolve"],
    "phy.mech.mom.linear-momentum": ["phy.mech.kin.motion-quantities"],
    "phy.mech.imp.impulse": ["phy.mech.mom.linear-momentum"],
    "phy.mech.imp.graph-area": ["phy.mech.imp.impulse", "phy.mech.kin.graph-slope-area"],
    "phy.mech.mom.conservation": ["phy.mech.mom.linear-momentum"],
    "phy.mech.mom.explosions": ["phy.mech.mom.conservation"],
    "phy.mech.mom.elastic-inelastic": ["phy.mech.mom.conservation", "phy.mech.energy.ke-pe"],
    "phy.mech.mom.momentum-vs-energy": ["phy.mech.mom.elastic-inelastic", "phy.mech.energy.mech-conservation"],
    "phy.mech.eq.conditions": ["phy.mech.vec.resultant-system", "phy.mech.moment.moment-of-force"],
    "phy.mech.eq.concurrent-forces": ["phy.mech.eq.conditions", "phy.mech.vec.resultant-two"],
    "phy.mech.eq.resolve-forces": ["phy.mech.eq.conditions"],
    "phy.mech.eq.moment-balance": ["phy.mech.moment.moment-of-force"],
    "phy.mech.eq.stability": ["phy.mech.cg.regular-bodies"],
    "phy.mech.work.work-done": ["phy.mech.kin.motion-quantities"],
    "phy.mech.energy.elastic-pe": ["phy.mech.work.work-done"],
    "phy.mech.energy.work-energy": ["phy.mech.energy.ke-pe"],
    "phy.mech.energy.mech-conservation": ["phy.mech.energy.ke-pe"],
    "phy.mech.energy.bounce-height": ["phy.mech.energy.mech-conservation"],
    "phy.mech.pow.power-efficiency": ["phy.mech.work.work-done"],
    "phy.mech.pow.force-speed": ["phy.mech.pow.power-efficiency", "phy.mech.newton.second-law"],
    "phy.mech.rot.angular-quantities": ["phy.mech.kin.motion-quantities"],
    "phy.mech.rot.linear-angular": ["phy.mech.rot.angular-quantities"],
    "phy.mech.rot.rotational-suvat": ["phy.mech.rot.angular-quantities", "phy.mech.kin.suvat"],
    "phy.mech.rot.moi-factors": ["phy.mech.rot.moi-standard"],
    "phy.mech.rot.torque-alpha": ["phy.mech.rot.moi-standard", "phy.mech.moment.moment-of-force", "phy.mech.rot.angular-quantities"],
    "phy.mech.rot.angular-momentum": ["phy.mech.rot.moi-standard", "phy.mech.rot.angular-quantities"],
    "phy.mech.rot.rotational-ke-work": ["phy.mech.rot.moi-standard", "phy.mech.energy.ke-pe"],
    "phy.mech.rot.rolling-energy": ["phy.mech.rot.rotational-ke-work", "phy.mech.rot.linear-angular"],
    "phy.mech.rot.rolling-kinematics": ["phy.mech.rot.linear-angular"],
    "phy.mech.circ.centripetal-accel": ["phy.mech.rot.linear-angular"],
    "phy.mech.circ.centripetal-force": ["phy.mech.circ.centripetal-accel", "phy.mech.newton.second-law"],
    "phy.mech.circ.friction-limit": ["phy.mech.circ.centripetal-force", "phy.mech.fric.friction-force"],
    "phy.mech.circ.inclined-forces": ["phy.mech.circ.centripetal-force", "phy.mech.vec.resolve"],
    "phy.mech.circ.vertical-tension": ["phy.mech.circ.centripetal-force"],
    "phy.mech.hydro.compare-densities": ["phy.mech.hydro.pressure-depth"],
    "phy.mech.hydro.pascal": ["phy.mech.hydro.pressure-depth"],
    "phy.mech.hydro.upthrust": ["phy.mech.hydro.pressure-depth"],
    "phy.mech.hydro.floatation": ["phy.mech.hydro.upthrust"],
    "phy.mech.hydro.float-changes": ["phy.mech.hydro.floatation"],
    "phy.mech.hydro.hydrometer": ["phy.mech.hydro.floatation"],
    "phy.mech.hydro.buoyancy-motion": ["phy.mech.hydro.upthrust", "phy.mech.newton.second-law"],
    "phy.mech.flow.continuity": ["phy.mech.flow.streamline"],
    "phy.mech.flow.bernoulli": ["phy.mech.flow.continuity", "phy.mech.hydro.pressure-depth", "phy.mech.energy.mech-conservation"],
    "phy.mech.flow.bernoulli-applications": ["phy.mech.flow.bernoulli"],
    "phy.mech.flow.efflux": ["phy.mech.flow.bernoulli"],
    "phy.mech.flow.jet-force": ["phy.mech.flow.continuity", "phy.mech.imp.impulse"],
}

HELPS = [
    ("phy.mech.kin.graph-slope-area", "phy.mech.kin.suvat"),          # suvat derived from the v–t graph
    ("phy.mech.vec.resolve", "phy.mech.moment.moment-of-force"),
    ("phy.mech.moment.parallel-resultant", "phy.mech.cg.regular-bodies"),
    ("phy.mech.newton.n3-pairs", "phy.mech.newton.free-body"),
    ("phy.mech.newton.second-law", "phy.mech.kin.smooth-incline"),
    ("phy.mech.mom.linear-momentum", "phy.mech.newton.second-law"),
    ("phy.mech.energy.work-energy", "phy.mech.fric.stopping-distance"),
    ("phy.mech.vec.resolve", "phy.mech.work.work-done"),
    ("phy.mech.vec.resultant-two", "phy.mech.mom.explosions"),
    ("phy.mech.vec.resultant-two", "phy.mech.circ.centripetal-accel"),
    ("phy.mech.mom.linear-momentum", "phy.mech.rot.angular-momentum"),
    ("phy.mech.newton.second-law", "phy.mech.rot.torque-alpha"),
    ("phy.mech.kin.graph-slope-area", "phy.mech.rot.rolling-kinematics"),
    ("phy.mech.proj.horizontal-launch", "phy.mech.flow.efflux"),
    ("phy.mech.hydro.pascal", "phy.mech.flow.efflux"),
    ("phy.mech.flow.streamline", "phy.mech.flow.bernoulli-applications"),
    ("phy.mech.cg.force-through-cm", "phy.mech.rot.torque-alpha"),
    ("phy.mech.moment.couple", "phy.mech.eq.conditions"),
    ("phy.mech.kin.relative-velocity", "phy.mech.kin.graph-convert"),
    ("phy.mech.newton.free-body", "phy.mech.hydro.upthrust"),
    ("phy.mech.hydro.floatation", "phy.mech.hydro.compare-densities"),
    # Former `requires` edges: useful first, but the skill can be done without them
    ("phy.mech.eq.conditions", "phy.mech.eq.moment-balance"),
    ("phy.mech.kin.vertical-throw", "phy.mech.proj.components"),
    ("phy.mech.energy.mech-conservation", "phy.mech.circ.vertical-tension"),
    ("phy.mech.newton.n3-pairs", "phy.mech.mom.conservation"),
    ("phy.mech.work.work-done", "phy.mech.energy.ke-pe"),
    ("phy.mech.newton.inertia-first-law", "phy.mech.newton.free-body"),
    ("phy.mech.kin.suvat", "phy.mech.fric.stopping-distance"),  # with work-energy above: either method works
    ("phy.mech.rot.linear-angular", "phy.mech.rot.angular-momentum"),  # L = mvr for a point mass
]

# (from, to, credit weight for implicit review, 0.3–0.7 per DR-0022)
ENCOMPASSES = [
    ("phy.mech.kin.graph-convert", "phy.mech.kin.graph-slope-area", 0.6),
    ("phy.mech.kin.vertical-throw", "phy.mech.kin.suvat", 0.5),
    ("phy.mech.proj.components", "phy.mech.kin.vertical-throw", 0.4),
    ("phy.mech.proj.horizontal-launch", "phy.mech.proj.components", 0.5),
    ("phy.mech.proj.angled-launch", "phy.mech.proj.components", 0.6),
    ("phy.mech.proj.ke-at-top", "phy.mech.proj.components", 0.4),
    ("phy.mech.vec.resultant-range", "phy.mech.vec.resultant-two", 0.3),
    ("phy.mech.vec.resultant-system", "phy.mech.vec.resolve", 0.6),
    ("phy.mech.cg.composite-bodies", "phy.mech.moment.parallel-resultant", 0.5),
    ("phy.mech.newton.connected-bodies", "phy.mech.newton.second-law", 0.6),
    ("phy.mech.newton.connected-bodies", "phy.mech.newton.free-body", 0.5),
    ("phy.mech.newton.apparent-weight", "phy.mech.newton.second-law", 0.4),
    ("phy.mech.fric.rough-incline", "phy.mech.fric.friction-force", 0.6),
    ("phy.mech.fric.rough-incline", "phy.mech.vec.resolve", 0.4),
    ("phy.mech.fric.stopping-distance", "phy.mech.fric.friction-force", 0.4),
    ("phy.mech.fric.traction-limit", "phy.mech.fric.friction-force", 0.4),
    ("phy.mech.imp.graph-area", "phy.mech.imp.impulse", 0.5),
    ("phy.mech.mom.conservation", "phy.mech.mom.linear-momentum", 0.5),
    ("phy.mech.mom.explosions", "phy.mech.mom.conservation", 0.5),
    ("phy.mech.mom.momentum-vs-energy", "phy.mech.mom.conservation", 0.5),
    ("phy.mech.mom.momentum-vs-energy", "phy.mech.mom.elastic-inelastic", 0.4),
    ("phy.mech.eq.moment-balance", "phy.mech.moment.moment-of-force", 0.6),
    ("phy.mech.eq.resolve-forces", "phy.mech.vec.resolve", 0.6),
    ("phy.mech.eq.concurrent-forces", "phy.mech.vec.resultant-two", 0.4),
    ("phy.mech.energy.work-energy", "phy.mech.work.work-done", 0.5),
    ("phy.mech.energy.mech-conservation", "phy.mech.energy.ke-pe", 0.5),
    ("phy.mech.energy.bounce-height", "phy.mech.energy.mech-conservation", 0.5),
    ("phy.mech.pow.force-speed", "phy.mech.pow.power-efficiency", 0.4),
    ("phy.mech.rot.torque-alpha", "phy.mech.rot.moi-standard", 0.4),
    ("phy.mech.rot.rolling-energy", "phy.mech.rot.rotational-ke-work", 0.6),
    ("phy.mech.rot.rotational-suvat", "phy.mech.rot.angular-quantities", 0.4),
    ("phy.mech.circ.centripetal-force", "phy.mech.circ.centripetal-accel", 0.5),
    ("phy.mech.circ.friction-limit", "phy.mech.circ.centripetal-force", 0.5),
    ("phy.mech.circ.inclined-forces", "phy.mech.circ.centripetal-force", 0.5),
    ("phy.mech.circ.vertical-tension", "phy.mech.circ.centripetal-force", 0.5),
    ("phy.mech.hydro.floatation", "phy.mech.hydro.upthrust", 0.5),
    ("phy.mech.hydro.buoyancy-motion", "phy.mech.hydro.upthrust", 0.5),
    ("phy.mech.flow.bernoulli", "phy.mech.flow.continuity", 0.5),
    ("phy.mech.flow.efflux", "phy.mech.flow.bernoulli", 0.4),
]

# (a, b, why) — the error tag from content-authoring §7 where one exists
CONFUSABLE = [
    ("phy.mech.kin.average-velocity", "phy.mech.kin.suvat", "mean-of-speeds"),
    ("phy.mech.newton.n3-pairs", "phy.mech.eq.conditions", "balance-vs-pair"),
    ("phy.mech.mom.conservation", "phy.mech.energy.mech-conservation", "wrong-conservation-law"),
    ("phy.mech.mom.conservation", "phy.mech.rot.angular-momentum", "linear-vs-angular"),
    ("phy.mech.energy.work-energy", "phy.mech.energy.mech-conservation", "friction does work, so mechanical energy is not conserved"),
    ("phy.mech.circ.friction-limit", "phy.mech.fric.traction-limit", "both are μg limits; one is centripetal, one is linear"),
    ("phy.mech.eq.moment-balance", "phy.mech.rot.torque-alpha", "zero net moment vs non-zero torque"),
    ("phy.mech.newton.second-law", "phy.mech.newton.inertia-first-law", "force-along-motion"),
    ("phy.mech.mom.elastic-inelastic", "phy.mech.mom.explosions", "ke-conserved-inelastic"),
]

# Past-paper mapping: uid -> (primary skill, [secondary skills], note)
# Candidate set: real papers 2016–2025 where the DB says unit 2, plus the unit-10 fluid
# subtopics that the NIE syllabus places in Unit 2 (2.7, 2.8).
QMAP = {
    # Centre of gravity & equilibrium
    "2016-29": ("phy.mech.eq.moment-balance", ["phy.mech.mom.linear-momentum"], ""),
    "2016-33": ("phy.mech.eq.concurrent-forces", ["phy.mech.cg.regular-bodies"], ""),
    "2017-3": ("phy.mech.cg.composite-bodies", [], ""),
    "2017-46": ("phy.mech.eq.conditions", ["phy.mech.newton.n3-pairs"], "two-force equilibrium"),
    "2018-15": ("phy.mech.cg.composite-bodies", [], ""),
    "2018-28": ("phy.mech.eq.moment-balance", [], ""),
    "2020-19": ("phy.mech.cg.composite-bodies", [], ""),
    "2021-24": ("phy.mech.cg.regular-bodies", [], "suspension method"),
    "2022-22": ("phy.mech.cg.composite-bodies", [], ""),
    "2023-22": ("phy.mech.cg.regular-bodies", [], ""),
    "2024-12": ("phy.mech.cg.composite-bodies", [], "part removed"),
    "2025-21": ("phy.mech.cg.regular-bodies", [], "CG outside the body"),
    "2025-41": ("phy.mech.eq.moment-balance", [], "source issue logged for option (2)"),
    # Circular motion
    "2019-50": ("phy.mech.circ.inclined-forces", ["phy.mech.circ.friction-limit"], ""),
    "2019-8": ("phy.mech.circ.centripetal-accel", ["phy.mech.vec.resultant-two"], "change of velocity"),
    "2022-25": ("phy.mech.circ.vertical-tension", ["phy.mech.energy.mech-conservation"], "vertical circle: check syllabus scope"),
    "2024-15": ("phy.mech.circ.friction-limit", ["phy.mech.rot.angular-quantities"], ""),
    "2024-41": ("phy.mech.circ.inclined-forces", ["phy.mech.vec.resolve"], ""),
    # Collisions & momentum
    "2016-15": ("phy.mech.mom.explosions", [], ""),
    "2019-36": ("phy.mech.mom.elastic-inelastic", ["phy.mech.mom.conservation"], ""),
    "2020-49": ("phy.mech.mom.momentum-vs-energy", ["phy.mech.energy.elastic-pe"], ""),
    "2021-4": ("phy.mech.mom.elastic-inelastic", [], ""),
    "2021-6": ("phy.mech.mom.conservation", [], ""),
    "2022-24": ("phy.mech.mom.explosions", ["phy.mech.proj.horizontal-launch"], ""),
    "2023-16": ("phy.mech.mom.conservation", [], ""),
    "2024-5": ("phy.mech.mom.elastic-inelastic", ["phy.mech.mom.conservation"], ""),
    "2025-45": ("phy.mech.mom.elastic-inelastic", ["phy.mech.mom.conservation"], ""),
    # Friction
    "2018-14": ("phy.mech.fric.stopping-distance", ["phy.mech.energy.work-energy"], ""),
    "2020-22": ("phy.mech.newton.connected-bodies", ["phy.mech.fric.friction-force"], ""),
    "2022-20": ("phy.mech.fric.friction-force", ["phy.mech.vec.resolve"], ""),
    "2023-44": ("phy.mech.fric.rough-incline", ["phy.mech.newton.connected-bodies"], ""),
    "2024-16": ("phy.mech.newton.connected-bodies", ["phy.mech.fric.friction-force"], ""),
    "2024-43": ("phy.mech.energy.work-energy", ["phy.mech.fric.rough-incline"], ""),
    "2024-50": ("phy.mech.eq.resolve-forces", ["phy.mech.fric.friction-force"], ""),
    "2025-12": ("phy.mech.fric.traction-limit", ["phy.mech.kin.suvat"], ""),
    # Impulse
    "2018-13": ("phy.mech.imp.impulse", [], ""),
    "2020-30": ("phy.mech.imp.graph-area", [], ""),
    "2022-18": ("phy.mech.imp.graph-area", [], ""),
    # Kinematics
    "2016-16": ("phy.mech.kin.graph-slope-area", [], ""),
    "2017-22": ("phy.mech.kin.graph-slope-area", ["phy.mech.kin.relative-velocity"], ""),
    "2018-16": ("phy.mech.kin.graph-slope-area", ["phy.mech.newton.second-law"], ""),
    "2019-40": ("phy.mech.kin.graph-slope-area", [], ""),
    "2020-4": ("phy.mech.kin.average-velocity", ["phy.mech.kin.graph-slope-area"], ""),
    "2021-12": ("phy.mech.kin.graph-convert", [], ""),
    "2021-48": ("phy.mech.kin.vertical-throw", [], ""),
    "2022-19": ("phy.mech.kin.graph-slope-area", [], ""),
    "2023-32": ("phy.mech.kin.graph-convert", ["phy.mech.energy.bounce-height"], ""),
    "2024-7": ("phy.mech.kin.graph-convert", [], ""),
    # Moment of inertia
    "2017-16": ("phy.mech.rot.moi-factors", [], ""),
    "2018-35": ("phy.mech.rot.moi-factors", [], ""),
    "2020-5": ("phy.mech.rot.moi-standard", [], ""),
    "2021-15": ("phy.mech.rot.moi-factors", [], ""),
    # Newton's laws
    "2016-47": ("phy.mech.newton.connected-bodies", ["phy.mech.newton.free-body"], ""),
    "2018-46": ("phy.mech.newton.contact-forces", ["phy.mech.newton.n3-pairs"], "tension in a rope"),
    "2021-18": ("phy.mech.newton.connected-bodies", [], ""),
    "2023-3": ("phy.mech.newton.n3-pairs", ["phy.mech.fric.friction-states"], ""),
    "2023-41": ("phy.mech.newton.contact-forces", ["phy.mech.newton.second-law"], "spring vs string at the instant of release"),
    "2024-4": ("phy.mech.newton.n3-pairs", [], ""),
    "2025-17": ("phy.mech.newton.apparent-weight", ["phy.mech.kin.graph-slope-area"], ""),
    # Projectiles
    "2017-50": ("phy.mech.proj.horizontal-launch", ["phy.mech.energy.mech-conservation"], ""),
    "2020-23": ("phy.mech.mom.explosions", ["phy.mech.proj.components"], ""),
    "2022-9": ("phy.mech.proj.components", [], ""),
    "2023-17": ("phy.mech.proj.ke-at-top", [], ""),
    "2024-3": ("phy.mech.proj.ke-at-top", [], ""),
    "2025-14": ("phy.mech.proj.horizontal-launch", [], ""),
    "2025-5": ("phy.mech.proj.components", [], ""),
    # Rotational dynamics
    "2016-30": ("phy.mech.rot.rolling-energy", [], ""),
    "2016-32": ("phy.mech.rot.angular-momentum", ["phy.mech.rot.rotational-ke-work"], ""),
    "2017-44": ("phy.mech.rot.rolling-kinematics", [], ""),
    "2018-34": ("phy.mech.rot.angular-momentum", [], ""),
    "2019-25": ("phy.mech.rot.angular-momentum", ["phy.mech.rot.linear-angular"], "L = mvr for an air mass"),
    "2021-38": ("phy.mech.rot.torque-alpha", ["phy.mech.rot.rotational-ke-work"], ""),
    "2022-35": ("phy.mech.rot.torque-alpha", ["phy.mech.rot.linear-angular"], ""),
    "2023-50": ("phy.mech.rot.torque-alpha", ["phy.mech.newton.connected-bodies"], ""),
    "2024-8": ("phy.mech.rot.torque-alpha", ["phy.mech.rot.rotational-suvat"], ""),
    "2025-13": ("phy.mech.rot.rolling-energy", [], ""),
    "2025-40": ("phy.mech.rot.angular-momentum", ["phy.mech.rot.moi-standard"], ""),
    # DB says Stokes' law; the question is a v–t shape from changing drag
    "2020-42": ("phy.mech.newton.second-law", ["phy.mech.kin.graph-slope-area"], "DB subtopic is Stokes' law (Unit 10); mapped to Unit 2"),
    # Vectors
    "2017-24": ("phy.mech.vec.resultant-system", [], ""),
    "2018-12": ("phy.mech.vec.resultant-system", [], ""),
    "2022-1": ("phy.meas.vec.scalar-vector", [], "Unit 1 (1.5): not a Mechanics skill"),
    "2022-2": ("phy.mech.vec.resultant-range", [], ""),
    "2023-4": ("phy.mech.vec.resultant-range", [], "displacements, not forces"),
    # Work, power & energy
    "2016-17": ("phy.mech.pow.power-efficiency", [], ""),
    "2016-50": ("phy.mech.energy.elastic-pe", ["phy.mech.energy.mech-conservation"], ""),
    "2017-23": ("phy.mech.pow.power-efficiency", ["phy.mech.work.work-done"], ""),
    "2019-31": ("phy.mech.energy.bounce-height", [], ""),
    "2019-9": ("phy.mech.work.work-done", [], ""),
    "2022-27": ("phy.mech.work.work-done", ["phy.mech.energy.work-energy"], ""),
    "2023-45": ("phy.mech.pow.force-speed", ["phy.mech.vec.resolve"], ""),
    # Fluids (DB unit 10, syllabus 2.7 / 2.8)
    "2017-25": ("phy.mech.flow.bernoulli", ["phy.mech.hydro.pressure-depth"], ""),
    "2018-33": ("phy.mech.flow.bernoulli", ["phy.mech.flow.continuity"], ""),
    "2019-39": ("phy.mech.flow.bernoulli", ["phy.mech.flow.continuity"], ""),
    "2020-41": ("phy.mech.flow.bernoulli", ["phy.mech.flow.continuity"], ""),
    "2021-16": ("phy.mech.flow.jet-force", [], ""),
    "2021-25": ("phy.mech.flow.bernoulli-applications", [], ""),
    "2022-34": ("phy.mech.flow.efflux", [], "siphon"),
    "2023-28": ("phy.mech.flow.bernoulli", ["phy.mech.flow.continuity"], ""),
    "2016-31": ("phy.mech.hydro.floatation", [], ""),
    "2017-12": ("phy.mech.hydro.float-changes", [], "also needs thermal expansion (Unit 4)"),
    "2017-13": ("phy.mech.hydro.floatation", ["phy.mech.hydro.upthrust"], ""),
    "2018-47": ("phy.mech.hydro.float-changes", [], ""),
    "2019-35": ("phy.mech.hydro.buoyancy-motion", ["phy.mech.kin.graph-slope-area"], "accelerating container"),
    "2019-38": ("phy.mech.hydro.float-changes", [], ""),
    "2020-26": ("phy.mech.hydro.upthrust", [], ""),
    "2021-21": ("phy.mech.hydro.floatation", [], ""),
    "2022-36": ("phy.mech.hydro.upthrust", ["phy.mech.hydro.floatation"], ""),
    "2024-30": ("phy.mech.hydro.buoyancy-motion", ["phy.mech.kin.vertical-throw"], ""),
    "2025-27": ("phy.mech.hydro.float-changes", [], ""),
    "2019-28": ("phy.mech.flow.continuity", [], ""),
    "2017-31": ("phy.mech.hydro.pascal", [], ""),
    "2018-29": ("phy.mech.hydro.pressure-depth", [], ""),
    "2020-20": ("phy.mech.hydro.compare-densities", [], ""),
    "2021-49": ("phy.mech.hydro.pressure-depth", [], "force on an inclined surface"),
    "2024-38": ("phy.mech.flow.efflux", ["phy.mech.proj.horizontal-launch"], ""),
    "2025-30": ("phy.mech.flow.efflux", ["phy.mech.hydro.pascal"], ""),
}

# The 18 draft skills in content/samples/mechanics-20 -> new graph.
# action: kept (same ID), renamed, or narrowed (sample ID kept, scope tightened).
CROSSWALK = {
    "phy.mech.vec.resultant-range": ("phy.mech.vec.resultant-range", "kept", ""),
    "phy.mech.kin.vertical-throw": ("phy.mech.kin.vertical-throw", "kept", ""),
    "phy.mech.kin.graph-slope-area": ("phy.mech.kin.graph-slope-area", "kept", "Graph-to-graph conversion is now its own skill, phy.mech.kin.graph-convert."),
    "phy.mech.kin.average-velocity": ("phy.mech.kin.average-velocity", "kept", ""),
    "phy.mech.newton.n3-pairs": ("phy.mech.newton.n3-pairs", "kept", "Sample renamed from phy.mech.n3-pairs on 2026-11-07 to add the topic segment."),
    "phy.mech.newton.apparent-weight": ("phy.mech.newton.apparent-weight", "kept", ""),
    "phy.mech.fric.stopping-distance": ("phy.mech.fric.stopping-distance", "kept", ""),
    "phy.mech.fric.traction-limit": ("phy.mech.fric.traction-limit", "kept", ""),
    "phy.mech.mom.momentum-vs-energy": ("phy.mech.mom.momentum-vs-energy", "kept", "Consider type method-selection: its L3 pool is the point of the skill."),
    "phy.mech.imp.graph-area": ("phy.mech.imp.graph-area", "kept", ""),
    "phy.mech.proj.components": ("phy.mech.proj.components", "narrowed", "KE at the top is now phy.mech.proj.ke-at-top; move template t13-style items there."),
    "phy.mech.circ.friction-limit": ("phy.mech.circ.friction-limit", "kept", ""),
    "phy.mech.eq.moment-balance": ("phy.mech.eq.moment-balance", "kept", ""),
    "phy.mech.pow.force-speed": ("phy.mech.pow.force-speed", "kept", ""),
    "phy.mech.energy.bounce-height": ("phy.mech.energy.bounce-height", "kept", ""),
    "phy.mech.rot.angular-momentum": ("phy.mech.rot.angular-momentum", "kept", ""),
    "phy.mech.rot.rolling-energy": ("phy.mech.rot.rolling-energy", "kept", ""),
    "phy.mech.rot.moi-factors": ("phy.mech.rot.moi-factors", "kept", ""),
}

SECONDARY_CREDIT = 0.5
WEIGHT_FLOOR = 0.1  # within a level, no syllabus skill gets less than 0.1 of the level's top skill
EXAM_BLEND = 0.5    # level weight = EXAM_BLEND × exam share + (1 − EXAM_BLEND) × period share
INFER_MIN_DEPENDENTS = 5  # untested skill required (transitively) by this many tested skills

# Skills the syllabus pairs with a set practical or activity. Draft list.
PRACTICAL = {
    "phy.mech.vec.resultant-two",        # weight of a body by the parallelogram of forces
    "phy.mech.cg.regular-bodies",        # centre of gravity of a plane lamina by suspension
    "phy.mech.eq.moment-balance",        # weight of a body by the principle of moments
    "phy.mech.hydro.compare-densities",  # U-tube and Hare's apparatus
    "phy.mech.hydro.hydrometer",         # hydrometer and weighted test tube
}


def sample_names():
    try:
        with open(SAMPLE, encoding="utf-8") as f:
            return {s["id"]: s.get("name_si") for s in json.load(f)["skills"]}
    except OSError:
        return {}


def load_questions(db):
    con = sqlite3.connect(db)
    marks = ",".join("?" * len(REAL_PAPERS))
    rows = con.execute(
        f"""SELECT uid, paper, unit_no, subtopic, difficulty, has_figure FROM questions
            WHERE paper IN ({marks}) AND (unit_no = 2 OR (unit_no = 10 AND subtopic IN
            ('Buoyancy & Floatation', 'Bernoulli''s Principle', 'Fluid Pressure',
             'Torricelli''s Law', 'Continuity & Flow Rate')))""",
        REAL_PAPERS,
    ).fetchall()
    con.close()
    return {r[0]: dict(zip(["uid", "paper", "unit_no", "subtopic", "difficulty", "has_figure"], r)) for r in rows}


def build(db):
    questions = load_questions(db)
    missing = sorted(set(questions) - set(QMAP))
    extra = sorted(set(QMAP) - set(questions))
    if missing or extra:
        raise SystemExit(f"Mapping out of step with DB. Unmapped: {missing}. Not in DB: {extra}")

    hits = defaultdict(lambda: {"primary": [], "secondary": []})
    for uid, (prim, secs, _) in QMAP.items():
        hits[prim]["primary"].append(uid)
        for s in secs:
            hits[s]["secondary"].append(uid)

    def score(sid):
        h = hits.get(sid, {"primary": [], "secondary": []})
        return len(h["primary"]) + SECONDARY_CREDIT * len(h["secondary"])

    si = sample_names()
    renamed = {new: old for old, (new, act, _) in CROSSWALK.items() if act == "renamed"}

    edges = []
    for frm, tos in REQUIRES.items():
        for to in tos:
            edges.append({"type": "requires", "from": frm, "to": to})
    edges += [{"type": "helps", "from": a, "to": b} for a, b in HELPS]
    edges += [{"type": "encompasses", "from": a, "to": b, "weight": w} for a, b, w in ENCOMPASSES]
    edges += [{"type": "confusable", "from": a, "to": b, "why": why} for a, b, why in CONFUSABLE]
    for sid, *_, math in SKILLS:
        edges += [{"type": "uses-math", "from": sid, "to": m} for m in math]

    # Level weight blends exam share and period share; split within a level by score.
    level_of = {s[0]: s[2] for s in SKILLS}
    level_score = defaultdict(float)
    for sid in level_of:
        level_score[level_of[sid]] += score(sid)
    total_score = sum(level_score.values())
    total_periods = sum(p for _, p in TOPICS.values())
    level_weight = {
        lvl: EXAM_BLEND * level_score[lvl] / total_score + (1 - EXAM_BLEND) * periods / total_periods
        for lvl, (_, periods) in TOPICS.items()
    }
    rel = {}
    for lvl in TOPICS:
        ids = [sid for sid in level_of if level_of[sid] == lvl]
        top = max(score(sid) for sid in ids) or 1
        for sid in ids:
            rel[sid] = max(WEIGHT_FLOOR, score(sid) / top)
    share = {}
    for lvl in TOPICS:
        ids = [sid for sid in level_of if level_of[sid] == lvl]
        for sid in ids:
            share[sid] = level_weight[lvl] * rel[sid] / sum(rel[i] for i in ids)
    top_share = max(share.values())

    # Foundation skills past papers never test directly, but many tested skills sit on.
    req = defaultdict(list)
    for e in edges:
        if e["type"] == "requires":
            req[e["from"]].append(e["to"])

    def below(sid):
        seen, todo = set(), list(req[sid])
        while todo:
            n = todo.pop()
            if n not in seen:
                seen.add(n)
                todo += req[n]
        return seen

    tested = [sid for sid in level_of if score(sid)]
    dependents = {sid: sum(1 for t in tested if sid in below(t)) for sid in level_of}

    skills = []
    for sid, name, level, sub, typ, mins, math in SKILLS:
        h = hits.get(sid, {"primary": [], "secondary": []})
        prim = sorted(h["primary"])
        diffs = [questions[u]["difficulty"] for u in prim if questions[u]["difficulty"]]
        figs = [questions[u]["has_figure"] for u in prim]
        inferred = not score(sid) and dependents[sid] >= INFER_MIN_DEPENDENTS
        skills.append({
            "id": sid,
            "unit": "phy.mech",
            "topic": f"phy.mech.{level}",
            "subtopic": sub,
            "syllabus_ref": level,
            "type": typ,
            "practical": sid in PRACTICAL,
            "mastery": "inferred" if inferred else "practised",
            "names": {"en": name, "si": si.get(sid) or si.get(renamed.get(sid, "")), "ta": None},
            "est_minutes": mins,
            "math_deps": math,
            "difficulty_est": round(sum(diffs) / len(diffs), 1) if diffs else None,
            "exam": {
                "primary": prim,
                "secondary": sorted(h["secondary"]),
                "score": score(sid),
                "figure_share": round(sum(figs) / len(figs), 2) if figs else None,
                "tested_dependents": dependents[sid],
            },
            "exam_weight_share": round(share[sid], 4),
            "exam_weight": round(share[sid] / top_share, 3),
            "status": "draft",
        })

    graph = {
        "status": "draft",
        "reviewer": None,
        "spec_version": SPEC_VERSION,
        "unit": {"id": "phy.mech", "name": "Mechanics", "syllabus_unit": 2, "periods": 110},
        "sources": [
            "resources/nie/physics/en/syllabus/AL-Physics-Syllabus-Gr12-13-en.pdf (Unit 2)",
            "resources/nie/physics/en/resource-books/Gr12-Physics-RB-Unit01-02-Measurement-Mechanics-en.pdf",
        ],
        "exam_weight_policy": {
            "papers": REAL_PAPERS,
            "source": "Paper I MCQs only. Paper II is not mapped yet, so these weights are not final.",
            "score": f"primary hits + {SECONDARY_CREDIT} × secondary hits",
            "level_weight": f"{EXAM_BLEND} × level's share of the unit's score + {1 - EXAM_BLEND} × level's share of teaching periods",
            "within_level": f"level_weight × max({WEIGHT_FLOOR}, score / top score in level), normalised within the level",
            "exam_weight_share": "the skill's share of the unit (sums to 1)",
            "exam_weight": "exam_weight_share / the largest share in the unit (0–1)",
        },
        "mastery_policy": f"mastery = inferred for a skill no past paper tests that at least {INFER_MIN_DEPENDENTS} tested skills require: its mastery comes from the skills built on it, and it is not practised first",
        "edge_semantics": {
            "requires": "`from` cannot be done without `to`. Must be a DAG.",
            "helps": "knowing `from` makes `to` easier",
            "encompasses": "practising `from` partly reviews `to`; weight is the implicit-review credit",
            "confusable": "undirected; interleave the two skills",
            "uses-math": "`to` is a skill in the shared maths layer",
        },
        "topics": [{"id": f"phy.mech.{k}", "syllabus_ref": k, "name": v[0], "periods": v[1],
                    "exam_share": round(level_score[k] / total_score, 3), "level_weight": round(level_weight[k], 3)}
                   for k, v in TOPICS.items()],
        "external": [{"id": k, "name": v[0], "syllabus_ref": v[1], "status": "stub"} for k, v in EXTERNAL.items()],
        "math": [{"id": k, "name": v} for k, v in MATH.items()],
        "skills": skills,
        "edges": edges,
    }

    qmap = {
        "status": "draft",
        "papers": REAL_PAPERS,
        "candidate_rule": "unit_no = 2, plus unit_no = 10 fluid subtopics that the NIE syllabus puts in Unit 2 (2.7, 2.8)",
        "questions": [
            {
                "uid": uid,
                "db_unit": questions[uid]["unit_no"],
                "db_subtopic": questions[uid]["subtopic"],
                "primary": prim,
                "secondary": secs,
                "note": note or None,
            }
            for uid, (prim, secs, note) in sorted(QMAP.items(), key=lambda kv: (int(kv[0].split("-")[0]), int(kv[0].split("-")[1])))
        ],
    }

    crosswalk = [{"sample_id": old, "graph_id": new, "action": act, "note": note or None} for old, (new, act, note) in CROSSWALK.items()]

    write_json("graph.json", graph)
    write_json("question-map.json", qmap)
    write_json("sample-crosswalk.json", crosswalk)
    write_coverage(graph, qmap)
    write_skills_md(graph)
    print(f"{len(skills)} skills, {len(edges)} edges, {len(QMAP)} questions mapped")


def write_json(name, data):
    with open(os.path.join(HERE, name), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def write_coverage(graph, qmap):
    skills = graph["skills"]
    n_q = len(qmap["questions"])
    out = ["# Mechanics coverage report (draft)", ""]
    out.append("> **Paper I MCQs only.** Paper II (structured and essay) is not mapped yet. "
               "Map it before treating any weight here as final.")
    out.append("")
    out.append(f"Generated by `author.py`. Real papers {REAL_PAPERS[0]}–{REAL_PAPERS[-1]} only, with no `predict-2026` and no model papers. "
               f"{n_q} questions are mapped to {len(skills)} syllabus skills. Weights are worked out in three steps:")
    out.append("")
    out.append(f"1. **Skill score** = primary hits + {SECONDARY_CREDIT} × secondary hits.")
    out.append(f"2. **Level weight** = {EXAM_BLEND} × the level's share of the unit's score + {1 - EXAM_BLEND} × its share of teaching periods.")
    out.append(f"3. **Within a level**, each skill gets max({WEIGHT_FLOOR}, score ÷ the level's top score). These are normalised, then multiplied by the level weight to give the skill's **unit share**.")
    out.append("")
    out.append("**Draft weight** (`exam_weight`) = unit share ÷ the largest unit share.")
    out.append("")
    out.append("## By competency level")
    out.append("")
    out.append("| Level | Topic | Periods | Skills | Tested | Primary questions | Exam share | Period share | Level weight |")
    out.append("|---|---|---|---|---|---|---|---|---|")
    for t in graph["topics"]:
        ss = [s for s in skills if s["syllabus_ref"] == t["syllabus_ref"]]
        tested = [s for s in ss if s["exam"]["score"]]
        nprim = sum(len(s["exam"]["primary"]) for s in ss)
        out.append(f"| {t['syllabus_ref']} | {t['name']} | {t['periods']} | {len(ss)} | {len(tested)} | {nprim} | "
                   f"{t['exam_share']:.0%} | {t['periods'] / 110:.0%} | {t['level_weight']:.0%} |")
    out.append("")
    out.append("## Skills by draft exam weight")
    out.append("")
    out.append("| Skill | Level | Type | Primary | Secondary | Unit share | Draft weight | Avg difficulty | Figure share |")
    out.append("|---|---|---|---|---|---|---|---|---|")
    for s in sorted(skills, key=lambda s: (-s["exam_weight"], s["id"])):
        e = s["exam"]
        out.append(f"| `{s['id']}` {s['names']['en']} | {s['syllabus_ref']} | {s['type']} | {len(e['primary'])} | {len(e['secondary'])} | "
                   f"{s['exam_weight_share']:.2%} | {s['exam_weight']} | {s['difficulty_est'] if s['difficulty_est'] is not None else '–'} | "
                   f"{e['figure_share'] if e['figure_share'] is not None else '–'} |")
    out.append("")
    never = [s for s in skills if not s["exam"]["score"]]
    second_only = [s for s in skills if not s["exam"]["primary"] and s["exam"]["secondary"]]
    out.append(f"## Skills past papers never test ({len(never)})")
    out.append("")
    out.append("No real question from 2016–2025 maps to these skills, as primary or secondary. They are in the syllabus, so they stay in the graph at the floor weight. "
               "\"Tested skills that require it\" counts tested skills with this one somewhere below them in `requires`: a high count means the exam reaches the skill indirectly, a zero means it never does.")
    out.append("")
    out.append(f"Mastery is `inferred` when at least {INFER_MIN_DEPENDENTS} tested skills require the skill: the app credits it from those skills and does not practise it first.")
    out.append("")
    out.append("| Skill | Level | Type | NIE content heading | Tested skills that require it | Mastery |")
    out.append("|---|---|---|---|---|---|")
    for s in never:
        n = s["exam"]["tested_dependents"]
        out.append(f"| `{s['id']}` {s['names']['en']} | {s['syllabus_ref']} | {s['type']} | {s['subtopic']} | {n} | {s['mastery']} |")
    out.append("")
    out.append(f"## Skills tested only as a secondary skill ({len(second_only)})")
    out.append("")
    for s in second_only:
        out.append(f"- `{s['id']}` {s['names']['en']}: {', '.join(s['exam']['secondary'])}")
    out.append("")
    notes = [q for q in qmap["questions"] if q["note"]]
    out.append("## Mapping notes")
    out.append("")
    for q in notes:
        out.append(f"- **{q['uid']}** (DB: unit {q['db_unit']}, {q['db_subtopic']}): {q['note']}")
    out.append("")
    with open(os.path.join(HERE, "coverage.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(out))


def write_skills_md(graph):
    """Readable skill list for the teacher, one table per competency level."""
    short = lambda i: i.replace("phy.mech.", "")
    rel = defaultdict(lambda: defaultdict(list))
    for e in graph["edges"]:
        if e["type"] == "uses-math":
            continue
        rel[e["from"]][e["type"]].append(short(e["to"]))
        if e["type"] == "confusable":
            rel[e["to"]]["confusable"].append(short(e["from"]))
    out = ["# Mechanics skills (draft)", "",
           "Generated by `author.py` from `graph.json`. IDs drop the `phy.mech.` prefix here. "
           "**Needs** = `requires` (hard prerequisite). **Reviews** = `encompasses` (practising this one partly reviews those). "
           "**Helps** = soft link. **Mixed up with** = `confusable`. **Exam** = past-paper questions with this as the main skill, then as a secondary skill.", ""]
    for t in graph["topics"]:
        ss = [s for s in graph["skills"] if s["syllabus_ref"] == t["syllabus_ref"]]
        out += [f"## {t['syllabus_ref']} {t['name']} ({t['periods']} periods, {len(ss)} skills)", "",
                "| ☐ | Skill | Type | Needs | Reviews | Helps | Mixed up with | Exam |", "|---|---|---|---|---|---|---|---|"]
        for s in ss:
            r = rel[s["id"]]
            j = lambda k: ", ".join(r[k]) or "–"
            out.append(f"| ☐ | **{s['names']['en']}**<br>`{short(s['id'])}` · {s['subtopic']} | {s['type']} | {j('requires')} | {j('encompasses')} | "
                       f"{j('helps')} | {j('confusable')} | {len(s['exam']['primary'])} + {len(s['exam']['secondary'])} |")
        out.append("")
    with open(os.path.join(HERE, "skills.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(out))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", default=DEFAULT_DB)
    build(ap.parse_args().db)
