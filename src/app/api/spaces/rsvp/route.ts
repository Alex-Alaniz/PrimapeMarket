
import { NextRequest, NextResponse } from "next/server";
import { twitterDb } from "@/lib/twitter-prisma";

// Simple RSVP API for Twitter spaces
export async function POST(req: NextRequest) {
  try {
    const { spaceId, walletAddress } = await req.json();
    
    if (!spaceId || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the space exists
    const space = await twitterDb.twitterSpace.findUnique({
      where: { id: spaceId },
      include: { hosts: true }
    });

    if (!space) {
      return NextResponse.json(
        { error: "Twitter space not found" },
        { status: 404 }
      );
    }

    // Store RSVP in the Twitter database
    const rsvp = await twitterDb.spaceRSVP.upsert({
      where: {
        spaceId_walletAddress: {
          spaceId,
          walletAddress,
        },
      },
      update: {
        updatedAt: new Date(),
      },
      create: {
        spaceId,
        walletAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "RSVP recorded successfully",
      data: rsvp,
      space: {
        id: space.id,
        title: space.title,
        start_time: space.start_time,
        hosts: space.hosts.map(host => host.username)
      }
    });
  } catch (error) {
    console.error("Error recording RSVP:", error);
    return NextResponse.json(
      { error: "Failed to record RSVP" },
      { status: 500 }
    );
  }
}

// Get RSVPs for a space or by a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const spaceId = searchParams.get("spaceId");
    const walletAddress = searchParams.get("wallet");

    if (!spaceId && !walletAddress) {
      return NextResponse.json(
        { error: "Either spaceId or wallet address is required" },
        { status: 400 }
      );
    }

    let whereClause = {};
    
    if (spaceId) {
      whereClause = { ...whereClause, spaceId };
    }
    
    if (walletAddress) {
      whereClause = { ...whereClause, walletAddress };
    }

    const rsvps = await twitterDb.spaceRSVP.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: rsvps,
    });
  } catch (error) {
    console.error("Error fetching RSVPs:", error);
    return NextResponse.json(
      { error: "Failed to fetch RSVPs" },
      { status: 500 }
    );
  }
}
