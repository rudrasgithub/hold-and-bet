"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = require("../config/prismaClient");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const body_parser_1 = __importDefault(require("body-parser"));
const stripeConfig_1 = require("../config/stripeConfig");
const router = (0, express_1.Router)();
router.get('/balance', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const wallet = yield prismaClient_1.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) {
            res.status(404).json({ error: 'Wallet not found' });
            return;
        }
        res.status(200).json({ balance: wallet.balance });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch wallet balance' });
    }
}));
router.get('/', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const wallet = yield prismaClient_1.prisma.wallet.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch wallet', details: error });
    }
}));
router.post('/withdraw', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { amount } = req.body;
    try {
        const wallet = yield prismaClient_1.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet || wallet.balance < amount) {
            res.status(400).json({ message: 'Insufficient funds' });
            return;
        }
        const newBalance = wallet.balance - amount;
        const updatedWallet = yield prismaClient_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            yield tx.wallet.update({
                where: { userId },
                data: { balance: newBalance },
            });
            yield tx.transaction.create({
                data: {
                    userId: userId,
                    walletId: wallet.id,
                    amount,
                    type: 'Withdrawal',
                    status: 'Completed',
                },
            });
            const updatedWalletData = yield tx.wallet.findUnique({
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
        }));
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
    }
    catch (error) {
        console.error('Error during withdrawal:', error);
        res.status(500).json({ message: 'Failed to process withdrawal' });
    }
}));
router.post("/webhook", body_parser_1.default.raw({ type: "application/json" }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const sig = req.headers["stripe-signature"];
    const payload = req.body;
    try {
        const event = stripeConfig_1.stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                const userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
                const amountPaid = (session.amount_total || 0) / 100;
                if (!userId) {
                    console.error("❌ Missing userId in session metadata");
                    res.status(400).json({ error: "Missing userId in metadata" });
                    return;
                }
                console.log(`✅ Checkout completed for User: ${userId}, Amount: ₹${amountPaid}`);
                yield prismaClient_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                    const wallet = yield tx.wallet.update({
                        where: { userId },
                        data: { balance: { increment: amountPaid } },
                    });
                    yield tx.transaction.create({
                        data: {
                            userId,
                            walletId: wallet.id,
                            amount: amountPaid,
                            type: "Deposit",
                            status: "Completed",
                        },
                    });
                }));
                res.status(200).json({ message: "Checkout session processed successfully" });
                return;
            }
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                const userId = (_b = paymentIntent.metadata) === null || _b === void 0 ? void 0 : _b.userId;
                const amountPaid = paymentIntent.amount_received / 100;
                if (!userId) {
                    console.error("❌ Missing userId in payment intent metadata");
                    res.status(400).json({ error: "Missing userId in metadata" });
                    return;
                }
                console.log(`✅ Payment Intent Succeeded: ₹${amountPaid} for User: ${userId}`);
                yield prismaClient_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                    const wallet = yield tx.wallet.update({
                        where: { userId },
                        data: { balance: { increment: amountPaid } },
                    });
                    yield tx.transaction.create({
                        data: {
                            userId,
                            walletId: wallet.id,
                            amount: amountPaid,
                            type: "Deposit",
                            status: "Completed",
                        },
                    });
                }));
                res.status(200).json({ message: "Payment successful" });
                return;
            }
            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object;
                console.log("❌ Payment Intent Failed:", paymentIntent);
                res.status(200).json({ message: "Payment failed" });
                return;
            }
            default:
                console.log(`⚠️ Unhandled event type: ${event.type}`);
                res.status(400).send();
                return;
        }
    }
    catch (error) {
        console.error("❌ Webhook error:", error);
        res.status(400).json({ error: "Webhook signature verification failed" });
        return;
    }
}));
exports.default = router;
