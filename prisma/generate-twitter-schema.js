
// Script to generate the Twitter Prisma schema
require('dotenv').config();

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Generating Twitter Prisma schema...');

try {
  console.log('Step 1: Generating Twitter Prisma client...');
  const generateOutput = execSync('npx prisma generate --schema=./prisma/twitter-schema.prisma', {
    stdio: 'inherit'
  });
  
  console.log('Step 2: Pushing schema to database...');
  // First create the database if it doesn't exist
  execSync('npx prisma db push --schema=./prisma/twitter-schema.prisma --accept-data-loss', {
    stdio: 'inherit'
  });
  
  console.log('Database schema pushed successfully');
  
  // Generate a type definition file to help TypeScript recognize the models
  console.log('Step 3: Ensuring TypeScript recognizes the models...');
  const typesDir = path.join(__dirname, '../src/types');
  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }
  
  const typesContent = `
// Auto-generated types for Twitter schema
import { PrismaClient } from '@prisma/twitter-client';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace TwitterPrisma {
    type TwitterClient = PrismaClient;
  }
}
`;
  
  fs.writeFileSync(path.join(typesDir, 'twitter-prisma.d.ts'), typesContent);
  
  console.log('Twitter schema generation and push complete.');
} catch (error) {
  console.error('Error during Twitter schema generation:', error);
  process.exit(1);
}
