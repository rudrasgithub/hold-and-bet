import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

redisClient.on('connect', () => console.log('✅ Redis Client Connected'));

redisClient.on('ready', () => console.log('✅ Redis Client Ready'));

redisClient.connect().catch((err) => {
  console.error('❌ Failed to connect to Redis:', err.message);
});
