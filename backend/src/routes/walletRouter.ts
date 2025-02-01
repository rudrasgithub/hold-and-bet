import { Router, Request, Response } from 'express';
import { prisma } from '../config/prismaClient';
import authenticate, { CustomRequest } from '../middlewares/authMiddleware';
import bodyParser from 'body-parser';
import { stripe } from '../config/stripeConfig';
import Stripe from 'stripe';

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

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: userId },
      include: {
        transactions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!wallet) {
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }

    res.status(200).json({
      wallet,
      transactions: wallet.transactions,
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

router.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const payload = req.body;

    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.ENDPOINT_SECRET!
      );

      switch (event.type) {
        case 'payment_intent.succeeded': {
          const paymentSucceededIntent = event.data
            .object as Stripe.PaymentIntent;
          const userIdSuccess = paymentSucceededIntent.metadata.userId;
          const amountSuccess = paymentSucceededIntent.amount_received / 100;

          // Handle successful payment intent
          await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.update({
              where: { userId: userIdSuccess },
              data: { balance: { increment: amountSuccess } },
            });

            await tx.transaction.create({
              data: {
                userId: userIdSuccess,
                walletId: wallet.id,
                amount: amountSuccess,
                type: 'Deposit',
                status: 'Completed',
              },
            });
          });

          console.log('Payment intent succeeded', paymentSucceededIntent);
          res.status(200).json({ message: 'Payment successful' });
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentFailedIntent = event.data.object as Stripe.PaymentIntent;
          // const userIdFailed = paymentFailedIntent.metadata.userId;

          // Handle failed payment
          console.log('Payment intent failed', paymentFailedIntent);

          // Optionally, you could notify the user or retry payment
          res.status(200).json({ message: 'Payment failed' });
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
          res.status(400).send();
      }
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook signature verification failed' });
    }
  }
);

export default router;
