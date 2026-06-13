import { createServer, type Server } from "node:http";

/**
 * Minimal HTTP server exposing `/healthz` for Railway's healthcheck. Kept
 * dependency-free and synchronous: if the process can answer, it's alive.
 */
export function startHealthServer(port: number): Server {
  const server = createServer((req, res) => {
    if (req.url === "/healthz") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "not_found" }));
  });
  server.listen(port);
  return server;
}
