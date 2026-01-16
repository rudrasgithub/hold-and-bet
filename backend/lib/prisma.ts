import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set in environment variables');
}

const adapter = new PrismaPg({
  connectionString: connectionString || '',
})

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('✅ PostgreSQL Database Connected (via @/lib/prisma)');
  })
  .catch((error: Error) => {
    console.error('❌ Failed to connect to PostgreSQL:', error.message);
  });

export default prisma