// Real MCP client call against the stdio server, on a throwaway copy of the data.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const here = path.dirname(new URL(import.meta.url).pathname);
const data = fs.mkdtempSync(path.join(os.tmpdir(), "pm-mcp-"));
for (const f of ["items.md", "log.md"]) fs.copyFileSync(path.join(here, "../data", f), path.join(data, f));

const transport = new StdioClientTransport({
  command: "node", args: ["--no-warnings", path.join(here, "../src/cli.ts"), "mcp"], env: { ...process.env, PM_DATA: data },
});
const client = new Client({ name: "pm-check", version: "1.0.0" });
await client.connect(transport);
const text = (r) => r.content.map((c) => c.text).join("");
const { tools } = await client.listTools();
console.log("tools:", tools.map((t) => t.name).join(" "));
console.log(text(await client.callTool({ name: "pm_q", arguments: { cmd: "brief @viraj" } })).split("\n").slice(0, 4).join("\n"));
const w = await client.callTool({ name: "pm_w", arguments: { ops: "+B ^P3 p1 #app | MCP check bug\n$1 ip", by: "mcp-check" } });
console.log("write:", text(w));
console.log("ro guard:", text(await client.callTool({ name: "pm_q", arguments: { cmd: "set T1 dn" } })));
console.log("show:", text(await client.callTool({ name: "pm_q", arguments: { cmd: "ls B ip" } })));
await client.close();
fs.rmSync(data, { recursive: true });
