import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import helmet from "helmet";
import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());
  
  // Basic security, but allow inline scripts for Vite in dev
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: "connected" });
  });

  // Auth Routes (Placeholder)
  app.post("/api/auth/login", async (req, res) => {
    res.status(501).json({ message: "Not implemented yet" });
  });

  // Services Routes
  app.get("/api/servicos", async (req, res) => {
    try {
      const servicos = await prisma.servico.findMany({ where: { ativo: true } });
      res.json(servicos);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar serviços" });
    }
  });

  // Barbeiros Routes
  app.get("/api/barbeiros", async (req, res) => {
    try {
      const barbeiros = await prisma.barbeiro.findMany({
        include: { usuario: true },
        where: { ativo: true }
      });
      res.json(barbeiros);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar barbeiros" });
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
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
