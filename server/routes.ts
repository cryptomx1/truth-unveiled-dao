import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPollSchema, insertPollResponseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Poll routes
  app.get("/api/polls", async (req, res) => {
    try {
      const polls = await storage.getPolls();
      res.json(polls);
    } catch (error) {
      console.error("Failed to fetch polls:", error);
      res.status(500).json({ error: "Failed to fetch polls" });
    }
  });

  app.get("/api/polls/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid poll ID" });
    }

    try {
      const poll = await storage.getPoll(id);
      if (!poll) {
        return res.status(404).json({ error: "Poll not found" });
      }

      const responses = await storage.getPollResponses(id);
      res.json({ poll, responses });
    } catch (error) {
      console.error("Failed to fetch poll:", error);
      res.status(500).json({ error: "Failed to fetch poll" });
    }
  });

  app.post("/api/polls", async (req, res) => {
    try {
      // Parse and transform date fields
      const rawData = req.body;
      if (rawData.expiresAt && typeof rawData.expiresAt === 'string') {
        rawData.expiresAt = new Date(rawData.expiresAt);
      }
      
      const pollData = insertPollSchema.parse(rawData);
      const poll = await storage.createPoll(pollData);
      res.json(poll);
    } catch (error) {
      console.error("Failed to create poll:", error);
      res.status(400).json({ error: "Invalid poll data" });
    }
  });

  app.post("/api/polls/:id/responses", async (req, res) => {
    const pollId = parseInt(req.params.id);
    if (isNaN(pollId)) {
      return res.status(400).json({ error: "Invalid poll ID" });
    }

    try {
      const responseData = insertPollResponseSchema.parse({ ...req.body, pollId });
      const response = await storage.createPollResponse(responseData);
      res.json(response);
    } catch (error) {
      console.error("Failed to create poll response:", error);
      res.status(400).json({ error: "Invalid response data" });
    }
  });

  // Phase IV: Environment config endpoint for Piñata credentials
  app.get('/api/env-config', (req, res) => {
    const config = {
      PINATA_API_KEY: process.env.PINATA_API_KEY || '',
      PINATA_SECRET_KEY: process.env.PINATA_SECRET_KEY || ''
    };
    
    res.json(config);
  });

  const httpServer = createServer(app);

  return httpServer;
}
