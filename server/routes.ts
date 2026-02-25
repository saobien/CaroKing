import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { setupGameWebSocket } from "./game-server";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  setupGameWebSocket(httpServer);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return httpServer;
}
