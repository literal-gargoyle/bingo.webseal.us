import { nanoid } from "nanoid";
import { BingoGame, BingoCard, InsertBingoGame, InsertBingoCard } from "@shared/schema";

export interface IStorage {
  createGame(game: InsertBingoGame): Promise<BingoGame>;
  getGame(id: number): Promise<BingoGame | undefined>;
  getGameByShareCode(code: string): Promise<BingoGame | undefined>;
  createCard(card: InsertBingoCard): Promise<BingoCard>;
  getCard(id: number): Promise<BingoCard | undefined>;
  getCardsByGameId(gameId: number): Promise<BingoCard[]>;
  updateCardWinner(id: number, isWinner: boolean): Promise<BingoCard>;
}

export class MemStorage implements IStorage {
  private games: Map<number, BingoGame>;
  private cards: Map<number, BingoCard>;
  private currentGameId: number;
  private currentCardId: number;

  constructor() {
    this.games = new Map();
    this.cards = new Map();
    this.currentGameId = 1;
    this.currentCardId = 1;
  }

  async createGame(insertGame: InsertBingoGame): Promise<BingoGame> {
    const id = this.currentGameId++;
    const shareCode = nanoid(6); // Generates a unique 6-character share code
    const game: BingoGame = {
      id,
      shareCode,
      title: insertGame.title,
      description: insertGame.description ?? null,
      cells: insertGame.cells as string[],
      size: insertGame.size ?? 0,
      creator: insertGame.creator,
      isRandom: insertGame.isRandom ?? false,
      calledNumbers: [],
      currentNumber: null,
      isGameMaster: false
    };
    this.games.set(id, game);

    console.log(`Created game with ID: ${id}, ShareCode: ${shareCode}`);
    return game;
  }

  async getGame(id: number): Promise<BingoGame | undefined> {
    return this.games.get(id);
  }

  async getGameByShareCode(code: string): Promise<BingoGame | undefined> {
    console.log("Looking for game with shareCode:", code);
    
    const allGames = Array.from(this.games.values());
    console.log("All stored games:", allGames.map(game => ({ id: game.id, shareCode: game.shareCode })));

    const game = allGames.find(game => game.shareCode === code);
    
    if (!game) {
        console.log("Game not found for shareCode:", code);
    } else {
        console.log("Game found:", game);
    }
  
    return game;
}


  async createCard(insertCard: InsertBingoCard): Promise<BingoCard> {
    const id = this.currentCardId++;
    const card: BingoCard = {
      id,
      gameId: insertCard.gameId,
      cells: insertCard.cells as string[][],
      playerName: insertCard.playerName,
      isWinner: insertCard.isWinner || false,
    };
    this.cards.set(id, card);
    return card;
  }

  async getCard(id: number): Promise<BingoCard | undefined> {
    return this.cards.get(id);
  }

  async getCardsByGameId(gameId: number): Promise<BingoCard[]> {
    return Array.from(this.cards.values()).filter(card => card.gameId === gameId);
  }

  async updateCardWinner(id: number, isWinner: boolean): Promise<BingoCard> {
    const card = await this.getCard(id);
    if (!card) throw new Error("Card not found");

    const updatedCard = { ...card, isWinner };
    this.cards.set(id, updatedCard);
    return updatedCard;
  }
}

export const storage = new MemStorage();
