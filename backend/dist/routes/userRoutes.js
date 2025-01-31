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
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const profile = yield prismaClient_1.prisma.user.findUnique({
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
        const totalBetWinAmount = profile.transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
        // Calculate winning rate
        const winningRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;
        res.status(200).json({
            profile: {
                email: profile.email,
                name: profile.name,
                image: profile.image,
                totalMatches,
                totalWins,
                totalProfit: totalBetWinAmount / 2,
                winningRate: winningRate.toFixed(1), // Return winning rate as a percentage with two decimal points
            },
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch user profile' });
        return;
    }
}));
exports.default = router;
