
import { PrismaClient as TwitterPrismaClient } from '@prisma/twitter-client';
import 'dotenv/config';

// Determine if Twitter client is available based on DATABASE_URL_TWITTER
const hasTwitterClient = !!process.env.DATABASE_URL_TWITTER;

// Initialize Twitter Prisma client if available
let twitterPrismaInstance: TwitterPrismaClient | null = null;

if (hasTwitterClient) {
  try {
    twitterPrismaInstance = new TwitterPrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_TWITTER || '',
        },
      },
    });
    console.log('Twitter Prisma client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Twitter Prisma client:', error);
    twitterPrismaInstance = null;
  }
}

// Create safe fallback wrapper for Twitter operations
const safeTwitterDbWrapper = {
  twitterProfile: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    upsert: async () => null,
  },
  twitterSpace: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    upsert: async () => null,
  },
  twitterSpaceRSVP: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    upsert: async () => null,
    count: async () => 0,
  },
  whitelistedCreator: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    upsert: async () => null,
    count: async () => 0,
  },
};

// Export the Twitter database client
export const twitterDb = hasTwitterClient ? twitterPrismaInstance : null;

// Export a safe wrapper for when the Twitter client isn't available
export const db = hasTwitterClient ? twitterPrismaInstance || safeTwitterDbWrapper : safeTwitterDbWrapper;

// Log warning if Twitter client isn't available
if (!hasTwitterClient) {
  console.warn("Using fallback Twitter client. Limited functionality available.");
}
