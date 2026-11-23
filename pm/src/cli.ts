// pm CLI: `pm brief`, `pm ls ip #engine`, `pm do 'T42 dn' '+B ^P3 | ...'`, `pm serve`, `pm mcp`.
import fs from "node:fs";
import { Store, run } from "./core.ts";

const argv = process.argv.slice(2);
const cmd = argv[0];
if (cmd === "serve") {
  const { serve } = await import("./serve.ts");
  serve(new Store(), Number(argv[1] ?? process.env.PM_PORT ?? 4477));
} else if (cmd === "mcp") {
  await import("./mcp.ts");
} else {
  const stdin = cmd === "do" && argv.length === 1 && !process.stdin.isTTY ? fs.readFileSync(0, "utf8") : undefined;
  const out = run(new Store(), argv, stdin);
  process.stdout.write(out + "\n");
  if (out.startsWith("err")) process.exitCode = 1;
}
