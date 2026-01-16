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

// Helmet with less restrictive settings for development
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    referrerPolicy: { policy: 'origin-when-cross-origin' },
    contentSecurityPolicy: false, // Disable CSP in development
  })
);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(null, true); // Allow all origins in development
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
  })
);

app.use('/api/wallet', webhookRouter);

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
