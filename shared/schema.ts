import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bingoGames = pgTable("bingo_games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  cells: jsonb("cells").$type<string[]>().notNull(),
  size: integer("size").notNull().default(5),
  creator: text("creator").notNull(),
  isRandom: boolean("is_random").notNull().default(false),
  shareCode: text("share_code").notNull().unique(),
  calledNumbers: jsonb("called_numbers").$type<string[]>().notNull().default([]),
  currentNumber: text("current_number"),
  isGameMaster: boolean("is_game_master").notNull().default(false),
});

export const insertBingoGameSchema = createInsertSchema(bingoGames).omit({
  id: true,
  shareCode: true,
  calledNumbers: true,
  currentNumber: true,
});

export type InsertBingoGame = z.infer<typeof insertBingoGameSchema>;
export type BingoGame = typeof bingoGames.$inferSelect;

export const bingoCards = pgTable("bingo_cards", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull(),
  cells: jsonb("cells").$type<string[][]>().notNull(),
  playerName: text("player_name").notNull(),
  isWinner: boolean("is_winner").notNull().default(false),
});

export const insertBingoCardSchema = createInsertSchema(bingoCards).omit({
  id: true,
});

export type InsertBingoCard = z.infer<typeof insertBingoCardSchema>;
export type BingoCard = typeof bingoCards.$inferSelect;