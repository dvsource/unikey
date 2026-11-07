"""Validate the Mechanics skill graph and its question map.

Checks (errors fail the run):
  G1 unique IDs; skill IDs start with phy.mech.<topic>.<name>
  G2 every edge endpoint exists; uses-math points into the maths layer
  G3 no self-loops, no duplicate edges, confusable pairs stored once
  G4 `requires` is a DAG (cycle is printed)
  G5 `encompasses` is acyclic, so implicit-review credit can't loop
  G6 no orphan skills: every skill has at least one requires/helps/encompasses/confusable edge
  G7 syllabus_ref is a listed competency level; type is from the DR-0022 list
  G8 encompasses weights are in 0.3–0.7
  G9 math_deps on each skill match its uses-math edges
  G10 no confusable pair where one skill requires the other (directly or further down)
  G11 practical is true/false; mastery is practised or inferred, and inferred only for untested skills
  W1 exam_weight is in 0–1 and exam_weight_share sums to 1
  Q1 every mapped skill exists; at most 2 secondaries; primary not repeated as secondary
  Q2 exam hits in graph.json agree with question-map.json
  X1 every skill in content/samples/mechanics-20 maps to a graph skill
Warnings: redundant `requires` edges (implied by a longer path), external stubs nothing
points at. Also prints the longest `requires` chain.

Run: python3 content/skills/mechanics/validate.py
"""
import json
import os
import re
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
TYPES = {"recall", "conceptual", "procedural", "method-selection"}
EDGE_TYPES = {"requires", "helps", "encompasses", "confusable", "uses-math"}
ID_RE = re.compile(r"^phy\.mech\.[a-z0-9]+\.[a-z0-9-]+$")


def load(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as f:
        return json.load(f)


def find_cycle(nodes, adj):
    WHITE, GREY, BLACK = 0, 1, 2
    colour = {n: WHITE for n in nodes}
    stack = []

    def visit(n):
        colour[n] = GREY
        stack.append(n)
        for m in adj.get(n, ()):
            if colour.get(m, WHITE) == GREY:
                return stack[stack.index(m):] + [m]
            if colour.get(m, WHITE) == WHITE:
                found = visit(m)
                if found:
                    return found
        stack.pop()
        colour[n] = BLACK
        return None

    for n in nodes:
        if colour[n] == WHITE:
            found = visit(n)
            if found:
                return found
    return None


def reachable(adj, start, skip_edge):
    seen, todo = set(), [start]
    while todo:
        n = todo.pop()
        for m in adj.get(n, ()):
            if (n, m) == skip_edge or m in seen:
                continue
            seen.add(m)
            todo.append(m)
    return seen


def main():
    g = load("graph.json")
    q = load("question-map.json")
    errors, warnings = [], []

    skills = {s["id"]: s for s in g["skills"]}
    external = {e["id"] for e in g["external"]}
    math = {m["id"] for m in g["math"]}
    levels = {t["syllabus_ref"] for t in g["topics"]}
    ids = [s["id"] for s in g["skills"]] + list(external) + list(math)

    # G1
    dupes = {i for i in ids if ids.count(i) > 1}
    if dupes:
        errors.append(f"G1 duplicate IDs: {sorted(dupes)}")
    for sid in skills:
        if not ID_RE.match(sid):
            errors.append(f"G1 bad skill ID: {sid}")

    # G7
    for s in g["skills"]:
        if s["syllabus_ref"] not in levels:
            errors.append(f"G7 {s['id']}: unknown syllabus_ref {s['syllabus_ref']}")
        if s["type"] not in TYPES:
            errors.append(f"G7 {s['id']}: unknown type {s['type']}")

    # G2, G3, G8
    graph_nodes = set(skills) | external
    seen = set()
    by_type = defaultdict(list)
    for e in g["edges"]:
        t, a, b = e["type"], e["from"], e["to"]
        if t not in EDGE_TYPES:
            errors.append(f"G2 unknown edge type {t}")
            continue
        if a not in skills:
            errors.append(f"G2 {t} edge from unknown skill {a}")
        if t == "uses-math":
            if b not in math:
                errors.append(f"G2 uses-math edge to unknown maths skill {b}")
        elif b not in graph_nodes:
            errors.append(f"G2 {t} edge {a} -> unknown {b}")
        if a == b:
            errors.append(f"G3 self-loop {t} {a}")
        key = (t, *sorted((a, b))) if t == "confusable" else (t, a, b)
        if key in seen:
            errors.append(f"G3 duplicate edge {key}")
        seen.add(key)
        if t == "encompasses" and not 0.3 <= e.get("weight", 0) <= 0.7:
            errors.append(f"G8 encompasses {a} -> {b}: weight {e.get('weight')} outside 0.3–0.7")
        by_type[t].append((a, b))

    req_adj = defaultdict(list)
    for a, b in by_type["requires"]:
        req_adj[a].append(b)
    enc_adj = defaultdict(list)
    for a, b in by_type["encompasses"]:
        enc_adj[a].append(b)

    # G4, G5
    cyc = find_cycle(graph_nodes, req_adj)
    if cyc:
        errors.append("G4 requires cycle: " + " -> ".join(cyc))
    cyc = find_cycle(graph_nodes, enc_adj)
    if cyc:
        errors.append("G5 encompasses cycle: " + " -> ".join(cyc))

    # G6
    touched = defaultdict(int)
    for t in ("requires", "helps", "encompasses", "confusable"):
        for a, b in by_type[t]:
            touched[a] += 1
            touched[b] += 1
    orphans = [s for s in skills if not touched[s]]
    if orphans:
        errors.append(f"G6 orphan skills: {orphans}")
    unused_ext = [x for x in external if not touched[x]]
    if unused_ext:
        warnings.append(f"external stubs nothing points at: {unused_ext}")

    # G9
    edge_math = defaultdict(set)
    for a, b in by_type["uses-math"]:
        edge_math[a].add(b)
    for s in g["skills"]:
        if set(s["math_deps"]) != edge_math[s["id"]]:
            errors.append(f"G9 {s['id']}: math_deps and uses-math edges differ")

    # Warnings: redundant requires, level size, requires into encompassed skill
    if not cyc:
        for a, b in by_type["requires"]:
            if b in reachable(req_adj, a, (a, b)):
                warnings.append(f"redundant requires {a} -> {b} (implied by a longer path)")

    # G10
    if not cyc:
        for a, b in by_type["confusable"]:
            if b in reachable(req_adj, a, None) or a in reachable(req_adj, b, None):
                errors.append(f"G10 confusable pair {a} / {b}: one requires the other")

    # G11, W1
    for s in g["skills"]:
        if not isinstance(s.get("practical"), bool):
            errors.append(f"G11 {s['id']}: practical must be true or false")
        if s.get("mastery") not in ("practised", "inferred"):
            errors.append(f"G11 {s['id']}: mastery must be practised or inferred")
        elif s["mastery"] == "inferred" and s["exam"]["score"]:
            errors.append(f"G11 {s['id']}: inferred mastery on a skill past papers test")
        if not 0 <= s["exam_weight"] <= 1:
            errors.append(f"W1 {s['id']}: exam_weight {s['exam_weight']} outside 0–1")
    total_share = sum(s["exam_weight_share"] for s in g["skills"])
    if abs(total_share - 1) > 0.005:
        errors.append(f"W1 exam_weight_share sums to {total_share:.3f}, not 1")

    longest = []
    if not cyc:
        memo = {}

        def chain(n):
            if n not in memo:
                memo[n] = max(([n] + chain(m) for m in req_adj.get(n, ())), key=len, default=[n])
            return memo[n]

        longest = max((chain(sid) for sid in skills), key=len)

    # Q1, Q2
    known = set(skills) | external
    from_map = defaultdict(lambda: {"primary": set(), "secondary": set()})
    for item in q["questions"]:
        uid, prim, secs = item["uid"], item["primary"], item["secondary"]
        if prim not in known:
            errors.append(f"Q1 {uid}: unknown primary {prim}")
        for s in secs:
            if s not in known:
                errors.append(f"Q1 {uid}: unknown secondary {s}")
        if len(secs) > 2:
            errors.append(f"Q1 {uid}: more than 2 secondary skills")
        if prim in secs or len(set(secs)) != len(secs):
            errors.append(f"Q1 {uid}: repeated skill")
        from_map[prim]["primary"].add(uid)
        for s in secs:
            from_map[s]["secondary"].add(uid)
    for s in g["skills"]:
        m = from_map[s["id"]]
        if set(s["exam"]["primary"]) != m["primary"] or set(s["exam"]["secondary"]) != m["secondary"]:
            errors.append(f"Q2 {s['id']}: exam hits differ from question-map.json")

    # X1: every sample skill maps to an existing graph skill
    sample_path = os.path.join(HERE, "..", "..", "samples", "mechanics-20", "items.json")
    cross = {c["sample_id"]: c["graph_id"] for c in load("sample-crosswalk.json")}
    with open(sample_path, encoding="utf-8") as f:
        sample_ids = {s["id"] for s in json.load(f)["skills"]}
    if sample_ids - set(cross):
        errors.append(f"X1 sample skills not in crosswalk: {sorted(sample_ids - set(cross))}")
    for old, new in cross.items():
        if new not in skills:
            errors.append(f"X1 crosswalk {old} -> unknown {new}")

    n_edges = defaultdict(int)
    for e in g["edges"]:
        n_edges[e["type"]] += 1
    print(f"{len(skills)} skills, {len(external)} external stubs, {len(math)} maths skills")
    print("edges: " + ", ".join(f"{t} {n_edges[t]}" for t in sorted(EDGE_TYPES)))
    print(f"{len(q['questions'])} questions mapped")
    if longest:
        print(f"longest requires chain ({len(longest) - 1} edges): " + " -> ".join(longest))
    for w in warnings:
        print("WARN", w)
    for e in errors:
        print("ERROR", e)
    print("FAIL" if errors else "PASS")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
