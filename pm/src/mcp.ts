// pm MCP server (stdio, JSON-RPC 2.0, newline-delimited). Two tools; output is the CLI's terse text.
import readline from "node:readline";
import { Store, run, HELP } from "./core.ts";

const store = new Store();
const tools = [
  {
    name: "pm_q",
    description: `Read the UniKey tracker. cmd is a pm read command: "brief [^P3] [@me]", "next [n] [filters]", "ls <filters>", "show T42", "log [n]".\n${HELP}`,
    inputSchema: { type: "object", properties: { cmd: { type: "string" } }, required: ["cmd"] },
  },
  {
    name: "pm_w",
    description: `Write to the UniKey tracker, atomically. ops: one op per line, e.g. "T42 dn" or "+B ^P3 p1 #app | Title" ($1 = id of the 1st add). Returns "ok <ids>". by = your session name (log author).`,
    inputSchema: {
      type: "object",
      properties: { ops: { type: "string" }, by: { type: "string" } },
      required: ["ops"],
    },
  },
];

const READS = new Set(["brief", "next", "ls", "q", "show", "log", "check", "help"]);

function call(name: string, args: Record<string, string>): string {
  if (name === "pm_q") {
    const argv = (args.cmd ?? "brief").trim().split(/\s+/);
    if (!READS.has(argv[0])) return `err pm_q is read-only; use pm_w`;
    return run(store, argv);
  }
  if (name === "pm_w") return store.write((args.ops ?? "").split("\n"), args.by || process.env.PM_WHO || "agent");
  throw new Error(`unknown tool ${name}`);
}

const send = (m: object) => process.stdout.write(JSON.stringify(m) + "\n");
const rl = readline.createInterface({ input: process.stdin });
rl.on("line", (line) => {
  if (!line.trim()) return;
  let msg: { id?: number | string; method?: string; params?: any };
  try { msg = JSON.parse(line); } catch { return send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } }); }
  const { id, method, params } = msg;
  if (id === undefined) return; // notification
  const ok = (result: object) => send({ jsonrpc: "2.0", id, result });
  switch (method) {
    case "initialize":
      return ok({
        protocolVersion: params?.protocolVersion ?? "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: { name: "pm", version: "1.0.0" },
        instructions: "UniKey project tracker. Start with pm_q {cmd:\"brief\"}. Keep your task's status current with pm_w.",
      });
    case "ping": return ok({});
    case "tools/list": return ok({ tools });
    case "tools/call": {
      try {
        const text = call(params?.name, params?.arguments ?? {});
        return ok({ content: [{ type: "text", text }], isError: text.startsWith("err") });
      } catch (e) {
        return ok({ content: [{ type: "text", text: `err ${(e as Error).message}` }], isError: true });
      }
    }
    default:
      return send({ jsonrpc: "2.0", id, error: { code: -32601, message: `no method ${method}` } });
  }
});
