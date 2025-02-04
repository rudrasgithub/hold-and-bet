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
          
          const userId = session.client_reference_id;
          const amountPaid = (session.amount_total || 0) / 100;

          if (!userId) {
            console.error('❌ Missing userId in client_reference_id');
            res.status(400).json({ error: 'Missing user reference' });
            return;
          }

          console.log(`✅ Checkout completed for User: ${userId}, Amount: ₹${amountPaid}`);

          try {
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
          } catch (dbError) {
            console.error('❌ Database transaction failed:', dbError);
            res.status(500).json({ error: 'Failed to update records' });
            return;
          }

          res.json({ message: 'Checkout processed successfully' });
          return;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const userId = paymentIntent.metadata?.userId;
          
          console.error('❌ Payment Failed:', {
            id: paymentIntent.id,
            userId,
            error: paymentIntent.last_payment_error
          });

          if (userId) {
            try {
              await prisma.$transaction(async (tx) => {
                const wallet = await tx.wallet.findUnique({
                  where: { userId: userId }
                })
                await tx.transaction.create({
                  data: {
                    userId,
                    walletId: wallet?.id as string,
                    amount: paymentIntent.amount / 100,
                    type: 'Deposit',
                    status: 'Failed',
                  },
                });
              })
            } catch (dbError) {
              console.error('❌ Failed to record failed transaction:', dbError);
            }
          }

          res.status(200).json({ message: 'Payment failure logged' });
          return;
        }

        default:
          console.log(`⚠️ Unhandled event type: ${event.type}`);
          res.status(400).end();
          return;
      }
    } catch (error) {
      console.error('❌ Webhook error:', error);
      res.status(400).json({ error: 'Invalid signature' });
      return;
    }
  }
);

export default router;
