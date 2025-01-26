import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import gameRouter from './routes/gameRouter';
import transactionRouter from './routes/transactions';
import walletRouter from './routes/walletRouter';

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/games', gameRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/transactions', transactionRouter);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});