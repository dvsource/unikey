// Read-only dashboard: GET only, bound to 127.0.0.1. Serves the UI, the board as JSON,
// a change stream (SSE) driven by fs.watch, and repo files as plain text for refs.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Store, kindOf, today } from "./core.ts";

const UI = path.join(path.dirname(fileURLToPath(import.meta.url)), "ui.html");

export function boardJson(store: Store): string {
  const b = store.load();
  const items = b.items.map((i) => ({
    ...i,
    kind: kindOf(i.id),
    blocks: b.blocks.get(i.id) ?? [],
    openDeps: b.openDeps(i),
    ready: b.isReady(i),
    blocked: b.isBlocked(i),
    waiting: b.isWaiting(i),
    overdue: b.isOverdue(i),
    progress: kindOf(i.id) === "P" ? b.progress(i.id) : undefined,
  }));
  const log = store.readLog().map((l) => {
    const [ts, by, id, ...rest] = l.split(" ");
    return { ts, by, id, ch: rest.join(" ") };
  });
  return JSON.stringify({ today: today(), items, log });
}

export function serve(store: Store, port: number): http.Server {
  const repo = path.resolve(store.dir, "..", "..");
  const clients = new Set<http.ServerResponse>();
  let timer: NodeJS.Timeout | undefined;
  fs.watch(store.dir, () => {
    clearTimeout(timer);
    timer = setTimeout(() => { for (const c of clients) c.write("data: change\n\n"); }, 150);
  });

  const server = http.createServer((req, res) => {
    if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405).end("read-only"); return; }
    const url = new URL(req.url ?? "/", "http://x");
    if (url.pathname === "/") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(fs.readFileSync(UI));
    } else if (url.pathname === "/data") {
      res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" }).end(boardJson(store));
    } else if (url.pathname === "/events") {
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" });
      res.write("retry: 2000\n\n");
      clients.add(res);
      req.on("close", () => clients.delete(res));
    } else if (url.pathname.startsWith("/repo/")) {
      // refs: repo files as plain text, never outside the repo, no dotfiles
      const rel = decodeURIComponent(url.pathname.slice(6));
      const abs = path.resolve(repo, rel);
      if (!abs.startsWith(repo + path.sep) || rel.split("/").some((s) => s.startsWith(".")) || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
        res.writeHead(404).end("not found");
      } else {
        res.writeHead(200, { "content-type": "text/plain; charset=utf-8" }).end(fs.readFileSync(abs));
      }
    } else {
      res.writeHead(404).end("not found");
    }
  });
  server.listen(port, "127.0.0.1", () => process.stdout.write(`pm dashboard: http://localhost:${port}  (data: ${store.dir})\n`));
  return server;
}
