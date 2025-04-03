
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/twitter-prisma";

// Admin wallet addresses - keep this list in sync with the main API route
const ADMIN_WALLETS = [
  "0xD1D1B36c40D522eb84D9a8f76A99f713A9BfA9C4",
  "0xE9e6a56Fe9b8C47dF185B25e3B07f7d08e1fBb77",
  "0xc88B5AaC42e0FD868cBCE2D0C5A8aA30a91FB9EA",
  "0xC17A09F8599B53d55Fa6426f38B6F6F7C4d95A10"
];

export async function GET(req: NextRequest) {
  try {
    // Get the wallet address from URL params
    const walletAddress = req.nextUrl.searchParams.get('walletAddress');
    
    // Validate admin wallet
    if (!walletAddress || !ADMIN_WALLETS.includes(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Get all whitelisted creators with their Twitter profile data if available
    const whitelistedCreators = await db.whitelistedCreator.findMany({
      orderBy: {
        username: 'asc'
      }
    });
    
    // Get all Twitter profiles in one query to avoid N+1 problem
    const twitterProfiles = await db.twitterProfile.findMany({
      where: {
        username: {
          in: whitelistedCreators.map(creator => creator.username)
        }
      }
    });
    
    // Create a map for quick lookup
    const profileMap = twitterProfiles.reduce((map, profile) => {
      map[profile.username] = profile;
      return map;
    }, {} as Record<string, any>);
    
    // Combine data
    const creatorsWithProfiles = whitelistedCreators.map(creator => {
      const profile = profileMap[creator.username];
      return {
        ...creator,
        twitterProfile: profile || null
      };
    });
    
    return NextResponse.json({
      success: true,
      creators: creatorsWithProfiles,
      count: creatorsWithProfiles.length
    });
  } catch (error) {
    console.error('Error in whitelist status API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
