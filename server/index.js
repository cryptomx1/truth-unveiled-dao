import { createServer } from "./vite";
const PORT = Number(process.env.PORT) || 5001;
const ENV = process.env.NODE_ENV || "development";
async function start() {
    try {
        const { app } = await createServer();
        const server = app.listen(PORT, () => {
            console.log(`🚀 ${ENV} server listening on http://localhost:${PORT}`);
        });
        server.on("error", (err) => {
            if (err && err.code === "EADDRINUSE") {
                console.error(`❌ Port ${PORT} is already in use. Kill it or choose a different PORT.`);
            }
            else {
                console.error("❌ Server error:", err);
            }
            process.exit(1);
        });
        process.on("uncaughtException", (err) => {
            console.error("❌ uncaughtException:", err);
        });
        process.on("unhandledRejection", (err) => {
            console.error("❌ unhandledRejection:", err);
        });
    }
    catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
}
start();
