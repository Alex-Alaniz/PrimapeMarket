
// Script to copy Prisma engines for Vercel deployment
const fs = require('fs');
const path = require('path');

console.log('Starting Prisma engine copy process for Vercel deployment...');

try {
  // Source directories
  const twitterPrismaDir = path.join(process.cwd(), 'node_modules/@prisma/twitter-client');
  const mainPrismaDir = path.join(process.cwd(), 'node_modules/@prisma/client');
  
  // Destination directories
  const vercelOutputDir = path.join(process.cwd(), '.vercel/output/functions/_prisma-client');
  
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(vercelOutputDir)) {
    console.log(`Creating output directory: ${vercelOutputDir}`);
    fs.mkdirSync(vercelOutputDir, { recursive: true });
  }
  
  // Copy Twitter Prisma client binaries if available
  if (fs.existsSync(twitterPrismaDir)) {
    console.log('Copying Twitter Prisma client binaries...');
    
    // Get list of files in the directory
    const files = fs.readdirSync(twitterPrismaDir);
    
    // Find and copy binary files
    files.forEach(file => {
      if (file.includes('libquery_engine') || file.includes('query-engine') || file.endsWith('.node') || file.includes('schema.prisma')) {
        const sourcePath = path.join(twitterPrismaDir, file);
        const destPath = path.join(vercelOutputDir, file);
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${file} to ${vercelOutputDir}`);
      }
    });
  } else {
    console.warn('Twitter Prisma client directory not found:', twitterPrismaDir);
  }
  
  // Also ensure main Prisma client binaries are copied
  if (fs.existsSync(mainPrismaDir)) {
    console.log('Copying main Prisma client binaries...');
    
    // Get list of files in the directory
    const files = fs.readdirSync(mainPrismaDir);
    
    // Find and copy binary files
    files.forEach(file => {
      if (file.includes('libquery_engine') || file.includes('query-engine') || file.endsWith('.node') || file.includes('schema.prisma')) {
        const sourcePath = path.join(mainPrismaDir, file);
        const destPath = path.join(vercelOutputDir, file);
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${file} to ${vercelOutputDir}`);
      }
    });
  } else {
    console.warn('Main Prisma client directory not found:', mainPrismaDir);
  }

  console.log('Prisma engines copy process completed.');
} catch (error) {
  console.error('Error copying Prisma engines:', error);
  process.exit(1);
}
