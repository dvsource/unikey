// UniKey project tracker: one core library for the CLI, the MCP server and the dashboard.
// Store: pm/data/items.md (one item per line) + pm/data/log.md (one line per change).
// Line: `- <ID> <tokens...> | <title>`. Token grammar is documented in pm/README.md.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export type Status = "td" | "ip" | "bl" | "oh" | "dn" | "dr";
export const STATUSES: Status[] = ["td", "ip", "bl", "oh", "dn", "dr"];
export const STATUS_NAME: Record<Status, string> = {
  td: "todo", ip: "in-progress", bl: "blocked", oh: "on-hold", dn: "done", dr: "dropped",
};
const STATUS_ALIAS: Record<string, Status> = {
  todo: "td", "in-progress": "ip", wip: "ip", blocked: "bl", "on-hold": "oh", hold: "oh", done: "dn", dropped: "dr",
};
export const KIND_NAME: Record<string, string> = {
  P: "project", T: "task", S: "subtask", D: "todo", B: "bug", M: "milestone",
};
const KINDS = Object.keys(KIND_NAME);

export interface Item {
  id: string;
  st: Status;
  pri?: number; // 0 = highest
  owner?: string;
  parent?: string;
  tags: string[];
  group?: string;
  start?: string;
  due?: string;
  done?: string;
  deps: string[]; // depends-on; "blocks" is the inverse
  rel: string[];
  dup: string[];
  refs: string[];
  extra: string[]; // unknown tokens, kept as-is
  title: string;
}

export const kindOf = (id: string): string => id[0];
export const isOpen = (it: Item): boolean => it.st !== "dn" && it.st !== "dr";
const WORK = (i: Item) => !["P", "M"].includes(kindOf(i.id));
const resolved = (it: Item | undefined): boolean => !it || it.st === "dn" || it.st === "dr";

// ---------- dates ----------
const pad = (n: number) => String(n).padStart(2, "0");
export function today(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function stamp(d = new Date()): string {
  return `${today(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
/** `2026-12-06`, `12-06` (this year), `today`, `+3d`, `+2w`. */
export function parseDate(v: string, now = new Date()): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  if (/^\d{2}-\d{2}$/.test(v)) return `${now.getFullYear()}-${v}`;
  if (v === "today") return today(now);
  const m = /^\+(\d+)([dw])$/.exec(v);
  if (m) {
    const d = new Date(now);
    d.setDate(d.getDate() + Number(m[1]) * (m[2] === "w" ? 7 : 1));
    return today(d);
  }
  throw new Error(`bad date ${v}`);
}

// ---------- parse / serialize ----------
const ID_RE = /^[PTSDBM]\d+$/;
const list = (v: string) => v.split(",").filter(Boolean);

export function parseLine(line: string): Item | null {
  const m = /^- (\S+)(.*)$/.exec(line.trimEnd());
  if (!m || !ID_RE.test(m[1])) return null;
  const bar = m[2].indexOf(" | ");
  const head = bar >= 0 ? m[2].slice(0, bar) : m[2];
  const title = bar >= 0 ? m[2].slice(bar + 3).trim() : "";
  const it: Item = { id: m[1], st: "td", tags: [], deps: [], rel: [], dup: [], refs: [], extra: [], title };
  for (const t of head.split(/\s+/).filter(Boolean)) applyToken(it, t, true);
  return it;
}

export function formatItem(it: Item): string {
  const t: string[] = [it.id, it.st];
  if (it.pri !== undefined) t.push(`p${it.pri}`);
  if (it.owner) t.push(`@${it.owner}`);
  if (it.parent) t.push(`^${it.parent}`);
  for (const x of it.tags) t.push(`#${x}`);
  if (it.group) t.push(`g:${it.group}`);
  if (it.start) t.push(`s:${it.start}`);
  if (it.due) t.push(`d:${it.due}`);
  if (it.done) t.push(`x:${it.done}`);
  if (it.deps.length) t.push(`<${it.deps.join(",")}`);
  if (it.rel.length) t.push(`~${it.rel.join(",")}`);
  if (it.dup.length) t.push(`=${it.dup.join(",")}`);
  for (const r of it.refs) t.push(`&${r}`);
  t.push(...it.extra);
  return `${t.join(" ")} | ${it.title}`;
}

const addAll = (arr: string[], vs: string[]) => { for (const v of vs) if (!arr.includes(v)) arr.push(v); };
const delAll = (arr: string[], vs: string[]) => vs.length ? arr.filter((x) => !vs.includes(x)) : [];

/** Apply one token to an item. `-` prefix removes (`-#x`, `-<T4`, `-@`, `-d:`). */
export function applyToken(it: Item, tok: string, raw = false, now = new Date()): void {
  const date = (v: string) => (raw ? v : parseDate(v, now));
  if (tok.startsWith("-") && tok.length > 1) {
    const r = tok.slice(1);
    const c = r[0], v = r.slice(1);
    if (c === "#") it.tags = delAll(it.tags, list(v));
    else if (c === "<") it.deps = delAll(it.deps, list(v));
    else if (c === "~") it.rel = delAll(it.rel, list(v));
    else if (c === "=") it.dup = delAll(it.dup, list(v));
    else if (c === "&") it.refs = v ? it.refs.filter((x) => x !== v) : [];
    else if (c === "@") delete it.owner;
    else if (c === "^") delete it.parent;
    else if (r === "p") delete it.pri;
    else if (r === "g:") delete it.group;
    else if (r === "s:") delete it.start;
    else if (r === "d:") delete it.due;
    else if (r === "x:") delete it.done;
    else throw new Error(`bad token ${tok}`);
    return;
  }
  const st = (STATUSES as string[]).includes(tok) ? (tok as Status) : STATUS_ALIAS[tok];
  if (st) { it.st = st; return; }
  if (/^p[0-3]$/.test(tok)) { it.pri = Number(tok[1]); return; }
  const c = tok[0], v = tok.slice(1);
  if (c === "@" && v) it.owner = v;
  else if (c === "^" && v) it.parent = v;
  else if (c === "#" && v) addAll(it.tags, list(v));
  else if (c === "<" && v) addAll(it.deps, list(v));
  else if (c === "~" && v) addAll(it.rel, list(v));
  else if (c === "=" && v) addAll(it.dup, list(v));
  else if (c === "&" && v) addAll(it.refs, [v]);
  else if (tok.startsWith("g:")) it.group = tok.slice(2);
  else if (tok.startsWith("s:")) it.start = date(tok.slice(2));
  else if (tok.startsWith("d:")) it.due = date(tok.slice(2));
  else if (tok.startsWith("x:")) it.done = date(tok.slice(2));
  else if (raw) it.extra.push(tok);
  else throw new Error(`bad token ${tok}`);
}

// ---------- the board (in-memory, with derived relations) ----------
export class Board {
  items: Item[];
  byId: Map<string, Item>;
  kids: Map<string, Item[]>;
  blocks: Map<string, string[]>;
  constructor(items: Item[]) {
    this.items = items;
    this.byId = new Map(items.map((i) => [i.id, i]));
    this.kids = new Map();
    this.blocks = new Map();
    for (const i of items) {
      if (i.parent) (this.kids.get(i.parent) ?? this.kids.set(i.parent, []).get(i.parent)!).push(i);
      for (const d of i.deps) (this.blocks.get(d) ?? this.blocks.set(d, []).get(d)!).push(i.id);
    }
  }
  openDeps(it: Item): string[] { return it.deps.filter((d) => !resolved(this.byId.get(d))); }
  isReady(it: Item): boolean {
    return WORK(it) && (it.st === "td" || it.st === "ip") && this.openDeps(it).length === 0;
  }
  /** Status bl, or in progress with an open dependency. */
  isBlocked(it: Item): boolean { return it.st === "bl" || (it.st === "ip" && this.openDeps(it).length > 0); }
  /** To do, waiting on an open dependency. */
  isWaiting(it: Item): boolean { return it.st === "td" && this.openDeps(it).length > 0; }
  isOverdue(it: Item, now = today()): boolean { return isOpen(it) && !!it.due && it.due < now; }
  /** All descendants (any depth). */
  under(id: string): Item[] {
    const out: Item[] = [];
    const walk = (p: string) => { for (const k of this.kids.get(p) ?? []) { out.push(k); walk(k.id); } };
    walk(id);
    return out;
  }
  /** Ancestors, nearest first. */
  ancestors(it: Item): Item[] {
    const out: Item[] = [];
    let p = it.parent ? this.byId.get(it.parent) : undefined;
    while (p && !out.includes(p)) { out.push(p); p = p.parent ? this.byId.get(p.parent) : undefined; }
    return out;
  }
  /** Top-level project an item belongs to (or itself). */
  root(it: Item): Item {
    const a = this.ancestors(it);
    return a.length ? a[a.length - 1] : it;
  }
  /** Work-item progress under a project: [done, total], dropped excluded. */
  progress(id: string): [number, number] {
    const w = this.under(id).filter((i) => kindOf(i.id) !== "P" && kindOf(i.id) !== "M" && i.st !== "dr");
    return [w.filter((i) => i.st === "dn").length, w.length];
  }
  nextId(kind: string): string {
    let max = 0;
    for (const i of this.items) if (kindOf(i.id) === kind) max = Math.max(max, Number(i.id.slice(1)));
    return `${kind}${max + 1}`;
  }
  /** Problems in references and cycles. Empty = valid. */
  check(): string[] {
    const errs: string[] = [];
    const seen = new Set<string>();
    for (const i of this.items) {
      if (seen.has(i.id)) errs.push(`${i.id}: duplicate id`);
      seen.add(i.id);
      for (const r of [...(i.parent ? [i.parent] : []), ...i.deps, ...i.rel, ...i.dup])
        if (!this.byId.has(r)) errs.push(`${i.id}: no ${r}`);
      if (i.parent === i.id || i.deps.includes(i.id)) errs.push(`${i.id}: self reference`);
      if (i.parent && this.ancestors(i).includes(i)) errs.push(`${i.id}: parent cycle`);
    }
    // dependency cycles (DFS)
    const mark = new Map<string, number>();
    const visit = (id: string, stack: string[]): void => {
      if (mark.get(id) === 2) return;
      if (mark.get(id) === 1) { errs.push(`dep cycle ${[...stack.slice(stack.indexOf(id)), id].join(">")}`); return; }
      mark.set(id, 1);
      for (const d of this.byId.get(id)?.deps ?? []) if (this.byId.has(d)) visit(d, [...stack, id]);
      mark.set(id, 2);
    };
    for (const i of this.items) visit(i.id, []);
    return errs;
  }
}

// ---------- store ----------
export function defaultDataDir(): string {
  if (process.env.PM_DATA) return process.env.PM_DATA;
  const here = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
  // In a git worktree, write to the main checkout so every session shares one board.
  try {
    const common = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
      cwd: path.dirname(here), stdio: ["ignore", "pipe", "ignore"],
    }).toString().trim();
    const main = path.join(path.dirname(common), "pm", "data");
    if (fs.existsSync(main)) return main;
  } catch { /* not a git checkout */ }
  return here;
}

const HEADER = `# UniKey pm items. Written by \`pm\` only (see pm/README.md). One item per line:
# - ID status [pN] [@owner] [^parent] [#tag] [g:group] [s:start] [d:due] [x:done] [<deps] [~rel] [=dup] [&ref] | title
`;

export class Store {
  dir: string;
  constructor(dir = defaultDataDir()) { this.dir = dir; }
  get itemsFile() { return path.join(this.dir, "items.md"); }
  get logFile() { return path.join(this.dir, "log.md"); }

  load(): Board {
    let text = "";
    try { text = fs.readFileSync(this.itemsFile, "utf8"); } catch { /* empty board */ }
    const items: Item[] = [];
    for (const l of text.split("\n")) { const it = parseLine(l); if (it) items.push(it); }
    return new Board(items);
  }

  readLog(n = Infinity): string[] {
    let text = "";
    try { text = fs.readFileSync(this.logFile, "utf8"); } catch { return []; }
    const lines = text.split("\n").filter((l) => /^\d{4}-/.test(l));
    return n === Infinity ? lines : lines.slice(-n);
  }

  save(b: Board): void {
    fs.mkdirSync(this.dir, { recursive: true });
    const tmp = `${this.itemsFile}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, HEADER + b.items.map((i) => `- ${formatItem(i)}`).join("\n") + "\n");
    fs.renameSync(tmp, this.itemsFile);
  }

  appendLog(lines: string[]): void {
    if (!lines.length) return;
    if (!fs.existsSync(this.logFile)) fs.writeFileSync(this.logFile, "# UniKey pm activity log: <time> <by> <id> <change>\n");
    fs.appendFileSync(this.logFile, lines.join("\n") + "\n");
  }

  /** Run fn under an exclusive lock (mkdir lock; stale after 10 s). */
  locked<T>(fn: () => T): T {
    fs.mkdirSync(this.dir, { recursive: true });
    const lock = path.join(this.dir, ".lock");
    const until = Date.now() + 8000;
    for (;;) {
      try { fs.mkdirSync(lock); break; } catch {
        try { if (Date.now() - fs.statSync(lock).mtimeMs > 10000) { fs.rmdirSync(lock); continue; } } catch { continue; }
        if (Date.now() > until) throw new Error("pm data locked");
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 20);
      }
    }
    try { return fn(); } finally { fs.rmdirSync(lock); }
  }

  /** Apply a batch of ops atomically. Returns `ok ID...` or `err ...` lines. */
  write(ops: string[], by = whoami(), now = new Date()): string {
    return this.locked(() => {
      const b = this.load();
      const res = applyOps(b, ops, by, now);
      if (res.errors.length) return res.errors.join("\n");
      this.save(new Board(b.items));
      this.appendLog(res.log);
      return `ok ${res.ids.join(" ")}`;
    });
  }
}

export const whoami = () => process.env.PM_WHO || "agent";

// ---------- ops ----------
/** Split `tokens | title` into tokens and title (title undefined if no bar). */
function splitOp(op: string): [string[], string | undefined] {
  const s = ` ${op.trim()} `;
  const i = s.indexOf(" | ");
  const head = i >= 0 ? s.slice(0, i) : s;
  const title = i >= 0 ? s.slice(i + 3).trim() : undefined;
  return [head.trim().split(/\s+/).filter(Boolean), title];
}

/**
 * Ops (one per line):
 *   `+T ^P3 p1 #x | Title`   add (kind letter after +); `$1` = id of the 1st add in this batch
 *   `T42 dn`                 set tokens on an existing item; `| text` replaces the title
 * Status dn sets x:today, ip sets s:today, when not already set.
 */
export function applyOps(b: Board, ops: string[], by: string, now = new Date()) {
  const ids: string[] = [], log: string[] = [], errors: string[] = [], added: string[] = [];
  const ts = stamp(now);
  const sub = (t: string) => t.replace(/\$(\d+)/g, (m, n) => added[Number(n) - 1] ?? m);
  ops.map((o) => o.trim()).filter((o) => o && !o.startsWith("#")).forEach((op, n) => {
    try {
      const [toks0, title] = splitOp(op);
      const toks = toks0.map(sub);
      let it: Item;
      let change: string;
      if (toks[0]?.startsWith("+")) {
        const kind = toks[0].slice(1) || toks.splice(1, 1)[0];
        if (!KINDS.includes(kind)) throw new Error(`bad kind ${kind}`);
        if (!title) throw new Error("add needs | title");
        it = { id: b.nextId(kind), st: "td", tags: [], deps: [], rel: [], dup: [], refs: [], extra: [], title };
        for (const t of toks.slice(1)) applyToken(it, t, false, now);
        b.items.push(it);
        b.byId.set(it.id, it);
        added.push(it.id);
        change = `+ ${title.slice(0, 60)}`;
      } else {
        const cur = b.byId.get(toks[0]);
        if (!cur) throw new Error(`no ${toks[0] ?? "id"}`);
        it = cur;
        const before = it.st;
        for (const t of toks.slice(1)) applyToken(it, t, false, now);
        if (title !== undefined) it.title = title;
        if (it.st !== before && it.st === "dn" && !it.done) it.done = today(now);
        if (it.st !== before && it.st === "ip" && !it.start) it.start = today(now);
        change = toks.slice(1).join(" ") + (title !== undefined ? " |" : "");
      }
      if (it.st === "dn" && kindOf(it.id) !== "P" && !it.done) it.done = today(now);
      for (const r of [...(it.parent ? [it.parent] : []), ...it.deps, ...it.rel, ...it.dup])
        if (!b.byId.has(r)) throw new Error(`no ${r}`);
      ids.push(it.id);
      log.push(`${ts} ${by} ${it.id} ${change}`.trimEnd());
    } catch (e) {
      errors.push(`err ${n + 1}: ${(e as Error).message}`);
    }
  });
  if (!errors.length) {
    const cyc = new Board(b.items).check().filter((e) => e.startsWith("dep cycle") || e.includes("cycle"));
    if (cyc.length) errors.push(`err ${cyc[0]}`);
  }
  return { ids, log, errors };
}

// ---------- queries ----------
export interface Filter {
  st: Status[]; pri: number[]; kinds: string[]; tags: string[]; under?: string; owner?: string;
  group?: string; ready: boolean; blocked: boolean; waiting: boolean; overdue: boolean; all: boolean; text: string[]; limit?: number;
}

/** Filter grammar: `ip bl p0 p1 T B #tag ^P3 @owner g:grp ready blocked waiting overdue all n:20 words`. */
export function parseFilter(args: string[]): Filter {
  const f: Filter = { st: [], pri: [], kinds: [], tags: [], ready: false, blocked: false, waiting: false, overdue: false, all: false, text: [] };
  for (const a of args.flatMap((x) => x.split(/\s+/)).filter(Boolean)) {
    if (a === "ready" || a === "blocked" || a === "waiting" || a === "overdue" || a === "all") { f[a] = true; continue; }
    const st = (STATUSES as string[]).includes(a) ? (a as Status) : STATUS_ALIAS[a];
    if (st) f.st.push(st);
    else if (/^p[0-3]$/.test(a)) f.pri.push(Number(a[1]));
    else if (/^[PTSDBM]$/.test(a)) f.kinds.push(a);
    else if (a.startsWith("#")) f.tags.push(...list(a.slice(1)));
    else if (/^\^[PTSDBM]\d+$/.test(a)) f.under = a.slice(1);
    else if (a.startsWith("@")) f.owner = a.slice(1);
    else if (a.startsWith("g:")) f.group = a.slice(2);
    else if (/^n:\d+$/.test(a)) f.limit = Number(a.slice(2));
    else f.text.push(a.toLowerCase());
  }
  return f;
}

export const priOf = (i: Item) => i.pri ?? 2;
export function sortItems(a: Item, b: Item): number {
  return priOf(a) - priOf(b) || (a.due ?? "9").localeCompare(b.due ?? "9") ||
    a.id[0].localeCompare(b.id[0]) || Number(a.id.slice(1)) - Number(b.id.slice(1));
}

export function query(b: Board, f: Filter, now = today()): Item[] {
  const scope = f.under ? new Set(b.under(f.under).map((i) => i.id)) : null;
  const out = b.items.filter((i) => {
    if (f.st.length ? !f.st.includes(i.st) : !f.all && !isOpen(i)) return false;
    if (f.pri.length && !f.pri.includes(priOf(i))) return false;
    if (f.kinds.length && !f.kinds.includes(kindOf(i.id))) return false;
    if (f.tags.some((t) => !i.tags.includes(t))) return false;
    if (scope && !scope.has(i.id)) return false;
    if (f.owner && i.owner !== f.owner) return false;
    if (f.group && i.group !== f.group) return false;
    if (f.ready && !b.isReady(i)) return false;
    if (f.blocked && !b.isBlocked(i)) return false;
    if (f.waiting && !b.isWaiting(i)) return false;
    if (f.overdue && !b.isOverdue(i, now)) return false;
    const hay = `${i.id} ${i.title}`.toLowerCase();
    if (f.text.some((t) => !hay.includes(t))) return false;
    return true;
  }).sort(sortItems);
  return f.limit ? out.slice(0, f.limit) : out;
}

// ---------- terse renderers ----------
const short = (d?: string) => (d ? d.slice(5) : "");
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

/** One-line summary: `T42 ip p1 @x ^P3 d:12-06 <T40 Title`. Open deps only. */
export function row(b: Board, i: Item, width = 80): string {
  const t = [i.id, i.st];
  if (i.pri !== undefined) t.push(`p${i.pri}`);
  if (i.owner) t.push(`@${i.owner}`);
  if (i.parent) t.push(`^${i.parent}`);
  if (i.due && isOpen(i)) t.push(`d:${short(i.due)}`);
  const od = b.openDeps(i);
  if (od.length && isOpen(i)) t.push(`<${od.join(",")}`);
  if (kindOf(i.id) === "P") { const [d, n] = b.progress(i.id); t.push(`${d}/${n}`); }
  return `${t.join(" ")} ${cut(i.title, width)}`;
}

export function show(b: Board, id: string, log: string[]): string {
  const i = b.byId.get(id);
  if (!i) return `err no ${id}`;
  const out = [formatItem(i)];
  const anc = b.ancestors(i);
  if (anc.length) out.push(`up: ${anc.map((a) => `${a.id} ${cut(a.title, 40)}`).join(" < ")}`);
  const kids = b.kids.get(i.id) ?? [];
  if (kids.length) out.push(`kids: ${kids.map((k) => `${k.id} ${k.st} ${cut(k.title, 40)}`).join("; ")}`);
  if (i.deps.length) out.push(`deps: ${i.deps.map((d) => `${d} ${b.byId.get(d)?.st ?? "?"}`).join(" ")}`);
  const bl = b.blocks.get(i.id);
  if (bl?.length) out.push(`blocks: ${bl.join(" ")}`);
  const l = log.filter((x) => x.split(" ")[2] === id).slice(-5);
  if (l.length) out.push(`log: ${l.map((x) => x.slice(5, 10) + " " + x.split(" ").slice(1, 2).concat(x.split(" ").slice(3)).join(" ")).join("; ")}`);
  return out.join("\n");
}


export function next(b: Board, f: Filter, n = 5): Item[] {
  return query(b, { ...f, st: ["td"], ready: true }).filter(WORK).slice(0, f.limit ?? n);
}

/** Few-line brief for an agent starting work. Optional scope (^P3) and owner. */
export function brief(b: Board, f: Filter, now = today()): string {
  const scope = f.under ? b.under(f.under) : b.items;
  const cnt = (s: Status) => scope.filter((i) => i.st === s).length;
  const out = [`pm ${now} ${f.under ? `^${f.under} ` : ""}items ${scope.length}: ` +
    STATUSES.map((s) => `${s} ${cnt(s)}`).join(" ")];
  const sec = (label: string, items: Item[], max: number) => {
    if (!items.length) return;
    out.push(`${label} (${items.length}):`);
    for (const i of items.slice(0, max)) out.push(` ${row(b, i, 56)}`);
  };
  const inScope = (i: Item) => !f.under || scope.includes(i);
  const mine = f.owner ? b.items.filter((i) => inScope(i) && i.owner === f.owner && isOpen(i)).sort(sortItems) : [];
  sec(`@${f.owner}`, mine, 8);
  sec("ip", b.items.filter((i) => inScope(i) && i.st === "ip" && WORK(i) && !mine.includes(i)).sort(sortItems), 8);
  sec("blocked", b.items.filter((i) => inScope(i) && WORK(i) && b.isBlocked(i)).sort(sortItems), 5);
  const soon = parseDate("+7d", new Date(`${now}T12:00`));
  sec("due<=7d", b.items.filter((i) => inScope(i) && isOpen(i) && i.due && i.due <= soon).sort((a, c) => a.due!.localeCompare(c.due!)), 6);
  sec("next", next(b, { ...f, owner: undefined }), 5);
  return out.join("\n");
}

export const HELP = `pm: UniKey tracker. Reads: brief [^P3] [@me] | next [n] [filters] | ls [filters] | show ID | log [n] | check
Writes: add +T ^P3 p1 #tag | Title   set T42 dn   do "op" "op"... (or ops on stdin, one per line)
Filters: td ip bl oh dn dr  p0-p3  P T S D B M  #tag  ^P3(under)  @owner  g:grp  ready blocked waiting overdue all  n:20  words
Tokens: status pN @owner ^parent #tag g:grp s:/d:/x:date(YYYY-MM-DD|MM-DD|today|+3d) <dep ~rel =dup &ref ; -X removes ; | title
Kinds: P project T task S subtask D todo B bug M milestone. $1 = id of 1st add in batch. PM_WHO=name sets the log author.
Git: commit [rev] logs a commit (run by the post-commit hook); "T43 dn" pairs in the message set status.`;

/** Log a commit; apply `<ID> <status>` pairs in its message to items that exist. */
export function commitHook(store: Store, rev = "HEAD", now = new Date()): string {
  let raw: string;
  try {
    raw = execFileSync("git", ["log", "-1", "--format=%h%x00%s%x00%B", rev], { encoding: "utf8" });
  } catch { return "err not a git commit"; }
  const [sha, subj, body] = raw.split("\0");
  return store.locked(() => {
    const b = store.load();
    const known = (id: string) => b.byId.has(id);
    const pairs = [...body.matchAll(/\b([PTSDBM]\d+) (td|ip|bl|oh|dn|dr)\b/g)].filter((m) => known(m[1]));
    const ids = [...new Set([...body.matchAll(/\b[PTSDBM]\d+\b/g)].map((m) => m[0]).filter(known))];
    const out: string[] = [];
    if (pairs.length) {
      const res = applyOps(b, pairs.map((m) => `${m[1]} ${m[2]}`), "git", now);
      if (res.errors.length) out.push(...res.errors);
      else { store.save(new Board(b.items)); store.appendLog(res.log); out.push(`ok ${res.ids.join(" ")}`); }
    }
    const note = `commit ${sha} ${subj.slice(0, 80)}`;
    store.appendLog((ids.length ? ids : ["-"]).map((id) => `${stamp(now)} git ${id} ${note}`));
    return out.join("\n") || "ok";
  });
}

/** Shared command runner for CLI and MCP. Returns terse text. */
export function run(store: Store, argv: string[], stdin?: string, by = whoami()): string {
  const [cmd = "brief", ...rest] = argv;
  const b = () => store.load();
  switch (cmd) {
    case "brief": return brief(b(), parseFilter(rest));
    case "next": {
      const n = /^\d+$/.test(rest[0] ?? "") ? Number(rest.shift()) : 5;
      const bd = b();
      return next(bd, parseFilter(rest), n).map((i) => row(bd, i)).join("\n") || "none";
    }
    case "ls": case "q": {
      const bd = b();
      return query(bd, parseFilter(rest)).map((i) => row(bd, i)).join("\n") || "none";
    }
    case "show": return rest.map((id) => show(b(), id, store.readLog())).join("\n--\n");
    case "log": return store.readLog(Number(rest[0] ?? 15)).join("\n") || "none";
    case "check": return b().check().join("\n") || "ok";
    case "commit": return commitHook(store, rest[0] ?? "HEAD");
    case "add": return store.write([`${rest.join(" ")}`.replace(/^(?!\+)/, "+")], by);
    case "set": return store.write([rest.join(" ")], by);
    case "do": {
      const ops = rest.length ? rest : (stdin ?? "").split("\n");
      return store.write(ops, by);
    }
    case "help": case "-h": case "--help": return HELP;
    default: return `err unknown command ${cmd}\n${HELP}`;
  }
}
