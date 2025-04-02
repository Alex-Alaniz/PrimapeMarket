
// Script to add creators to whitelist
// Run with: node scripts/add-creators-to-whitelist.js

const { PrismaClient } = require('@prisma/client');
const twitterDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TWITTER_POSTGRES_URL || process.env.DATABASE_URL
    }
  }
});

// List of Twitter usernames to add (without @ symbol)
const creators = [
  // Main hosts from the schedule
  { username: "ApeChain", category: "Spaces", points: 250 },
  { username: "CaptainZwingli", category: "Spaces", points: 250 },
  { username: "BlueEyeQueen", category: "Spaces", points: 250 },
  { username: "RedGoatQueen", category: "Spaces", points: 250 },
  { username: "ShibaKing", category: "Spaces", points: 250 },
  { username: "ShodiBuxrex", category: "Spaces", points: 250 },
  { username: "KevBitNFT", category: "Spaces", points: 250 },
  { username: "DAKMAN", category: "Spaces", points: 250 },
  { username: "Lufficator", category: "Spaces", points: 250 },
  // Additional hosts
  { username: "MahaveIi", category: "Spaces", points: 200 },
  { username: "CHIEFDA1000", category: "Spaces", points: 200 },
  { username: "APE_PUB", category: "Spaces", points: 200 },
  { username: "SHILLYOURSHIT", category: "Spaces", points: 200 },
  { username: "ApeCareBuddy", category: "Spaces", points: 200 },
  { username: "SpaceKntyXD", category: "Spaces", points: 200 }
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
          is_onboarded: true,
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
    .then(() => {
      console.log('Creators whitelist update complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script error:', error);
      process.exit(1);
    });
}
