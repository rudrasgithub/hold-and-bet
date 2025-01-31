import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import gameRouter from './routes/gameRouter'
import walletRouter from './routes/walletRouter'
import authRouter from './routes/authRoutes'
import userRouter from './routes/userRoutes'

dotenv.config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));
app.use(bodyParser.json());

app.use('/api/games', gameRouter);
app.use('/api/wallet', walletRouter);
app.use('/api', authRouter);
app.use('/api/user', userRouter)

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});