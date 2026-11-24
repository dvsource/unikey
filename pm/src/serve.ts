// The pm web app, bound to 127.0.0.1: several pages behind one small site nav (T125).
// - /tracker: the project tracker board. Read-only: GET only; /data (the board as JSON), /events (SSE, fs.watch) and
//   /repo/<path> (repo files as plain text for refs) serve it.
// - /playground: the engine playground (T126). Its API (/api/engine/*) runs the real engine on a sandbox student and
//   never writes anything: not the tracker data, not the repo. It is the only place a POST is accepted.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Store, kindOf, today } from "./core.ts";

const PAGES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "pages");

/** The site's pages, in nav order. Each is `pages/<file>`; its `<!--site-nav-->` is replaced by the nav. */
export const PAGES = [
  { path: "/tracker", file: "tracker.html", title: "Tracker", blurb: "The project board: overview, kanban, graph and gantt. Read-only." },
  { path: "/playground", file: "playground.html", title: "Engine playground", blurb: "Grade today's cards yourself and watch the engine re-plan today and the next 6 days." },
] as const;

export function siteNav(current: string): string {
  const links = PAGES.map((p) => `<a href="${p.path}"${p.path === current ? ' class="on" aria-current="page"' : ""}>${p.title}</a>`).join("");
  return `<nav class="site"><a href="/" class="home">UniKey</a>${links}</nav>`;
}

export function renderPage(file: string, current: string): string {
  return fs.readFileSync(path.join(PAGES_DIR, file), "utf8").replace("<!--site-nav-->", siteNav(current));
}

export function indexPage(): string {
  const cards = PAGES.map((p) => `<a class="pg" href="${p.path}"><b>${p.title}</b><span>${p.blurb}</span></a>`).join("");
  return renderPage("index.html", "/").replace("<!--pages-->", cards);
}

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

type Playground = typeof import("./playground.ts");
let pg: Promise<Playground> | null = null;
/** The playground loads the engine (TypeScript with `.js` specifiers): the resolve hook must be in place first. */
export function loadPlayground(): Promise<Playground> {
  pg ??= import("./engine-hooks.ts").then(() => import("./playground.ts"));
  return pg;
}

const MAX_BODY = 1_000_000;
function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((ok, fail) => {
    let size = 0;
    const parts: Buffer[] = [];
    req.on("data", (c: Buffer) => { size += c.length; if (size > MAX_BODY) { fail(new Error("body too large")); req.destroy(); } else parts.push(c); });
    req.on("end", () => ok(Buffer.concat(parts).toString("utf8")));
    req.on("error", fail);
  });
}

const json = (res: http.ServerResponse, code: number, body: unknown): void => {
  res.writeHead(code, { "content-type": "application/json", "cache-control": "no-store" }).end(JSON.stringify(body));
};

/** /api/engine/*: GET packs, GET card, POST run. Errors in the request are 400; anything else 500. */
async function engineApi(req: http.IncomingMessage, res: http.ServerResponse, url: URL): Promise<void> {
  const p = await loadPlayground();
  const route = `${req.method} ${url.pathname}`;
  try {
    if (route === "GET /api/engine/packs") {
      const { personas } = await import("../../engine/sim/personas.ts");
      return json(res, 200, { packs: p.packs(), personas: personas.map((x) => ({ id: x.id, name: x.name, grading: x.traits.grading ?? "honest" })) });
    }
    if (route === "GET /api/engine/card") {
      return json(res, 200, p.cardText(url.searchParams.get("pack") ?? "", url.searchParams.get("id") ?? "", Number(url.searchParams.get("variant") ?? 0)));
    }
    if (route === "POST /api/engine/run") {
      if (!/^application\/json\b/.test(req.headers["content-type"] ?? "")) return json(res, 415, { error: "send application/json" });
      let body: unknown;
      try { body = JSON.parse(await readBody(req)); } catch { return json(res, 400, { error: "the body is not JSON" }); }
      return json(res, 200, p.run(body));
    }
    json(res, 404, { error: "not found" });
  } catch (e) {
    if (e instanceof p.BadRequest) return json(res, 400, { error: e.message });
    json(res, 500, { error: String((e as Error)?.message ?? e) });
  }
}

export function serve(store: Store, port: number, opts: { quiet?: boolean } = {}): http.Server {
  const repo = path.resolve(store.dir, "..", "..");
  const clients = new Set<http.ServerResponse>();
  let timer: NodeJS.Timeout | undefined;
  const watcher = fs.watch(store.dir, () => {
    clearTimeout(timer);
    timer = setTimeout(() => { for (const c of clients) c.write("data: change\n\n"); }, 150);
  });

  const html = (res: http.ServerResponse, body: string) => res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(body);
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://x");
    if (url.pathname.startsWith("/api/engine/")) {
      if (req.method !== "GET" && req.method !== "POST") { res.writeHead(405).end("GET or POST"); return; }
      void engineApi(req, res, url);
      return;
    }
    // Everything else, the tracker included, is read-only.
    if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405).end("read-only"); return; }
    const page = PAGES.find((p) => p.path === url.pathname);
    if (url.pathname === "/") {
      html(res, indexPage());
    } else if (page) {
      html(res, renderPage(page.file, page.path));
    } else if (url.pathname === "/site.css") {
      res.writeHead(200, { "content-type": "text/css; charset=utf-8" }).end(fs.readFileSync(path.join(PAGES_DIR, "site.css")));
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
  server.on("close", () => { watcher.close(); for (const c of clients) c.end(); });
  server.listen(port, "127.0.0.1", () => {
    if (!opts.quiet) process.stdout.write(`pm web app: http://localhost:${(server.address() as { port: number }).port}  (tracker /tracker, engine playground /playground; data: ${store.dir})\n`);
  });
  return server;
}
