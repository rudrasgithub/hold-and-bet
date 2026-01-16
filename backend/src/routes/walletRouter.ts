import { Router, Response } from 'express';
import prisma from '@/lib/prisma';
import authenticate, { CustomRequest } from '../middlewares/authMiddleware';

const router = Router();

router.get(
  '/balance',
  authenticate,
  async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id;

    try {
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        res.status(404).json({ error: 'Wallet not found' });
        return;
      }

      res.status(200).json({ balance: wallet.balance });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Failed to fetch wallet balance' });
    }
  }
);

router.get('/', authenticate, async (req: CustomRequest, res: Response) => {
  const userId = req.user?.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;
  const skip = (page - 1) * limit;

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: userId },
    });

    if (!wallet) {
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }

    // Get paginated transactions with optimized query
    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      wallet,
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasMore: page < totalPages,
      },
    });
    console.log('done');
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallet', details: error });
  }
});

router.post(
  '/withdraw',
  authenticate,
  async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id;
    const { amount } = req.body;

    try {
      const wallet = await prisma.wallet.findUnique({ where: { userId } });

      if (!wallet || wallet.balance < amount) {
        res.status(400).json({ message: 'Insufficient funds' });
        return;
      }

      const newBalance = wallet.balance - amount;

      const updatedWallet = await prisma.$transaction(async (tx) => {
        await tx.wallet.update({
          where: { userId },
          data: { balance: newBalance },
        });

        await tx.transaction.create({
          data: {
            userId: userId as string,
            walletId: wallet.id,
            amount,
            type: 'Withdrawal',
            status: 'Completed',
          },
        });

        const updatedWalletData = await tx.wallet.findUnique({
          where: { userId },
          include: {
            transactions: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        });

        return updatedWalletData;
      });

      if (!updatedWallet) {
        res
          .status(500)
          .json({ message: 'Failed to retrieve updated wallet data' });
        return;
      }

      res.status(200).json({
        newBalance: updatedWallet.balance,
        transactions: updatedWallet.transactions,
      });
    } catch (error) {
      console.error('Error during withdrawal:', error);
      res.status(500).json({ message: 'Failed to process withdrawal' });
    }
  }
);

export default router;
