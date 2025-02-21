import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertBingoGameSchema, insertBingoCardSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express) {
  app.post("/api/games", async (req, res) => {
    try {
      console.log("Received request body:", req.body); // Log the request body
      const gameData = insertBingoGameSchema.parse(req.body);
      console.log("Parsed game data:", gameData); // Log the parsed game data
      const game = await storage.createGame(gameData);
      console.log("Created game:", game); // Log the created game
      res.json(game);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Validation error:", error.errors); // Log validation errors
        res.status(400).json({ message: "Invalid game data" });
        return;
      }
      console.error("Unexpected error:", error); // Log unexpected errors
      throw error;
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    const game = await storage.getGame(Number(req.params.id));
    if (!game) {
      res.status(404).json({ message: "Game not found" });
      return;
    }
    res.json(game);
  });

  // Fix: Update the share code route
  app.get("/api/games/share/:code", async (req, res) => {
    const shareCode = req.params.code;
    console.log("Received request for shareCode:", shareCode);
  
    const game = await storage.getGameByShareCode(shareCode);
  
    if (!game) {
      console.log("Game not found in storage for shareCode:", shareCode);
      res.status(404).json({ message: "Game not found" });
      return;
    }
    res.json(game);
  });
app.post("/api/cards", async (req, res) => {
    try {
      const cardData = insertBingoCardSchema.parse(req.body);
      const card = await storage.createCard(cardData);
      res.json(card);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid card data" });
        return;
      }
      throw error;
    }
  });

  app.get("/api/games/:gameId/cards", async (req, res) => {
    const cards = await storage.getCardsByGameId(Number(req.params.gameId));
    res.json(cards);
  });

  app.patch("/api/cards/:id/winner", async (req, res) => {
    try {
      const card = await storage.updateCardWinner(Number(req.params.id), true);
      res.json(card);
    } catch (error) {
      res.status(404).json({ message: "Card not found" });
    }
  });

  return createServer(app);
}