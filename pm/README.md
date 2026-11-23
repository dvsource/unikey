# pm: the UniKey project tracker

One board for every Claude session and for Viraj. Sessions write to it through the MCP server or the CLI. Viraj watches a read-only dashboard. Nobody edits `pm/data/` by hand.

- **Dashboard:** `pm/bin/pm serve`, then open http://localhost:4477 (`pm serve 5000` for another port). It has Overview, Kanban, Graph and Gantt views. It is read-only, serves GET requests on 127.0.0.1 only, and updates live when the data changes.
- **MCP server:** `pm`, registered in the repo-root `.mcp.json`. It has two tools: `pm_q` (read) and `pm_w` (write).
- **CLI:** `pm/bin/pm <cmd>`. Needs Node ≥ 23.6, which runs the TypeScript directly. There is no build step and no runtime dependencies.
- **Tests:** `cd pm && npm test` runs the core library tests. `npm run check:mcp` makes a real MCP SDK client call against the server, using a throwaway copy of the data (needs `npm install` first, for the SDK dev dependency).

## Cheapest calling pattern

| When | MCP | CLI | Returns |
|---|---|---|---|
| Session start | `pm_q {cmd:"brief @me"}` | `pm brief @me` | about 15 lines: counts, your items, in progress, blocked, due soon, next |
| Pick work in one project | `pm_q {cmd:"next 3 ^P4"}` | `pm next 3 ^P4` | 3 lines |
| Start, finish, block | `pm_w {ops:"T43 ip @me", by:"me"}` | `pm set 'T43 ip @me'` | `ok T43` |
| Several changes at once | `pm_w {ops:"T43 dn\n+B ^P4 p1 #engine \| Bug\n+S ^T43 \| Follow-up"}` | `pm do 'T43 dn' '+B ^P4 \| Bug'` | `ok T43 B5 S26` |
| Look at one item | `pm_q {cmd:"show T27"}` | `pm show T27` | the line, its parent chain, children, deps, what it blocks, recent log |

A typical end-of-task update closes a task and files a bug in one call. It takes 108 characters of arguments, `{"ops":"T43 dn\n+B ^P4 p1 #engine &engine/src/state.ts | migrate accepts partial v1 save","by":"engine-sess"}`, and the reply is `ok T43 B5` (9 characters). `brief` is about 1.2 KB for the whole board and shrinks when you scope it (`brief ^P4`).

Rules of thumb:
- Batch every write for a turn into one `pm_w` call. A batch is atomic: if any op fails, nothing is written and you get `err <op#>: <reason>`.
- In a batch, `$1` is the id of the first `+` add, `$2` the second, and so on: `+T ^P4 | Parent` then `+S ^$1 | Child`.
- Set `by` (MCP) or `PM_WHO` (CLI) to your session name, so the activity log says who did what.
- On the CLI, wrap each op in single quotes, because `<`, `#`, `|` and `^` are shell syntax.

## Grammar

Every item is one line in `data/items.md`:

```
- T42 ip p1 @viraj ^P3 #app #qa g:pre s:2026-11-20 d:2026-12-06 x:2026-12-05 <T40,T41 ~T7 =B3 &docs/x.md | Title || Why it exists
```

| Token | Meaning |
|---|---|
| `T42` | id. The kind is the prefix: `P` project or sub-project (a P with a P parent), `T` task, `S` sub-task, `D` todo, `B` bug, `M` milestone |
| `td ip bl oh dn dr` | status: todo, in-progress, blocked, on-hold, done, dropped. Long names (`done`, `on-hold`) work too |
| `p0`…`p3` | priority, where p0 is the highest. The default is p2 |
| `@name` | owner, for example `viraj`, `wife`, or a session name |
| `^ID` | parent |
| `#tag` | tag; you can give several |
| `g:name` | group, for example `g:later` |
| `s:` `d:` `x:` | start, due and done dates. They take `YYYY-MM-DD`, `MM-DD`, `today`, `+3d` or `+2w` |
| `<A,B` | depends on. "Blocks" is the inverse and is computed |
| `~A` `=B` | relates to, and duplicates (for bugs) |
| `&path` | a ref: a repo-relative path (`docs/decisions/0048-….md`) or a URL; you can give several |
| `\| text` | the one-line title. In a set op, it replaces the title |
| `\|\| text` | the why: one short line saying why the item exists or matters (cite the DR or doc, mark guesses "(guess)"). **Every new item needs one.** In a set op, `T42 \|\| text` replaces only the why; ops that omit it keep it; `-w` clears it. `show` prints it; `brief`, `ls` and `next` don't |

Removing: `-w` (the why), `-#tag`, `-<T40`, `-~T7`, `-=B3`, `-&ref`, and `-&` alone clears every ref. `-@`, `-^`, `-p`, `-g:`, `-s:`, `-d:` and `-x:` clear the field.

Automatic: moving an item to `dn` sets `x:` to today, and moving it to `ip` sets `s:` to today, when the date isn't already set. Every write appends `<time> <by> <id> <change>` to `data/log.md`. Writes are checked for unknown ids and dependency cycles.

Filters for `ls`, `next` and `brief` can be combined:
- status codes (`ip bl`), priorities (`p0 p1`) and kind letters (`T B`): several values of one kind match any of them
- `#tag` and `^P3`, where `^P3` matches anything under P3 at any depth
- `@owner` and `g:group`
- `ready`: open, with every dependency done or dropped
- `waiting`: todo, with an open dependency
- `blocked`: status bl, or in progress with an open dependency
- `overdue`
- `all`, to include done and dropped items (otherwise they are hidden unless you ask for their status)
- `n:20` to limit the results
- any other word is a text search

`pm check` validates the references and reports dependency cycles.

## Storage and concurrency

- `data/items.md` holds the board and `data/log.md` the append-only activity log. Both are plain text with one entry per line, so git diffs and merges stay line-sized.
- Writes take a lock (`data/.lock`), re-read the file, apply the batch, and then replace the file atomically (they write a temporary file and rename it). Parallel sessions can't overwrite each other.
- A session in a git worktree writes to the **main checkout's** `pm/data`, which is found with `git rev-parse --git-common-dir`, so there is still one board. Set `PM_DATA=/path` to override this (the tests do).

## Layout

| Path | What |
|---|---|
| `src/core.ts` | the only logic: parse/format, the store and lock, ops, relations, filters, brief |
| `src/cli.ts`, `bin/pm` | the CLI |
| `src/mcp.ts` | the stdio MCP server (JSON-RPC, with no SDK at runtime) |
| `src/serve.ts`, `src/ui.html` | the dashboard server (`/`, `/data`, `/events` SSE, and `/repo/<path>` serving refs as plain text) and its single-page UI in the Dawn colours |
| `test/` | `core.test.ts` (node:test) and `mcp-check.mjs` (an SDK client) |

The dashboard is standalone so that it can later be linked or mounted as a panel of the planned `/admin` page ([DR-0046](../docs/decisions/0046-narrow-admin-page-reuse-tools.md)); that page was never built.

## Automatic sync

- **Session start:** `.claude/settings.json` has a SessionStart hook that runs `pm brief` and puts the board into every new session's context.
- **Commits:** `pm/hooks/post-commit` (enabled with `git config core.hooksPath pm/hooks`, once per clone) runs `pm commit`. Every commit is logged, under each item ID its message mentions or under `-` when it mentions none. `<ID> <status>` pairs such as `T43 dn` set that item's status. Write them in the commit body.
