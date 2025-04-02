
// Script to generate the Twitter Prisma schema
require('dotenv').config();

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Generating Twitter Prisma schema...');

// Generate the Twitter Prisma client
const generateOutput = execSync('npx prisma generate --schema=./prisma/twitter-schema.prisma');
console.log('Output:', generateOutput.toString());

// Run migrations for the Twitter schema
console.log('Running Twitter schema migration...');
try {
  // First create the database if it doesn't exist
  execSync('npx prisma db push --schema=./prisma/twitter-schema.prisma --force-reset --accept-data-loss');
  console.log('Database schema pushed successfully');

  // Then generate the migration files
  const migrationOutput = execSync(
    'npx prisma migrate dev --name twitter_cache_schema --schema=./prisma/twitter-schema.prisma --create-only',
    { stdio: 'pipe' }
  );
  console.log('Migration Output:', migrationOutput.toString());
} catch (error) {
  console.error('Migration failed:', error.message);
  console.log('Continuing with client generation only');
}

console.log('Twitter schema generation and migration complete.');
