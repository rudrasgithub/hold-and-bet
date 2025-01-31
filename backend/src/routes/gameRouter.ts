import { Request, Response, Router } from 'express';
import { prisma } from '../config/prismaClient';
import { redisClient } from '../config/redisClient';
import authenticate, { CustomRequest } from '../middlewares/authMiddleware';
import {
  cardRecord,
  generateRandomCards,
  validHoldValues,
} from '../config/lib';

const router = Router();

router.post(
  '/newgame',
  authenticate,
  async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id;
    console.log('user id found');
    if (!userId) {
      res.status(400).json({ error: 'User ID not found' });
      return;
    }
    try {
      console.log('wallet');
      console.log(`${userId}`);
      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });
      if (!wallet || wallet.balance < 5) {
        console.log('no wallet');
        res.status(400).json({
          error:
            'Insufficient balance to start a new game. Minimum required: 5',
        });
        return;
      }

      const generatedCards = generateRandomCards();

      console.log('game query started');
      const game = await prisma.game.create({
        data: {
          userId,
          bets: {},
          generatedCards,
        },
      });

      await redisClient.set(
        `game:${game.id}`,
        JSON.stringify({
          generatedCards,
          bets: [],
          status: 'Active',
          holdedCard: 'None',
        })
      );
      const gameState = await redisClient.get(`game:${game.id}`);
      console.log(gameState);
      res.status(201).json({
        message: 'Game created successfully',
        game: {
          id: game.id,
          userId: game.userId,
          status: game.status,
          createdAt: game.createdAt,
          updatedAt: game.updatedAT,
        },
      });
      return;
    } catch (error) {
      res.status(500).json({ error: 'Failed to create game', details: error });
      return;
    }
  }
);

router.get('/:gameId', authenticate, async (req: Request, res: Response) => {
  const gameId = req.params.gameId;

  try {
    const cachedGame = await redisClient.get(`game:${gameId}`);
    console.log(cachedGame);
    if (cachedGame) {
      res.status(200).json(JSON.parse(cachedGame));
      return;
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } });

    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }

    await redisClient.set(`game:${game.id}`, JSON.stringify(game));

    res.status(200).json({ game });
    return;
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game', details: error });
    return;
  }
});

router.post(
  '/:gameId/hold',
  authenticate,
  async (req: Request, res: Response) => {
    const gameId = req.params.gameId;
    const { hold } = req.body;

    try {
      const gameState2 = (await redisClient.get(`game:${gameId}`)) || '{}';

      const gameState = JSON.parse(gameState2);

      if (!gameState || gameState.status !== 'Active') {
        console.log('Invalid game state');
        res.status(400).json({ error: 'Game is not active or does not exist' });
        return;
      }
      if (!validHoldValues.includes(hold)) {
        console.log('Invalid hold value');
        res.status(400).json({ error: 'Invalid hold value' });
        return;
      }
      gameState.holdedCard = hold;

      await redisClient.set(`game:${gameId}`, JSON.stringify(gameState));
      console.log('prisma update game');
      await prisma.game.update({
        where: { id: gameId },
        data: { holdedCard: hold },
      });
      console.log('prisma query done update');
      res.status(200).json({ message: 'Card held successfully', hold });
      return;
    } catch (error) {
      res.status(500).json({ error: 'Failed to hold card', details: error });
      return;
    }
  }
);

router.post(
  '/:gameId/bet',
  authenticate,
  async (req: CustomRequest, res: Response) => {
    const gameId = req.params.gameId;
    console.log(gameId);
    const { bets } = req.body;
    console.log(bets);
    const userId = req.user?.id;

    try {
      const gameState = JSON.parse(
        (await redisClient.get(`game:${gameId}`)) || '{}'
      );

      if (!gameState?.holdedCard || gameState.holdedCard === 'None') {
        console.log('no game');
        res.status(400).json({ error: 'Cannot place a bet, no card is held' });
        return;
      }

      const holdedCard = gameState.holdedCard;
      console.log(holdedCard);
      if (Object.keys(bets).length > 3 || Object.keys(bets).length === 0) {
        res.status(400).json({ error: 'You must bet on 1 to 3 cards only' });
        return;
      }

      let totalBetAmount = 0;
      for (const [card, amount] of Object.entries(bets)) {
        if (!validHoldValues.includes(card)) {
          res.status(400).json({ error: `Invalid card ID: ${card}` });
          return;
        }
        if (card === holdedCard) {
          res.status(400).json({
            error: `Cannot place a bet on the held card: ${holdedCard}`,
          });
          return;
        }
        if (typeof amount !== 'number' || amount <= 0) {
          res
            .status(400)
            .json({ error: `Invalid bet amount for card ${card}` });
          return;
        }

        totalBetAmount += amount;
      }

      const wallet = await prisma.wallet.findUnique({
        where: { userId },
      });

      if (!wallet || wallet.balance < totalBetAmount) {
        res.status(400).json({
          error: `Insufficient balance to place bets. Total required: ${totalBetAmount}, Available: ${wallet?.balance || 0}`,
        });
        return;
      }

      gameState.bets = { ...gameState.bets, ...bets };

      console.log(gameState);
      await redisClient.set(`game:${gameId}`, JSON.stringify(gameState));

      await prisma.game.update({
        where: { id: gameId },
        data: { bets: gameState.bets },
      });

      res.status(200).json({
        message: 'Bet placed successfully',
        game: {
          id: gameState.id,
          userId: gameState.userId,
          status: gameState.status,
          createdAt: gameState.createdAt,
          updatedAt: gameState.updatedAT,
        },
      });

      return;
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to place bet', details: error });
      return;
    }
  }
);

router.post(
  '/:gameId/reveal',
  authenticate,
  async (req: CustomRequest, res: Response) => {
    const { gameId } = req.params;
    const userId = req.user?.id;
    console.log('game/reveal');
    try {
      const gameState = JSON.parse(
        (await redisClient.get(`game:${gameId}`)) || '{}'
      );

      if (!gameState || gameState.status !== 'Active') {
        res.status(400).json({ error: 'Game is not active or does not exist' });
        return;
      }

      const { bets, holdedCard, generatedCards } = gameState;
      console.log(bets);
      console.log(generatedCards);
      console.log(holdedCard);

      const betCards = Object.keys(bets); // Get all keys from the bets (e.g., Card1, Card2, etc.)

      if (betCards.length < 1 || betCards.length > 3) {
        res.status(400).json({ error: 'User must bet on 1 to 3 cards' });
        return;
      }

      if (!holdedCard || holdedCard === 'None') {
        res.status(400).json({ error: 'Holded card is not set.' });
        return;
      }

      let totalEarnings = 0;
      const heldCardValue = cardRecord[generatedCards[holdedCard].value];

      // Prepare bet data for response
      const cardResults: {
        [key: string]: { bet: number; loss?: number; gain?: number };
      } = {};

      for (const betCard of betCards) {
        const betAmount = bets[betCard]; // Get the bet amount for this card
        const betValue = cardRecord[generatedCards[betCard].value];
        console.log(betValue);

        // Calculate win or loss based on the comparison of the held card's value and the bet card's value
        if (heldCardValue >= betValue) {
          // Loss: Player lost the bet
          cardResults[betCard] = { bet: betAmount, loss: -betAmount };
          totalEarnings -= betAmount;
        } else {
          // Win: Player won the bet, so they earn double their bet
          cardResults[betCard] = { bet: betAmount, gain: betAmount * 2 };
          totalEarnings += betAmount * 2;
        }
      }

      // Exclude the held card from the results
      delete cardResults[holdedCard];

      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        res.status(400).json({ error: 'Wallet not found.' });
        return;
      }

      console.log('wallet found');
      const walletId = wallet.id;
      const newBalance = wallet.balance + totalEarnings;

      // Create a transaction to update the wallet balance and game state
      await prisma.$transaction([
        prisma.wallet.update({
          where: { id: walletId },
          data: { balance: newBalance },
        }),
        prisma.transaction.create({
          data: {
            amount: totalEarnings,
            type: totalEarnings > 0 ? 'BetWin' : 'BetLoss',
            userId,
            walletId,
            gameId,
            status: 'Completed',
          },
        }),
        prisma.game.update({
          where: { id: gameId },
          data: {
            status: 'Completed',
            outcome: totalEarnings > 0 ? 'Won' : 'Lost',
          },
        }),
      ]);

      console.log('transaction completed');
      await redisClient.del(`game:${gameId}`);

      // Respond with the results of the game
      res.status(200).json({
        message: 'Game revealed successfully',
        totalEarnings,
        walletBalance: newBalance,
        generatedCards,
        cardResults,
      });
    } catch (error) {
      console.error('Error revealing game:', error);
      res.status(500).json({ error: 'Failed to reveal game', details: error });
      return;
    }
  }
);

export default router;
