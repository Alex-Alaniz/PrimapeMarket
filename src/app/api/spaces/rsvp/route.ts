
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/twitter-prisma";

// Simple RSVP API for Twitter spaces
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { spaceId, walletAddress, twitterUsername } = data;
    
    if (!spaceId || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if space exists
    const space = await db.twitterSpace.findUnique({
      where: {
        id: spaceId
      }
    });
    
    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }
    
    // Check if user already RSVP'd
    const existingRSVP = await (db as any).twitterSpaceRSVP.findFirst({
      where: {
        space_id: spaceId,
        wallet_address: walletAddress
      }
    });
    
    if (existingRSVP) {
      return NextResponse.json({ 
        success: true, 
        message: 'You have already RSVP\'d for this space',
        alreadyRSVPd: true
      });
    }
    
    // Create a unique RSVP ID with timestamp and wallet prefix
    const timestamp = Date.now().toString();
    const walletPrefix = walletAddress ? 
      (typeof walletAddress === 'string' ? walletAddress.substring(0, 8) : 'unknown') : 
      'unknown';
    const rsvpId = `rsvp_${timestamp}_${walletPrefix}`;
    
    // Create the RSVP
    await (db as any).twitterSpaceRSVP.create({
      data: {
        id: rsvpId,
        space_id: spaceId,
        wallet_address: walletAddress,
        twitter_username: twitterUsername || null,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    // Get updated RSVP count
    const rsvpCount = await (db as any).twitterSpaceRSVP.count({
      where: {
        space_id: spaceId
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'RSVP successful',
      rsvpCount
    });
  } catch (error) {
    console.error('Error in RSVP API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const spaceId = req.nextUrl.searchParams.get('spaceId');
    const walletAddress = req.nextUrl.searchParams.get('walletAddress');
    
    if (!spaceId) {
      return NextResponse.json({ error: 'Space ID is required' }, { status: 400 });
    }
    
    // Get RSVP count for the space
    const rsvpCount = await (db as any).twitterSpaceRSVP.count({
      where: {
        space_id: spaceId
      }
    });
    
    // Check if user has RSVP'd if wallet address is provided
    let hasRSVPd = false;
    if (walletAddress) {
      const userRSVP = await (db as any).twitterSpaceRSVP.findFirst({
        where: {
          space_id: spaceId,
          wallet_address: walletAddress
        }
      });
      
      hasRSVPd = !!userRSVP;
    }
    
    return NextResponse.json({
      success: true,
      rsvpCount,
      hasRSVPd
    });
  } catch (error) {
    console.error('Error in RSVP GET API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
