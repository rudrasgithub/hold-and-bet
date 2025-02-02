import { Router, Response } from 'express';
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
  async (req: CustomRequest, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const payload = req.body;

    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId; // Ensure you pass metadata when creating the checkout session
          const amountPaid = (session.amount_total || 0) / 100;

          if (!userId) {
            console.error('❌ Missing userId in session metadata');
            res.status(400).json({ error: 'Missing userId in metadata' });
            return;
          }

          console.log(
            `✅ Checkout completed for User: ${userId}, Amount: ₹${amountPaid}`
          );

          await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.update({
              where: { userId },
              data: { balance: { increment: amountPaid } },
            });

            await tx.transaction.create({
              data: {
                userId,
                walletId: wallet.id,
                amount: amountPaid,
                type: 'Deposit',
                status: 'Completed',
              },
            });
          });

          res
            .status(200)
            .json({ message: 'Checkout session processed successfully' });
          return;
        }

        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const userId = paymentIntent.metadata?.userId;
          const amountPaid = paymentIntent.amount_received / 100;

          if (!userId) {
            console.error('❌ Missing userId in payment intent metadata');
            res.status(400).json({ error: 'Missing userId in metadata' });
            return;
          }

          console.log(
            `✅ Payment Intent Succeeded: ₹${amountPaid} for User: ${userId}`
          );

          await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.update({
              where: { userId },
              data: { balance: { increment: amountPaid } },
            });

            await tx.transaction.create({
              data: {
                userId,
                walletId: wallet.id,
                amount: amountPaid,
                type: 'Deposit',
                status: 'Completed',
              },
            });
          });

          res.status(200).json({ message: 'Payment successful' });
          return;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          console.log('❌ Payment Intent Failed:', paymentIntent);
          res.status(200).json({ message: 'Payment failed' });
          return;
        }

        default:
          console.log(`⚠️ Unhandled event type: ${event.type}`);
          res.status(400).send();
          return;
      }
    } catch (error) {
      console.error('❌ Webhook error:', error);
      res.status(400).json({ error: 'Webhook signature verification failed' });
      return;
    }
  }
);

export default router;
