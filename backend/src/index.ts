import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import helmet from 'helmet'; // For security headers
import morgan from 'morgan'; // For request logging

import gameRouter from './routes/gameRouter';
import walletRouter from './routes/walletRouter';
import authRouter from './routes/authRoutes';
import userRouter from './routes/userRoutes';

dotenv.config();

const app = express();

// Use helmet for security headers
app.use(helmet());

// CORS setup for production environment
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000']; // Set your production frontend URL here
app.use(
  cors({
    origin: allowedOrigins,
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
  })
);

// Use body parser for incoming JSON requests
app.use(bodyParser.json());

// Use morgan for logging requests in production
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // More detailed logging for production
} else {
  app.use(morgan('dev')); // Simpler logging for development
}

// Define routes
app.use('/api/games', gameRouter);
app.use('/api/wallet', walletRouter);
app.use('/api', authRouter);
app.use('/api/user', userRouter);

// Set port from environment variable or default to 5000
const PORT = process.env.PORT || 5000; // Set default to 5000 if no port is defined
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
