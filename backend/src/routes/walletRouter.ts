import { Router, Request, Response } from "express";
import { prisma } from "../config/prismaClient";
import { authenticate } from "../middlewares/authMiddleware";
import bodyParser from "body-parser";
import { stripe } from "../config/stripeConfig";
import Stripe from "stripe";

const endpointSecret = "your_stripe_webhook_secret";

const router = Router();

router.get("/", authenticate, async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: { transactions: true },
    });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    res.status(200).json(wallet);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wallet", details: error });
  }
});

router.post("/deposit", authenticate, async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "inr",
      metadata: { userId: userId.toString() },
    });

    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
      message: "Payment intent created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create payment intent", details: error });
  }
});

router.post("/withdraw", authenticate, async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { amount } = req.body;

  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const updatedWallet = await prisma.$transaction(async (tx) => {
      
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      });

      await tx.transaction.create({
        data: {
          walletId: updatedWallet.id,
          amount,
          type: "Withdrawal"
        },
      });

      return updatedWallet;
    });

    res.status(200).json({ message: "Withdrawal successful", wallet: updatedWallet });
  } catch (error) {
    res.status(500).json({ error: "Failed to withdraw money", details: error });
  }
});

router.post("/webhook", bodyParser.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const payload = req.body;

    try {
      const event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const userId = paymentIntent.metadata.userId;
        const amount = paymentIntent.amount / 100;

        await prisma.$transaction(async (tx) => {

          const wallet = await tx.wallet.update({
            where: { userId },
            data: { balance: { increment: amount } },
          });
          
          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              amount,
              type: "Deposit",
            },
          });
        });

        res.status(200).json({ message: "Deposit successful" });
      } else {
        console.log(`Unhandled event type: ${event.type}`);
        res.status(400).send();
      }
    } catch (error) {
      console.error("Webhook error:", error.message);
      res.status(400).json({ error: "Webhook signature verification failed" });
    }
  }
);

export default router;
