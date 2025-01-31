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
const redisClient_1 = require("../config/redisClient");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const lib_1 = require("../config/lib");
const router = (0, express_1.Router)();
router.post('/newgame', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    console.log('user id found');
    if (!userId) {
        res.status(400).json({ error: 'User ID not found' });
        return;
    }
    try {
        console.log('wallet');
        console.log(`${userId}`);
        const wallet = yield prismaClient_1.prisma.wallet.findUnique({
            where: { userId },
        });
        if (!wallet || wallet.balance < 5) {
            console.log('no wallet');
            res.status(400).json({
                error: 'Insufficient balance to start a new game. Minimum required: 5',
            });
            return;
        }
        const generatedCards = (0, lib_1.generateRandomCards)();
        console.log('game query started');
        const game = yield prismaClient_1.prisma.game.create({
            data: {
                userId,
                bets: {},
                generatedCards,
            },
        });
        yield redisClient_1.redisClient.set(`game:${game.id}`, JSON.stringify({
            generatedCards,
            bets: [],
            status: 'Active',
            holdedCard: 'None',
        }));
        const gameState = yield redisClient_1.redisClient.get(`game:${game.id}`);
        console.log(gameState);
        res.status(201).json({
            message: 'Game created successfully',
            game: {
                id: game.id,
                userId: game.userId,
                status: game.status,
                createdAt: game.createdAt,
                updatedAt: game.updatedAT,
            },
        });
        return;
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create game', details: error });
        return;
    }
}));
router.get('/:gameId', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = req.params.gameId;
    try {
        const cachedGame = yield redisClient_1.redisClient.get(`game:${gameId}`);
        console.log(cachedGame);
        if (cachedGame) {
            res.status(200).json(JSON.parse(cachedGame));
            return;
        }
        const game = yield prismaClient_1.prisma.game.findUnique({ where: { id: gameId } });
        if (!game) {
            res.status(404).json({ error: 'Game not found' });
            return;
        }
        yield redisClient_1.redisClient.set(`game:${game.id}`, JSON.stringify(game));
        res.status(200).json({ game });
        return;
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch game', details: error });
        return;
    }
}));
router.post('/:gameId/hold', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gameId = req.params.gameId;
    const { hold } = req.body;
    try {
        const gameState2 = (yield redisClient_1.redisClient.get(`game:${gameId}`)) || '{}';
        const gameState = JSON.parse(gameState2);
        if (!gameState || gameState.status !== 'Active') {
            console.log('Invalid game state');
            res.status(400).json({ error: 'Game is not active or does not exist' });
            return;
        }
        if (!lib_1.validHoldValues.includes(hold)) {
            console.log('Invalid hold value');
            res.status(400).json({ error: 'Invalid hold value' });
            return;
        }
        gameState.holdedCard = hold;
        yield redisClient_1.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));
        console.log('prisma update game');
        yield prismaClient_1.prisma.game.update({
            where: { id: gameId },
            data: { holdedCard: hold },
        });
        console.log('prisma query done update');
        res.status(200).json({ message: 'Card held successfully', hold });
        return;
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to hold card', details: error });
        return;
    }
}));
router.post('/:gameId/bet', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const gameId = req.params.gameId;
    console.log(gameId);
    const { bets } = req.body;
    console.log(bets);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const gameState = JSON.parse((yield redisClient_1.redisClient.get(`game:${gameId}`)) || '{}');
        if (!(gameState === null || gameState === void 0 ? void 0 : gameState.holdedCard) || gameState.holdedCard === 'None') {
            console.log('no game');
            res.status(400).json({ error: 'Cannot place a bet, no card is held' });
            return;
        }
        const holdedCard = gameState.holdedCard;
        console.log(holdedCard);
        if (Object.keys(bets).length > 3 || Object.keys(bets).length === 0) {
            res.status(400).json({ error: 'You must bet on 1 to 3 cards only' });
            return;
        }
        let totalBetAmount = 0;
        for (const [card, amount] of Object.entries(bets)) {
            if (!lib_1.validHoldValues.includes(card)) {
                res.status(400).json({ error: `Invalid card ID: ${card}` });
                return;
            }
            if (card === holdedCard) {
                res.status(400).json({
                    error: `Cannot place a bet on the held card: ${holdedCard}`,
                });
                return;
            }
            if (typeof amount !== 'number' || amount <= 0) {
                res
                    .status(400)
                    .json({ error: `Invalid bet amount for card ${card}` });
                return;
            }
            totalBetAmount += amount;
        }
        const wallet = yield prismaClient_1.prisma.wallet.findUnique({
            where: { userId },
        });
        if (!wallet || wallet.balance < totalBetAmount) {
            res.status(400).json({
                error: `Insufficient balance to place bets. Total required: ${totalBetAmount}, Available: ${(wallet === null || wallet === void 0 ? void 0 : wallet.balance) || 0}`,
            });
            return;
        }
        gameState.bets = Object.assign(Object.assign({}, gameState.bets), bets);
        console.log(gameState);
        yield redisClient_1.redisClient.set(`game:${gameId}`, JSON.stringify(gameState));
        yield prismaClient_1.prisma.game.update({
            where: { id: gameId },
            data: { bets: gameState.bets },
        });
        res.status(200).json({
            message: 'Bet placed successfully',
            game: {
                id: gameState.id,
                userId: gameState.userId,
                status: gameState.status,
                createdAt: gameState.createdAt,
                updatedAt: gameState.updatedAT,
            },
        });
        return;
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to place bet', details: error });
        return;
    }
}));
router.post('/:gameId/reveal', authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { gameId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    console.log('game/reveal');
    try {
        const gameState = JSON.parse((yield redisClient_1.redisClient.get(`game:${gameId}`)) || '{}');
        if (!gameState || gameState.status !== 'Active') {
            res.status(400).json({ error: 'Game is not active or does not exist' });
            return;
        }
        const { bets, holdedCard, generatedCards } = gameState;
        console.log(bets);
        console.log(generatedCards);
        console.log(holdedCard);
        const betCards = Object.keys(bets);
        if (betCards.length < 1 || betCards.length > 3) {
            res.status(400).json({ error: 'User must bet on 1 to 3 cards' });
            return;
        }
        if (!holdedCard || holdedCard === 'None') {
            res.status(400).json({ error: 'Holded card is not set.' });
            return;
        }
        let totalEarnings = 0;
        const heldCardValue = lib_1.cardRecord[generatedCards[holdedCard].value];
        const cardResults = {};
        for (const betCard of betCards) {
            const betAmount = bets[betCard];
            const betValue = lib_1.cardRecord[generatedCards[betCard].value];
            console.log(betValue);
            if (heldCardValue >= betValue) {
                cardResults[betCard] = { bet: betAmount, loss: -betAmount };
                totalEarnings -= betAmount;
            }
            else {
                cardResults[betCard] = { bet: betAmount, gain: betAmount * 2 };
                totalEarnings += betAmount * 2;
            }
        }
        delete cardResults[holdedCard];
        const wallet = yield prismaClient_1.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) {
            res.status(400).json({ error: 'Wallet not found.' });
            return;
        }
        console.log('wallet found');
        const walletId = wallet.id;
        const newBalance = wallet.balance + totalEarnings;
        yield prismaClient_1.prisma.$transaction([
            prismaClient_1.prisma.wallet.update({
                where: { id: walletId },
                data: { balance: newBalance },
            }),
            prismaClient_1.prisma.transaction.create({
                data: {
                    amount: totalEarnings,
                    type: totalEarnings > 0 ? 'BetWin' : 'BetLoss',
                    userId,
                    walletId,
                    gameId,
                    status: 'Completed',
                },
            }),
            prismaClient_1.prisma.game.update({
                where: { id: gameId },
                data: {
                    status: 'Completed',
                    outcome: totalEarnings > 0 ? 'Won' : 'Lost',
                },
            }),
        ]);
        console.log('transaction completed');
        yield redisClient_1.redisClient.del(`game:${gameId}`);
        res.status(200).json({
            message: 'Game revealed successfully',
            totalEarnings,
            walletBalance: newBalance,
            generatedCards,
            cardResults,
        });
    }
    catch (error) {
        console.error('Error revealing game:', error);
        res.status(500).json({ error: 'Failed to reveal game', details: error });
        return;
    }
}));
exports.default = router;
