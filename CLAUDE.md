# UniKey

## Project tracker

One tracker for all sessions: `pm/` (MCP server `pm`, or the CLI `pm/bin/pm`). Grammar and cheap calls: [pm/README.md](pm/README.md).
- Start: `pm_q {cmd:"brief @<your-session-name>"}` (CLI: `pm/bin/pm brief`); `next ^P4` for a project's ready work.
- Starting a task: `pm_w {ops:"T42 ip @<you>", by:"<you>"}`; finishing: `"T42 dn"`. Blocked: `"T42 bl <T40"`.
- Add what you find, one batch: `"+T ^P4 p1 #engine | Title"`, `"+S ^T42 | Sub-task"`, `"+B ^P3 &app/src/x.ts | Bug"`.
- Never edit `pm/data/` by hand. Quote CLI ops in single quotes (`<`, `#`, `|` are shell syntax).
