import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import morgan from 'morgan';

import gameRouter from './routes/gameRouter';
import walletRouter from './routes/walletRouter';
import authRouter from './routes/authRoutes';
import userRouter from './routes/userRoutes';
import webhookRouter from './routes/webhookRoute';

dotenv.config();

const app = express();

app.use(helmet());

const allowedOrigins = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(
  cors({
    origin: allowedOrigins,
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  })
);

app.use('/api/webhook', webhookRouter);

app.use(bodyParser.json());

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use('/api/games', gameRouter);
app.use('/api/wallet', walletRouter);
app.use('/api', authRouter);
app.use('/api/user', userRouter);

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
