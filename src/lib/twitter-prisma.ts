
import { PrismaClient as DefaultPrismaClient } from "@prisma/client";

// Try to import the Twitter-specific PrismaClient
let PrismaClient: any;
try {
  // Dynamic import to avoid build errors when the module doesn't exist yet
  PrismaClient = require("@prisma/twitter-client").PrismaClient;
} catch (error) {
  // Fallback to regular PrismaClient if the Twitter client is not generated yet
  console.warn("Twitter client not found, using regular Prisma client as fallback");
  PrismaClient = DefaultPrismaClient;
}

// Create a new PrismaClient instance specifically for Twitter data
// Using the Twitter-specific connection URL
const twitterDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TWITTER_POSTGRES_URL || process.env.DATABASE_URL,
    },
  },
});

export { twitterDb };
