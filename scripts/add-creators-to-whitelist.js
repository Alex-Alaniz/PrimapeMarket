
// Script to add Twitter creators to the whitelist
require('dotenv').config();

// Import Twitter DB client similar to backup-twitter-profiles.js
let PrismaClient;
try {
  PrismaClient = require('@prisma/twitter-client').PrismaClient;
} catch (error) {
  // Fallback to regular PrismaClient if the Twitter client is not generated yet
  console.warn("Twitter client not found, using regular Prisma client as fallback");
  PrismaClient = require('@prisma/client').PrismaClient;
}

// Create a new instance of PrismaClient with the Twitter database URL
const twitterDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TWITTER_POSTGRES_URL || process.env.DATABASE_URL
    }
  }
});

// List of creators to add to whitelist
const creators = [
  // News accounts
  { username: "apecoin", category: "News", points: 250, is_onboarded: true },
  { username: "ApeChainHUB", category: "News", points: 250, is_onboarded: true },
  { username: "ApeWhaleNFT", category: "News", points: 250, is_onboarded: true },
  { username: "boringmerch", category: "News", points: 250, is_onboarded: true },
  { username: "BoredApeYC", category: "News", points: 250, is_onboarded: true },
  { username: "yugalabs", category: "News", points: 250, is_onboarded: true },
  
  // Spaces hosts
  { username: "iampapito_eth", category: "Spaces", points: 200, is_onboarded: true },
  { username: "ChrisJourdan", category: "Spaces", points: 200, is_onboarded: true },
  { username: "SteveKBark", category: "Spaces", points: 250, is_onboarded: true },
  { username: "Geist254", category: "Spaces", points: 200, is_onboarded: true },
  { username: "SanaeMolly", category: "Spaces", points: 200, is_onboarded: true },
  { username: "Shiba_King1991", category: "Spaces", points: 200, is_onboarded: true },
  { username: "ernestleedotcom", category: "Spaces", points: 200, is_onboarded: true },
  { username: "justchespie", category: "Spaces", points: 200, is_onboarded: true },
  { username: "GratefulApe_eth", category: "Spaces", points: 200, is_onboarded: true },
  { username: "beast_eth", category: "Spaces", points: 200, is_onboarded: true },
  { username: "jerodsm_", category: "Spaces", points: 250, is_onboarded: true },
  { username: "BoredApeGazette", category: "Spaces", points: 200, is_onboarded: true },
  { username: "ChainZilla_", category: "Spaces", points: 200, is_onboarded: true },
  { username: "ryancsmith2222", category: "Spaces", points: 200, is_onboarded: true },
  { username: "BOObotcher", category: "Spaces", points: 200, is_onboarded: true },
  { username: "QuinnFT_", category: "Spaces", points: 200, is_onboarded: true },
  { username: "Eddie_ShoBiz", category: "Spaces", points: 200, is_onboarded: true },
  { username: "supa_raw", category: "Spaces", points: 200, is_onboarded: true },
  { username: "lawofthesaw", category: "Spaces", points: 200, is_onboarded: true },
  
  // Streamers
  { username: "blueeye_queen", category: "Streamer", points: 200, is_onboarded: true }
];

async function addCreatorsToWhitelist() {
  console.log('Adding creators to whitelist...');

  let added = 0;
  let skipped = 0;

  try {
    // First, make sure the twitterWhitelist table exists
    // This is necessary because we're using a generic client that might not have the schema
    await ensureTwitterWhitelistTable();

    for (const creator of creators) {
      try {
        // Check if already exists
        const existing = await findTwitterWhitelistByUsername(creator.username);

        if (existing) {
          console.log(`Skipping ${creator.username} - already in whitelist`);
          skipped++;
          continue;
        }

        // Add to whitelist
        await createTwitterWhitelistEntry(creator);

        console.log(`Added ${creator.username} to whitelist`);
        added++;
      } catch (error) {
        console.error(`Error adding ${creator.username}:`, error);
      }
    }
  } catch (error) {
    console.error('Script error:', error);
  }

  console.log(`Completed: Added ${added} creators, skipped ${skipped} existing creators`);
}

// Helper function to ensure the twitterWhitelist table exists (for fallback client)
async function ensureTwitterWhitelistTable() {
  try {
    // If using the twitter-specific client, this should already exist
    // If using fallback, we need to check and potentially create it
    
    // Try to query the table to see if it exists
    await twitterDb.$queryRaw`SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = 'TwitterWhitelist'
    )`;
    
    // If we get here, the table exists in some form
    console.log("TwitterWhitelist table exists");
    
  } catch (error) {
    console.warn("TwitterWhitelist table check failed:", error.message);
    console.log("Creating TwitterWhitelist table...");
    
    // Create the table if it doesn't exist
    try {
      await twitterDb.$executeRaw`
        CREATE TABLE IF NOT EXISTS "TwitterWhitelist" (
          "id" SERIAL PRIMARY KEY,
          "username" TEXT UNIQUE NOT NULL,
          "category" TEXT NOT NULL,
          "points" INTEGER NOT NULL DEFAULT 0,
          "is_onboarded" BOOLEAN NOT NULL DEFAULT false,
          "added_by" TEXT,
          "added_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log("Created TwitterWhitelist table");
    } catch (createError) {
      console.error("Failed to create TwitterWhitelist table:", createError);
      throw createError;
    }
  }
}

// Helper function to find a whitelist entry by username
async function findTwitterWhitelistByUsername(username) {
  const cleanUsername = username.replace('@', '');
  
  try {
    // First try with the presumed model name from the Twitter client
    return await twitterDb.twitterWhitelist.findUnique({
      where: { username: cleanUsername }
    });
  } catch (error) {
    // If that fails, try with raw SQL
    try {
      const results = await twitterDb.$queryRaw`
        SELECT * FROM "TwitterWhitelist" WHERE "username" = ${cleanUsername}
      `;
      return results.length > 0 ? results[0] : null;
    } catch (sqlError) {
      console.error("Raw SQL query failed:", sqlError);
      return null;
    }
  }
}

// Helper function to create a whitelist entry
async function createTwitterWhitelistEntry(creator) {
  const cleanUsername = creator.username.replace('@', '');
  
  try {
    // First try with the presumed model name from the Twitter client
    return await twitterDb.twitterWhitelist.create({
      data: {
        username: cleanUsername,
        category: creator.category,
        points: creator.points,
        is_onboarded: creator.is_onboarded,
        added_by: "admin_script"
      }
    });
  } catch (error) {
    // If that fails, try with raw SQL
    try {
      await twitterDb.$executeRaw`
        INSERT INTO "TwitterWhitelist" ("username", "category", "points", "is_onboarded", "added_by")
        VALUES (${cleanUsername}, ${creator.category}, ${creator.points}, ${creator.is_onboarded}, 'admin_script')
      `;
      
      // Return something that looks like what the client would return
      return {
        username: cleanUsername,
        category: creator.category,
        points: creator.points,
        is_onboarded: creator.is_onboarded,
        added_by: "admin_script",
        added_at: new Date()
      };
    } catch (sqlError) {
      console.error("Raw SQL insert failed:", sqlError);
      throw sqlError;
    }
  }
}

// Execute if run directly
if (require.main === module) {
  addCreatorsToWhitelist()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script error:', error);
      process.exit(1);
    });
}

module.exports = { addCreatorsToWhitelist };
