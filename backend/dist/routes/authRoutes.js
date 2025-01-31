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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = require("../config/prismaClient");
const router = (0, express_1.Router)();
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name, password, image } = req.body;
    try {
        console.log('hitted');
        const existingUser = yield prismaClient_1.prisma.user.findUnique({ where: { email } });
        console.log('hitted');
        if (existingUser) {
            console.log('hitted');
            const usertoken = jsonwebtoken_1.default.sign({ id: existingUser.id, email: existingUser.email }, process.env.JWT_SECRET, {
                expiresIn: '7d',
            });
            console.log('hitted');
            res.status(200).json({
                message: 'User already exists',
                user: existingUser,
                usertoken,
            });
            return;
        }
        console.log('hitted');
        const newUser = yield prismaClient_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            console.log('transaction');
            const createdUser = yield tx.user.create({
                data: {
                    email,
                    name,
                    image,
                    password: yield bcryptjs_1.default.hash(password, 10),
                },
            });
            console.log('transactionended');
            yield tx.wallet.create({
                data: {
                    userId: createdUser.id,
                },
            });
            console.log('hitted');
            return createdUser;
        }));
        console.log('hitted');
        const usertoken = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        console.log('done');
        res.status(201).json({
            message: 'User registered successfully',
            user: newUser,
            usertoken,
        });
        return;
    }
    catch (error) {
        res.status(500).json({ error: 'Server error', details: error });
        return;
    }
}));
exports.default = router;
