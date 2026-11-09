"""Shared build and check code for unit skill graphs (Thermal Physics, Current Electricity).

Each unit folder has an `author.py` that holds only the unit's data (topics, skills, edges,
past-paper mapping) and calls `build`, and a `validate.py` that calls `validate`.
Mechanics predates this module and keeps its own copy of the same code.

Validator checks (errors fail the run):
  G1 unique IDs; skill IDs start with <unit>.<topic>.<name>
  G2 every edge endpoint exists; uses-math points into the maths layer; only `helps` may start at an external stub
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
  X1 every skill the unit's sample uses is a graph skill
"""
import json
import os
import re
import sqlite3
from collections import defaultdict

DEFAULT_DB = os.path.expanduser("~/Work/ALPhysics/db/alphysics.db")
REAL_PAPERS = [str(y) for y in range(2016, 2026)]  # not predict-2026, not model-*
SECONDARY_CREDIT = 0.5
WEIGHT_FLOOR = 0.1  # within a level, no syllabus skill gets less than 0.1 of the level's top skill
EXAM_BLEND = 0.5    # level weight = EXAM_BLEND × exam share + (1 − EXAM_BLEND) × period share
INFER_MIN_DEPENDENTS = 5  # untested skill required (transitively) by this many tested skills
R, C, P, M = "recall", "conceptual", "procedural", "method-selection"


def sample_names(u):
    try:
        with open(u.SAMPLE, encoding="utf-8") as f:
            return {s["id"]: s.get("name_si") for s in json.load(f)["skills"]}
    except OSError:
        return {}


def load_questions(u, db):
    con = sqlite3.connect(db)
    marks = ",".join("?" * len(REAL_PAPERS))
    rows = con.execute(
        f"SELECT uid, paper, unit_no, subtopic, difficulty, has_figure FROM questions WHERE paper IN ({marks}) AND ({u.CANDIDATE_SQL})",
        REAL_PAPERS,
    ).fetchall()
    con.close()
    return {r[0]: dict(zip(["uid", "paper", "unit_no", "subtopic", "difficulty", "has_figure"], r)) for r in rows}


def build(u, db):
    questions = load_questions(u, db)
    missing = sorted(set(questions) - set(u.QMAP))
    extra = sorted(set(u.QMAP) - set(questions))
    if missing or extra:
        raise SystemExit(f"Mapping out of step with DB. Unmapped: {missing}. Not in DB: {extra}")

    hits = defaultdict(lambda: {"primary": [], "secondary": []})
    for uid, (prim, secs, _) in u.QMAP.items():
        hits[prim]["primary"].append(uid)
        for s in secs:
            hits[s]["secondary"].append(uid)

    def score(sid):
        h = hits.get(sid, {"primary": [], "secondary": []})
        return len(h["primary"]) + SECONDARY_CREDIT * len(h["secondary"])

    si = sample_names(u)

    edges = []
    for frm, tos in u.REQUIRES.items():
        for to in tos:
            edges.append({"type": "requires", "from": frm, "to": to})
    edges += [{"type": "helps", "from": a, "to": b} for a, b in u.HELPS]
    edges += [{"type": "encompasses", "from": a, "to": b, "weight": w} for a, b, w in u.ENCOMPASSES]
    edges += [{"type": "confusable", "from": a, "to": b, "why": why} for a, b, why in u.CONFUSABLE]
    for sid, *_, math in u.SKILLS:
        edges += [{"type": "uses-math", "from": sid, "to": m} for m in math]

    # Level weight blends exam share and period share; split within a level by score.
    level_of = {s[0]: s[2] for s in u.SKILLS}
    level_score = defaultdict(float)
    for sid in level_of:
        level_score[level_of[sid]] += score(sid)
    total_score = sum(level_score.values())
    total_periods = sum(p for _, p in u.TOPICS.values())
    level_weight = {
        lvl: EXAM_BLEND * level_score[lvl] / total_score + (1 - EXAM_BLEND) * periods / total_periods
        for lvl, (_, periods) in u.TOPICS.items()
    }
    rel = {}
    for lvl in u.TOPICS:
        ids = [sid for sid in level_of if level_of[sid] == lvl]
        top = max(score(sid) for sid in ids) or 1
        for sid in ids:
            rel[sid] = max(WEIGHT_FLOOR, score(sid) / top)
    share = {}
    for lvl in u.TOPICS:
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
    for sid, name, level, sub, typ, mins, math in u.SKILLS:
        h = hits.get(sid, {"primary": [], "secondary": []})
        prim = sorted(h["primary"])
        diffs = [questions[u]["difficulty"] for u in prim if questions[u]["difficulty"]]
        figs = [questions[u]["has_figure"] for u in prim]
        inferred = not score(sid) and dependents[sid] >= INFER_MIN_DEPENDENTS
        skills.append({
            "id": sid,
            "unit": u.UNIT["id"],
            "topic": f"{u.UNIT['id']}.{level}",
            "subtopic": sub,
            "syllabus_ref": level,
            "type": typ,
            "practical": sid in u.PRACTICAL,
            "mastery": "inferred" if inferred else "practised",
            "names": {"en": name, "si": si.get(sid), "ta": None},
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
        "spec_version": u.SPEC_VERSION,
        "unit": u.UNIT,
        "sources": u.SOURCES,
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
        "topics": [{"id": f"{u.UNIT['id']}.{k}", "syllabus_ref": k, "name": v[0], "periods": v[1],
                    "exam_share": round(level_score[k] / total_score, 3), "level_weight": round(level_weight[k], 3)}
                   for k, v in u.TOPICS.items()],
        "external": [{"id": k, "name": v[0], "syllabus_ref": v[1], "status": "stub"} for k, v in u.EXTERNAL.items()],
        "math": [{"id": k, "name": v} for k, v in u.MATH.items()],
        "skills": skills,
        "edges": edges,
    }

    qmap = {
        "status": "draft",
        "papers": REAL_PAPERS,
        "candidate_rule": u.CANDIDATE_RULE,
        "questions": [
            {
                "uid": uid,
                "db_unit": questions[uid]["unit_no"],
                "db_subtopic": questions[uid]["subtopic"],
                "primary": prim,
                "secondary": secs,
                "note": note or None,
            }
            for uid, (prim, secs, note) in sorted(u.QMAP.items(), key=lambda kv: (int(kv[0].split("-")[0]), int(kv[0].split("-")[1])))
        ],
    }

    write_json(u, "graph.json", graph)
    write_json(u, "question-map.json", qmap)
    write_coverage(u, graph, qmap)
    write_skills_md(u, graph)
    print(f"{len(skills)} skills, {len(edges)} edges, {len(u.QMAP)} questions mapped")


def write_json(u, name, data):
    with open(os.path.join(u.HERE, name), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def write_coverage(u, graph, qmap):
    skills = graph["skills"]
    n_q = len(qmap["questions"])
    out = [f"# {u.UNIT['name']} coverage report (draft)", ""]
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
                   f"{t['exam_share']:.0%} | {t['periods'] / u.UNIT['periods']:.0%} | {t['level_weight']:.0%} |")
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
    with open(os.path.join(u.HERE, "coverage.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(out))


def write_skills_md(u, graph):
    """Readable skill list for the teacher, one table per competency level."""
    short = lambda i: i.replace(u.UNIT["id"] + ".", "")
    rel = defaultdict(lambda: defaultdict(list))
    for e in graph["edges"]:
        if e["type"] == "uses-math":
            continue
        rel[e["from"]][e["type"]].append(short(e["to"]))
        if e["type"] == "confusable":
            rel[e["to"]]["confusable"].append(short(e["from"]))
    out = [f"# {u.UNIT['name']} skills (draft)", "",
           f"Generated by `author.py` from `graph.json`. IDs drop the `{u.UNIT['id']}.` prefix here. "
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
    with open(os.path.join(u.HERE, "skills.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(out))



TYPES = {"recall", "conceptual", "procedural", "method-selection"}
EDGE_TYPES = {"requires", "helps", "encompasses", "confusable", "uses-math"}


def load(here, name):
    with open(os.path.join(here, name), encoding="utf-8") as f:
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


def validate(here, unit_id, sample):
    """Check graph.json and question-map.json in `here`. Returns the exit code."""
    id_re = re.compile(r"^" + re.escape(unit_id) + r"\.[a-z0-9]+\.[a-z0-9-]+$")
    g = load(here, "graph.json")
    q = load(here, "question-map.json")
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
        if not id_re.match(sid):
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
        if a not in skills and not (t == "helps" and a in external):  # a skill in another unit can help one here
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

    # X1: every skill the sample uses is a graph skill
    if os.path.exists(sample):
        with open(sample, encoding="utf-8") as f:
            sample_ids = {s["id"] for s in json.load(f)["skills"]}
        if sample_ids - set(skills):
            errors.append(f"X1 sample skills not in the graph: {sorted(sample_ids - set(skills))}")
    else:
        warnings.append(f"no sample at {sample}, so X1 was skipped")

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

