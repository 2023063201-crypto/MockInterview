import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes go here
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/export-zip", async (req, res) => {
    try {
      const archiver = (await import("archiver")).default;
      res.attachment("project.zip");
      const archive = archiver("zip", { zlib: { level: 9 } });

      archive.on("error", (err) => {
        if (!res.headersSent) res.status(500).send({ error: err.message });
      });

      archive.pipe(res);

      archive.glob("**/*", {
        cwd: process.cwd(),
        ignore: ["node_modules/**", "dist/**", ".git/**"],
        dot: true
      });

      await archive.finalize();
    } catch (err) {
      if (!res.headersSent) res.status(500).send({ error: "Failed to export zip" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
