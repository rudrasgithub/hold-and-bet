import { Response, Router } from "express";
import { stripe } from "../config/stripeConfig";
import { CustomRequest } from "../middlewares/authMiddleware";
import Stripe from "stripe";
import bodyParser from "body-parser";
import { prisma } from "../config/prismaClient";

const router = Router();

router.post(
    '/webhook',
    bodyParser.raw({ type: 'application/json' }),
    async (req: CustomRequest, res: Response) => {
        const sig = req.headers['stripe-signature'] as string;
        const payload = req.body;  // Change this from req.rawBody to req.body

        try {
            const event = stripe.webhooks.constructEvent(
                payload as Buffer,  // req.body is already a Buffer
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!
            );

            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object as Stripe.Checkout.Session;

                    const walletId = session.client_reference_id;
                    const amountPaid = (session.amount_total || 0) / 100;

                    if (!walletId) {
                        console.error('❌ Missing walletId in client_reference_id');
                        res.status(400).json({ error: 'Missing user reference' });
                        return;
                    }

                    console.log(`✅ Checkout completed for User: ${walletId}, Amount: ₹${amountPaid}`);

                    try {
                        await prisma.$transaction(async (tx) => {
                            const wallet = await tx.wallet.findUnique({
                                where: { id: walletId },
                            });

                            if (!wallet) {
                                console.error(`❌ Wallet with ID ${walletId} not found`);
                                res.status(404).json({ error: 'Wallet not found' });
                                return;
                            }

                            await tx.wallet.update({
                                where: { id: walletId },
                                data: { balance: { increment: amountPaid } },
                            });

                            await tx.transaction.create({
                                data: {
                                    userId: wallet.userId,
                                    walletId: walletId,
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
                                });
                                await tx.transaction.create({
                                    data: {
                                        userId,
                                        walletId: wallet?.id as string,
                                        amount: paymentIntent.amount / 100,
                                        type: 'Deposit',
                                        status: 'Failed',
                                    },
                                });
                            });
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