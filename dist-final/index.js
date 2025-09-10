// server/vite.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function createServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === "production";
  app.get("/healthz", (_req, res) => res.status(204).end());
  if (isProd) {
    const distPath = path.resolve(__dirname, "../client/dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await import("vite");
    const viteServer = await vite.createServer({
      server: { middlewareMode: true },
      root: path.resolve(__dirname, "../client")
    });
    app.use(viteServer.middlewares);
  }
  return { app };
}

// server/index.ts
var PORT = Number(process.env.PORT) || 5001;
var ENV = process.env.NODE_ENV || "development";
async function start() {
  try {
    const { app } = await createServer();
    const server = app.listen(PORT, () => {
      console.log(`\u{1F680} ${ENV} server listening on http://localhost:${PORT}`);
    });
    server.on("error", (err) => {
      if (err && err.code === "EADDRINUSE") {
        console.error(`\u274C Port ${PORT} is already in use. Kill it or choose a different PORT.`);
      } else {
        console.error("\u274C Server error:", err);
      }
      process.exit(1);
    });
    process.on("uncaughtException", (err) => {
      console.error("\u274C uncaughtException:", err);
    });
    process.on("unhandledRejection", (err) => {
      console.error("\u274C unhandledRejection:", err);
    });
  } catch (err) {
    console.error("\u274C Failed to start server:", err);
    process.exit(1);
  }
}
start();
