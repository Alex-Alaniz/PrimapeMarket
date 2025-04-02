
// Script to add creators to whitelist
// Run with: node scripts/add-creators-to-whitelist.js

const { PrismaClient } = require('./prisma/twitter-client');
const twitterDb = new PrismaClient();

// List of Twitter usernames to add (without @ symbol)
const CREATORS_TO_ADD = [
  { username: 'AlexDotEth', category: 'Spaces', points: 250 },
  // Add more creators here in the same format
  // { username: 'handle', category: 'Spaces', points: 250 },
];

async function addCreatorsToWhitelist() {
  console.log(`Adding ${CREATORS_TO_ADD.length} creators to whitelist...`);
  
  for (const creator of CREATORS_TO_ADD) {
    try {
      // Check if already exists
      const existing = await twitterDb.twitterWhitelist.findUnique({
        where: { username: creator.username }
      });
      
      if (existing) {
        console.log(`Creator @${creator.username} already in whitelist. Skipping.`);
        continue;
      }
      
      // Add to whitelist
      await twitterDb.twitterWhitelist.create({
        data: {
          username: creator.username,
          category: creator.category || 'Spaces',
          points: creator.points || 250,
          added_by: 'script',
        }
      });
      
      console.log(`Added @${creator.username} to whitelist.`);
    } catch (error) {
      console.error(`Error adding @${creator.username}:`, error);
    }
  }
  
  console.log('Finished adding creators to whitelist.');
}

addCreatorsToWhitelist()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script error:', error);
    process.exit(1);
  });
