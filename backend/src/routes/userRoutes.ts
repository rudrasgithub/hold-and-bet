import { Response, Router } from "express";
import { prisma } from "../config/prismaClient";
import authenticate, { CustomRequest } from "../middlewares/authMiddleware";

const router = Router();

router.get('/', authenticate, async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id;
    try {
        const profile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                name: true,
                image: true,
                games: {
                    select: {
                        outcome: true, // Fetching the outcome for each game
                    }
                },
                transactions: {
                    where: {
                        type: 'BetWin'
                    },
                    select: {
                        amount: true,
                    },
                }
            }
        });

        if (!profile) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Calculate total matches and total wins
        const totalMatches = profile.games.length;
        const totalWins = profile.games.filter(game => game.outcome === 'Won').length;

        // Calculate total BetWin amount
        const totalBetWinAmount = profile.transactions.reduce((acc: number, transaction: any) => acc + transaction.amount, 0);
        // Calculate winning rate
        const winningRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

        res.status(200).json({
            profile: {
                email: profile.email,
                name: profile.name,
                image: profile.image,
                totalMatches,
                totalWins,
                totalProfit: totalBetWinAmount/2,
                winningRate: winningRate.toFixed(1), // Return winning rate as a percentage with two decimal points
            },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch user profile' });
        return;
    }
});

export default router;
