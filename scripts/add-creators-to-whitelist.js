// Script to add Twitter creators to the whitelist
require('dotenv').config();
const { twitterDb } = require('../src/lib/twitter-prisma');

// List of creators to add to whitelist
const creators = [
  { username: "ApeChainOrg", category: "Spaces", points: 500, is_onboarded: true },
  { username: "degentraland", category: "Spaces", points: 250, is_onboarded: true },
  { username: "poapxyz", category: "Spaces", points: 250, is_onboarded: true },
  { username: "BoredApeYC", category: "News", points: 400, is_onboarded: true },
  { username: "yugalabs", category: "News", points: 300, is_onboarded: true },
  { username: "ApeCoin", category: "News", points: 350, is_onboarded: true },
  { username: "OthersideMeta", category: "Spaces", points: 300, is_onboarded: true },
  { username: "nftfolk", category: "Podcasts", points: 200, is_onboarded: true },
  { username: "DeezeFi", category: "Spaces", points: 250, is_onboarded: true },
  { username: "Web3Station", category: "Spaces", points: 275, is_onboarded: true }
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