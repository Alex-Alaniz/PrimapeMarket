import { PrismaClient as DefaultPrismaClient } from "@prisma/client";

// Import the Twitter PrismaClient type directly to ensure proper typing
import type { PrismaClient as TwitterPrismaClient } from '@prisma/twitter-client';

// Remove unused variable warning
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let PrismaClient: any;
let hasTwitterClient = false;

// Function to create a PrismaClient with proper output for production
const getPrismaClient = () => {
  try {
    // Dynamic import to avoid build errors when the module doesn't exist yet
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient: TwitterClient } = require("@prisma/twitter-client");

    // For production environments like Vercel, we need to specify the output
    if (process.env.NODE_ENV === 'production') {
      return new TwitterClient({
        datasources: {
          db: {
            url: process.env.TWITTER_POSTGRES_URL || process.env.DATABASE_URL,
          },
        },
        // This is crucial for Vercel deployment - forces binary target
        errorFormat: 'minimal',
      });
    }

    // For development, use standard initialization
    hasTwitterClient = true;
    return new TwitterClient({
      datasources: {
        db: {
          url: process.env.TWITTER_POSTGRES_URL || process.env.DATABASE_URL,
        },
      },
    });
  } catch (error) {
    // Fallback to regular PrismaClient if the Twitter client is not generated yet
    console.warn("Twitter client not found, using regular Prisma client as fallback:", error);
    return null;
  }
};

// Initialize the client with our custom function
const twitterDb = getPrismaClient();

// Create a safe wrapper for Twitter client operations that gracefully falls back
// This is used when we can't connect to Twitter's database
const safeTwitterDbWrapper = {
  twitterProfile: {
    findUnique: async (params: any) => {
      try {
        if (twitterDb) return await twitterDb.twitterProfile.findUnique(params);
        return null;
      } catch (err) {
        console.error("Error in twitterProfile.findUnique:", err);
        return null;
      }
    },
    findMany: async (params?: any) => {
      try {
        if (twitterDb) return await twitterDb.twitterProfile.findMany(params);
        return [];
      } catch (error) {
        console.error("Error in twitterProfile.findMany:", error);
        return [];
      }
    },
    create: async (params: any) => {
      try {
        if (twitterDb) return await twitterDb.twitterProfile.create(params);
        return null;
      } catch (error) {
        console.error("Error in twitterProfile.create:", error);
        return null;
      }
    },
    update: async (params: any) => {
      try {
        if (twitterDb) return await twitterDb.twitterProfile.update(params);
        return null;
      } catch (error) {
        console.error("Error in twitterProfile.update:", error);
        return null;
      }
    },
    upsert: async (params: any) => {
      try {
        if (twitterDb) return await twitterDb.twitterProfile.upsert(params);
        return null;
      } catch (error) {
        console.error("Error in twitterProfile.upsert:", error);
        return null;
      }
    }
  },
  twitterWhitelist: {
    findMany: async (params?: any) => {
      try {
        if (twitterDb) return await twitterDb.twitterWhitelist.findMany(params);
        return [];
      } catch (error) {
        console.error("Error in twitterWhitelist.findMany:", error);
        return [];
      }
    },
    findUnique: async (params: any) => {
      try {
        if (twitterDb) return await twitterDb.twitterWhitelist.findUnique(params);
        return null;
      } catch (error) {
        console.error("Error in twitterWhitelist.findUnique:", error);
        return null;
      }
    },
    create: async (params: any) => {
      try {
        if (twitterDb) return await twitterDb.twitterWhitelist.create(params);
        return null;
      } catch (error) {
        console.error("Error in twitterWhitelist.create:", error);
        return null;
      }
    },
    update: async (params: any) => {
      try {
        if (twitterDb) return await twitterDb.twitterWhitelist.update(params);
        return null;
      } catch (error) {
        console.error("Error in twitterWhitelist.update:", error);
        return null;
      }
    },
    upsert: async (params: any) => {
      try {
        if (twitterDb) return await twitterDb.twitterWhitelist.upsert(params);
        return null;
      } catch (error) {
        console.error("Error in twitterWhitelist.upsert:", error);
        return null;
      }
    }
  },
  twitterSpace: {
    findMany: async (params?: any) => {
      try {
        if (twitterDb) return await twitterDb.twitterSpace.findMany(params);
        return [];
      } catch (error) {
        console.error("Error in twitterSpace.findMany:", error);
        return [];
      }
    },
    create: async (params: any) => {
      try {
        if (twitterDb) return await twitterDb.twitterSpace.create(params);
        return null;
      } catch (error) {
        console.error("Error in twitterSpace.create:", error);
        return null;
      }
    }
  },
  spaceRSVP: {
    findMany: async (params?: any) => {
      try {
        if (twitterDb) return await twitterDb.spaceRSVP.findMany(params);
        return [];
      } catch (error) {
        console.error("Error in spaceRSVP.findMany:", error);
        return [];
      }
    },
    create: async (params: any) => {
      try {
        if (twitterDb) return await twitterDb.spaceRSVP.create(params);
        return null;
      } catch (error) {
        console.error("Error in spaceRSVP.create:", error);
        return null;
      }
    }
  }
};

// Export the safe wrapper in production, or the real client in development
export const db = process.env.NODE_ENV === 'production' ? safeTwitterDbWrapper : twitterDb || safeTwitterDbWrapper;

// Also export the raw twitterDb instance for direct access when needed
export { twitterDb };

// Create proxy methods for fallback operation if Twitter client isn't available
if (!hasTwitterClient) {
  console.warn("Using fallback Twitter client. Limited functionality available.");
}