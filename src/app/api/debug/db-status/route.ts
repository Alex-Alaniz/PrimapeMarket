
import { NextResponse } from 'next/server';
import { db as mainDb } from '@/lib/prisma';
import { db as twitterDb, twitterDb as rawTwitterDb } from '@/lib/twitter-prisma';

export async function GET() {
  // Check environment variables (redacted for security)
  const envVars = {
    DATABASE_URL: !!process.env.DATABASE_URL ? 'Set' : 'Not set',
    DATABASE_URL_TWITTER: !!process.env.DATABASE_URL_TWITTER ? 'Set' : 'Not set',
    TWITTER_POSTGRES_URL: !!process.env.TWITTER_POSTGRES_URL ? 'Set' : 'Not set',
    POSTGRES_URL: !!process.env.POSTGRES_URL ? 'Set' : 'Not set',
  };

  // Test main database connection
  let mainDbStatus = 'Unknown';
  try {
    await mainDb.$connect();
    mainDbStatus = 'Connected';
  } catch (error) {
    mainDbStatus = `Error: ${error.message}`;
  }

  // Test Twitter database connection
  let twitterDbStatus = 'Unknown';
  let twitterDbClientType = rawTwitterDb ? 'Real Client' : 'Fallback Wrapper';
  
  try {
    // Try to make a simple query to test the connection
    const creators = await twitterDb.twitterWhitelist.findMany({ take: 1 });
    twitterDbStatus = creators ? 
      `Connected (found ${creators.length} sample records)` : 
      'Connected but no records found';
  } catch (error) {
    twitterDbStatus = `Error: ${error.message}`;
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environmentVariables: envVars,
    mainDatabase: {
      status: mainDbStatus,
    },
    twitterDatabase: {
      status: twitterDbStatus,
      clientType: twitterDbClientType,
    }
  });
}
