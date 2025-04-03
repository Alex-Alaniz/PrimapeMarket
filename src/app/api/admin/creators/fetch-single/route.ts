
import { NextRequest, NextResponse } from "next/server";
import { getTwitterProfileData, cacheTwitterProfile } from "@/lib/twitter-api";
import { db as twitterDb } from "@/lib/twitter-prisma";

// Admin wallet addresses (same as in other admin routes)
const ADMIN_WALLETS = [
  "0x1a5b5a2ff1f70989e186ac6109705cf2ca327158",
  "*", // Temporary wildcard to allow all wallet addresses for testing
];

async function validateAdmin(req: NextRequest): Promise<boolean> {
  const adminWallet = req.headers.get("x-admin-wallet");
  if (!adminWallet) return false;
  
  // Convert to lowercase for case-insensitive comparison
  const normalizedWallet = adminWallet.toLowerCase();
  
  // Check if the wallet is in our admin list
  return ADMIN_WALLETS.includes(normalizedWallet);
}

// POST /api/admin/creators/fetch-single - Fetch a single Twitter profile
export async function POST(req: NextRequest) {
  try {
    // Validate admin access
    if (!(await validateAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 },
      );
    }

    // Clean username (remove @ if present)
    const cleanUsername = username.replace("@", "");

    // Check if creator exists in whitelist
    const creator = await twitterDb.twitterWhitelist.findUnique({
      where: { username: cleanUsername },
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found in whitelist", success: false },
        { status: 404 },
      );
    }

    // Get existing profile if any
    const existingProfile = await twitterDb.twitterProfile.findUnique({
      where: { username: cleanUsername }
    });

    // Fetch the Twitter profile
    console.log(`Manually fetching Twitter data for ${cleanUsername}`);
    const twitterData = await getTwitterProfileData(cleanUsername);

    if (!twitterData) {
      return NextResponse.json({
        error: "Failed to fetch Twitter data",
        success: false,
        existingProfile: existingProfile || null,
      }, { status: 500 });
    }

    // Cache the Twitter profile
    await cacheTwitterProfile(twitterData);

    return NextResponse.json({
      success: true,
      message: `Successfully fetched and cached Twitter data for ${cleanUsername}`,
      oldProfile: existingProfile || null,
      newProfile: twitterData
    });
    
  } catch (error: any) {
    console.error("Error fetching creator profile:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch creator profile", 
        message: error.message || "Unknown error",
        success: false 
      },
      { status: 500 },
    );
  }
}

// GET - Get Twitter profile status for a username
export async function GET(req: NextRequest) {
  try {
    // Validate admin access
    if (!(await validateAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter is required" },
        { status: 400 },
      );
    }

    // Clean username (remove @ if present)
    const cleanUsername = username.replace("@", "");

    // Check if creator exists in whitelist
    const creator = await twitterDb.twitterWhitelist.findUnique({
      where: { username: cleanUsername },
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found in whitelist" },
        { status: 404 },
      );
    }

    // Get existing profile if any
    const existingProfile = await twitterDb.twitterProfile.findUnique({
      where: { username: cleanUsername }
    });

    return NextResponse.json({
      username: cleanUsername,
      exists: !!existingProfile,
      profile: existingProfile
    });
    
  } catch (error) {
    console.error("Error checking profile status:", error);
    return NextResponse.json(
      { error: "Failed to check profile status" },
      { status: 500 },
    );
  }
}
