
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
const migrationOutput = execSync(
  'npx prisma migrate dev --name twitter_cache_schema --schema=./prisma/twitter-schema.prisma',
  { stdio: 'pipe' }
);
console.log('Migration Output:', migrationOutput.toString());

console.log('Twitter schema generation and migration complete.');
