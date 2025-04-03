
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
  } catch (error: any) {
    mainDbStatus = `Error: ${error?.message || 'Unknown error'}`;
  }

  // Test Twitter database connection
  let twitterDbStatus = 'Unknown';
  let twitterDbClientType = rawTwitterDb ? 'Real Client' : 'Fallback Wrapper';
  let creatorCount = 0;
  let profileCount = 0;
  
  try {
    // Try to make a simple query to test the connection and count all creators
    const creators = await twitterDb.twitterWhitelist.findMany();
    creatorCount = creators?.length || 0;
    
    // Also count Twitter profiles
    const profiles = await twitterDb.twitterProfile.findMany();
    profileCount = profiles?.length || 0;
    
    twitterDbStatus = creators ? 
      `Connected (found ${creatorCount} creators and ${profileCount} profiles)` : 
      'Connected but no records found';
  } catch (error: any) {
    twitterDbStatus = `Error: ${error?.message || 'Unknown error'}`;
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
      counts: {
        whitelistedCreators: creatorCount,
        twitterProfiles: profileCount
      }
    }
  });
}
