
import { PrismaClient } from "@prisma/twitter-client";

// Create a new PrismaClient instance specifically for Twitter data
// Using the Twitter-specific connection URL
const twitterDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TWITTER_POSTGRES_URL,
    },
  },
});

export { twitterDb };
