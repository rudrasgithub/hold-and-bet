import { Request, Response, Router } from "express";
import { prisma } from "../config/prismaClient";
import { redisClient } from "../config/redisClient";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.get("/status", authenticate, async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const totalMatches = await prisma.game.count({ where: { userId } });
    const totalWins = await prisma.transaction.count({
      where: { userId, type: "BetWin" },
    });
    const totalLosses = totalMatches - totalWins;

    res.status(200).json({
      totalMatches,
      totalWins,
      totalLosses,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game stats", details: error });
  }
});

router.post("/", authenticate, async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const game = await prisma.game.create({
      data: {
        userId,
        status: "Active",
        bets: [],
      },
    });

    await redisClient.set(`game:${game.id}`, JSON.stringify(game));

    res.status(201).json({ message: "Game created successfully", game });
  } catch (error) {
    res.status(500).json({ error: "Failed to create game", details: error });
  }
});

router.get("/", authenticate, async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const games = await prisma.game.findMany({
      where: { userId },
    });

    res.status(200).json({ games });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch games", details: error });
  }
});

router.get("/:gameId", authenticate, async (req: Request, res: Response) => {
  const gameId = parseInt(req.params.gameId);

  try {
    const cachedGame = await redisClient.get(`game:${gameId}`);
    if (cachedGame) return res.status(200).json(JSON.parse(cachedGame));

    const game = await prisma.game.findUnique({ where: { id: gameId } });

    if (!game) return res.status(404).json({ error: "Game not found" });

    await redisClient.set(`game:${game.id}`, JSON.stringify(game));

    res.status(200).json({ game });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game", details: error });
  }
});

router.post("/:gameId/bet", authenticate, async (req: Request, res: Response) => {
  const gameId = parseInt(req.params.gameId);
  const { bet } = req.body;

  try {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || game.status !== "Active") {
      return res.status(400).json({ error: "Game is not active or does not exist" });
    }

    const gameState = JSON.parse((await redisClient.get(`game:${gameId}`)) || "{}");
    gameState.bets.push(bet);

    await redisClient.set(`game:${gameId}`, JSON.stringify(gameState));
    await prisma.game.update({
      where: { id: gameId },
      data: { bets: gameState.bets },
    });

    res.status(200).json({ message: "Bet placed successfully", game: gameState });
  } catch (error) {
    res.status(500).json({ error: "Failed to place bet", details: error });
  }
});

router.put("/:gameId/complete", authenticate, async (req: Request, res: Response) => {
  const gameId = parseInt(req.params.gameId);

  try {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || game.status !== "Active") {
      return res.status(400).json({ error: "Game is not active or does not exist" });
    }

    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: { status: "Completed" },
    });

    await redisClient.del(`game:${gameId}`);

    res.status(200).json({ message: "Game completed successfully", game: updatedGame });
  } catch (error) {
    res.status(500).json({ error: "Failed to complete game", details: error });
  }
});

router.put("/:gameId/end", authenticate, async (req: Request, res: Response) => {
  const gameId = parseInt(req.params.gameId);
  const userId = req.user.id;

  try {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || game.status !== "Active") {
      return res.status(400).json({ error: "Game is not active or does not exist" });
    }

    const { winnerId, amountWon } = calculateGameResult(game);

    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: { status: "Completed" },
    });

    await prisma.transaction.create({
      data: {
        userId,
        amount: amountWon,
        type: amountWon > 0 ? "BetWin" : "BetLoss",
        gameId,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: amountWon } },
    });

    await redisClient.del(`game:${gameId}`);

    res.status(200).json({
      message: "Game concluded successfully",
      game: updatedGame,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to conclude game", details: error });
  }
});

function calculateGameResult(game: any) {
  const winnerId = game.userId; // Example logic
  const amountWon = 100; // Example amount won
  return { winnerId, amountWon };
}

export default router;
