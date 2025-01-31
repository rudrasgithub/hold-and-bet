import { Request, Response, Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prismaClient";

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<void> => {
    const { email, name, password, image } = req.body;

    try {
        console.log("hitted");
        const existingUser = await prisma.user.findUnique({ where: { email } });
        console.log("hitted");

        if (existingUser) {
            console.log("hitted");
            const usertoken = jwt.sign({ id: existingUser.id, email: existingUser.email }, process.env.JWT_SECRET!, {
                expiresIn: "7d",
            });
            console.log("hitted");
            res.status(200).json({ message: "User already exists", user: existingUser, usertoken });
            return;
        }
        console.log("hitted");
        const newUser = await prisma.$transaction(async (tx) => {
            console.log("transaction")
            const createdUser = await tx.user.create({
                data: {
                    email,
                    name,
                    image,
                    password: await bcrypt.hash(password, 10)
                }
            })
            console.log("transactionended");
            await tx.wallet.create({
                data: {
                    userId: createdUser.id
                }
            })
            console.log("hitted");
            return createdUser;
        })
        console.log("hitted");
        const usertoken = jwt.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET!, {
            expiresIn: "7d",
        });
        console.log("done");
        res.status(201).json({ message: "User registered successfully", user: newUser, usertoken });
        return;
    } catch (error) {
        res.status(500).json({ error: "Server error", details: error });
        return;
    }
});

export default router;