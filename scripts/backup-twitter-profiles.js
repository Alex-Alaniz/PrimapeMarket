
// Script to backup and restore Twitter profiles
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Temporarily use the regular PrismaClient until the Twitter client is generated
const twitterDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TWITTER_POSTGRES_URL || process.env.DATABASE_URL
    }
  }
});

const BACKUP_FOLDER = path.join(__dirname, '../backups');

// Ensure backup folder exists
if (!fs.existsSync(BACKUP_FOLDER)) {
  fs.mkdirSync(BACKUP_FOLDER, { recursive: true });
}

async function backupTwitterProfiles() {
  console.log('Backing up Twitter profiles...');
  
  try {
    // Get all profiles from DB - use the TwitterProfile table if it exists
    let profiles = [];
    try {
      profiles = await twitterDb.twitterProfile.findMany();
    } catch (error) {
      console.log('TwitterProfile table not found, creating an empty backup');
    }
    
    // Write to backup file with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = path.join(BACKUP_FOLDER, `twitter_profiles_${timestamp}.json`);
    
    fs.writeFileSync(backupPath, JSON.stringify(profiles, null, 2));
    console.log(`Backup successful! ${profiles.length} profiles saved to ${backupPath}`);
    
    return backupPath;
  } catch (error) {
    console.error('Error backing up Twitter profiles:', error);
    throw error;
  }
}

async function restoreTwitterProfiles(backupFile) {
  console.log(`Restoring Twitter profiles from ${backupFile}...`);
  
  try {
    const backupPath = backupFile || path.join(BACKUP_FOLDER, fs.readdirSync(BACKUP_FOLDER)
      .filter(file => file.startsWith('twitter_profiles_'))
      .sort()
      .pop());
    
    if (!backupPath) {
      console.error('No backup file found');
      return;
    }
    
    const profiles = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    // Count restored and skipped profiles
    let restored = 0;
    let skipped = 0;
    
    // Check if TwitterProfile table exists
    try {
      await twitterDb.twitterProfile.findFirst();
      
      for (const profile of profiles) {
        try {
          // Check if profile exists to avoid duplicates
          const existing = await twitterDb.twitterProfile.findUnique({
            where: { id: profile.id }
          });
          
          if (existing) {
            skipped++;
            continue;
          }
          
          // Create profile
          await twitterDb.twitterProfile.create({
            data: profile
          });
          restored++;
        } catch (error) {
          console.error(`Error restoring profile ${profile.username}:`, error);
        }
      }
    } catch (error) {
      console.error('TwitterProfile table not found, run prisma generate first');
    }
    
    console.log(`Restoration complete: ${restored} profiles restored, ${skipped} skipped.`);
  } catch (error) {
    console.error('Error restoring Twitter profiles:', error);
    throw error;
  }
}

// If script is run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const backupFile = args[1];
  
  if (command === 'backup') {
    backupTwitterProfiles()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Script error:', error);
        process.exit(1);
      });
  } else if (command === 'restore') {
    restoreTwitterProfiles(backupFile)
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Script error:', error);
        process.exit(1);
      });
  } else {
    console.log('Usage: node backup-twitter-profiles.js [backup|restore] [backup_file_path]');
    process.exit(1);
  }
}

module.exports = {
  backupTwitterProfiles,
  restoreTwitterProfiles
};
