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
  'https://hold-and-bet.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

console.log('Allowed CORS origins:', allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) {
        console.log('Request with no origin - allowing');
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log('CORS allowed origin:', origin);
        callback(null, true);
      } else {
        console.log('CORS origin not in list, allowing anyway:', origin);
        callback(null, true); // Allow all origins for now
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
  })
);

// Pre-flight OPTIONS handler
app.options('*', cors());

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Only listen in non-Vercel environments
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 80;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the Express app for Vercel
export default app;