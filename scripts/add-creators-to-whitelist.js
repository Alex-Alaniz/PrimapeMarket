
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

  for (const creator of creators) {
    try {
      // Check if already exists
      const existing = await twitterDb.twitterWhitelist.findUnique({
        where: { username: creator.username }
      });

      if (existing) {
        console.log(`Skipping ${creator.username} - already in whitelist`);
        skipped++;
        continue;
      }

      // Add to whitelist
      await twitterDb.twitterWhitelist.create({
        data: {
          username: creator.username,
          category: creator.category,
          points: creator.points,
          is_onboarded: creator.is_onboarded,
          added_by: "admin_script"
        }
      });

      console.log(`Added ${creator.username} to whitelist`);
      added++;
    } catch (error) {
      console.error(`Error adding ${creator.username}:`, error);
    }
  }

  console.log(`Completed: Added ${added} creators, skipped ${skipped} existing creators`);
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
