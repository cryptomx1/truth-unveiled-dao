import express from "express";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function createServer() {
    const app = express();
    const isProd = process.env.NODE_ENV === "production";
    // health endpoint for quick checks
    app.get("/healthz", (_req, res) => res.status(204).end());
    if (isProd) {
        const distPath = path.resolve(__dirname, "../client/dist");
        app.use(express.static(distPath));
        app.get("*", (_req, res) => {
            res.sendFile(path.join(distPath, "index.html"));
        });
    }
    else {
        const vite = await import("vite");
        const viteServer = await vite.createServer({
            server: { middlewareMode: true },
            root: path.resolve(__dirname, "../client"),
        });
        app.use(viteServer.middlewares);
    }
    return { app };
}
