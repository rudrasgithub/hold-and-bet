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
router.get("/balance", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const wallet = yield prismaClient_1.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) {
            res.status(404).json({ error: "Wallet not found" });
            return;
        }
        res.status(200).json({ balance: wallet.balance });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch wallet balance" });
    }
}));
router.get("/", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const wallet = yield prismaClient_1.prisma.wallet.findUnique({
            where: { userId: userId },
            include: {
                transactions: {
                    orderBy: {
                        'createdAt': 'desc'
                    }
                }
            }
        });
        if (!wallet) {
            res.status(404).json({ error: "Wallet not found" });
            return;
        }
        res.status(200).json({
            wallet,
            transactions: wallet.transactions
        });
        console.log("done");
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch wallet", details: error });
    }
}));
router.post("/withdraw", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Create transaction and update wallet balance in a transaction
        const updatedWallet = yield prismaClient_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            yield tx.wallet.update({
                where: { userId },
                data: { balance: newBalance },
            });
            yield tx.transaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount,
                    type: 'Withdrawal',
                    status: 'Completed'
                },
            });
            const updatedWalletData = yield tx.wallet.findUnique({
                where: { userId },
                include: {
                    transactions: {
                        orderBy: {
                            createdAt: 'desc', // Ensure the most recent transactions come first
                        },
                    },
                },
            });
            return updatedWalletData;
        }));
        if (!updatedWallet) {
            res.status(500).json({ message: 'Failed to retrieve updated wallet data' });
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
router.post('/webhook', body_parser_1.default.raw({ type: 'application/json' }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;
    try {
        const event = stripeConfig_1.stripe.webhooks.constructEvent(payload, sig, process.env.ENDPOINT_SECRET);
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentSucceededIntent = event.data.object;
                const userIdSuccess = paymentSucceededIntent.metadata.userId;
                const amountSuccess = paymentSucceededIntent.amount_received / 100;
                // Handle successful payment intent
                yield prismaClient_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                    const wallet = yield tx.wallet.update({
                        where: { userId: userIdSuccess },
                        data: { balance: { increment: amountSuccess } },
                    });
                    yield tx.transaction.create({
                        data: {
                            userId: userIdSuccess,
                            walletId: wallet.id,
                            amount: amountSuccess,
                            type: 'Deposit',
                            status: 'Completed'
                        },
                    });
                }));
                console.log('Payment intent succeeded', paymentSucceededIntent);
                res.status(200).json({ message: 'Payment successful' });
                break;
            case 'payment_intent.payment_failed':
                const paymentFailedIntent = event.data.object;
                const userIdFailed = paymentFailedIntent.metadata.userId;
                // Handle failed payment
                console.log('Payment intent failed', paymentFailedIntent);
                // Optionally, you could notify the user or retry payment
                res.status(200).json({ message: 'Payment failed' });
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
                res.status(400).send();
        }
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ error: 'Webhook signature verification failed' });
    }
}));
exports.default = router;
