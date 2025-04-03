import { PrismaClient as TwitterPrismaClient } from '@prisma/twitter-client';
import 'dotenv/config';

// Determine if Twitter client is available based on environment variables
// Try multiple possible environment variable names
const twitterDbUrl = process.env.DATABASE_URL_TWITTER || process.env.TWITTER_POSTGRES_URL;
const hasTwitterClient = !!twitterDbUrl;

// Initialize Twitter Prisma client if available
let twitterPrismaInstance: TwitterPrismaClient | null = null;

if (hasTwitterClient) {
  try {
    console.log(`Attempting to connect to Twitter database with URL ${twitterDbUrl?.substring(0, 12)}...`);
    twitterPrismaInstance = new TwitterPrismaClient({
      datasources: {
        db: {
          url: twitterDbUrl,
        },
      },
    });
    console.log('Twitter Prisma client initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Twitter Prisma client:', error);
    twitterPrismaInstance = null;
  }
} else {
  console.error('No Twitter database URL found. Please set DATABASE_URL_TWITTER or TWITTER_POSTGRES_URL environment variable.');
}

// Create safe fallback wrapper for Twitter operations
const safeTwitterDbWrapper = {
  twitterProfile: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    upsert: async () => null,
    count: async () => 0,
    delete: async () => null,
    findFirst: async () => null,
  },
  twitterSpace: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    upsert: async () => null,
    count: async () => 0,
    delete: async () => null,
    findFirst: async () => null,
  },
  twitterSpaceRSVP: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    upsert: async () => null,
    count: async () => 0,
    delete: async () => null,
    findFirst: async () => null,
  },
  whitelistedCreator: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    upsert: async () => null,
    count: async () => 0,
    delete: async () => null,
  },
  twitterWhitelist: {
    findUnique: async () => null,
    findMany: async () => {
      // Return fallback data for whitelisted creators in the specified order
      console.log("Using fallback creator data from twitter-prisma.ts");
      return [
        { username: "PrimapeMarkets", category: "News", points: 690, is_onboarded: true },
        { username: "AlexDotEth", category: "Spaces", points: 500, is_onboarded: true },
        { username: "apecoin", category: "News", points: 250, is_onboarded: true },
        { username: "ApeChainHUB", category: "News", points: 250, is_onboarded: true },
        { username: "yugalabs", category: "News", points: 250, is_onboarded: true },
        { username: "ApewhaleNFT", category: "Spaces", points: 250, is_onboarded: true },
        { username: "boringmerch", category: "News", points: 250, is_onboarded: true },
        { username: "BoredApeYC", category: "News", points: 250, is_onboarded: true }
      ];
    },
    create: async () => null,
    update: async () => null,
    upsert: async () => null,
    count: async () => 7,
    delete: async () => null,
  },
};

// Define the TwitterDb type to include all necessary properties
type TwitterDb = TwitterPrismaClient | typeof safeTwitterDbWrapper;

// Export the Twitter database client
export const twitterDb = hasTwitterClient ? twitterPrismaInstance : null;

// Export a safe wrapper for when the Twitter client isn't available
export const db: TwitterDb = hasTwitterClient ? twitterPrismaInstance || safeTwitterDbWrapper : safeTwitterDbWrapper;

// Log warning if Twitter client isn't available
if (!hasTwitterClient) {
  console.warn("Using fallback Twitter client. Limited functionality available.");
}

export async function getCreatorsData({ _useCachedData = false }: { _useCachedData?: boolean } = {}) {
  try {
    const whitelistedCreators = await db.twitterWhitelist.findMany({
      orderBy: {
        username: 'asc'
      }
    });

    // Get all profiles in one query
    const twitterProfiles = await db.twitterProfile.findMany({
      where: {
        username: {
          in: whitelistedCreators.map(creator => creator.username)
        }
      }
    });

    return { whitelistedCreators, twitterProfiles };
  } catch (error) {
    console.error('Error fetching creators data:', error);
    return { whitelistedCreators: [], twitterProfiles: [] };
  }
}