import { NextRequest, NextResponse } from "next/server";
import { getTwitterProfileData, cacheTwitterProfile } from "@/lib/twitter-api";
import { db } from "@/lib/twitter-prisma";

// Admin wallet addresses (same as in other admin routes)
const ADMIN_WALLETS = [
  "0xD1D1B36c40D522eb84D9a8f76A99f713A9BfA9C4",
  "0xE9e6a56Fe9b8C47dF185B25e3B07f7d08e1fBb77",
  "0xc88B5AaC42e0FD868cBCE2D0C5A8aA30a91FB9EA",
  "0xC17A09F8599B53d55Fa6426f38B6F6F7C4d95A10"
];

export async function POST(req: NextRequest) {
  try {
    // Get connected wallet from request
    const data = await req.json();
    const { walletAddress, username } = data;

    // Validate admin wallet
    if (!ADMIN_WALLETS.includes(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Fetch Twitter profile data
    const twitterData = await getTwitterProfileData(username);

    if (!twitterData) {
      return NextResponse.json({ error: 'Failed to fetch Twitter profile' }, { status: 404 });
    }

    // Cache the Twitter profile
    await cacheTwitterProfile(twitterData);

    return NextResponse.json({ success: true, profile: twitterData });
  } catch (error) {
    console.error('Error in fetch-single API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
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
    const creator = await db.twitterWhitelist.findUnique({
      where: { username: cleanUsername },
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Creator not found in whitelist" },
        { status: 404 },
      );
    }

    // Get existing profile if any
    const existingProfile = await db.twitterProfile.findUnique({
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

async function validateAdmin(req: NextRequest): Promise<boolean> {
  const adminWallet = req.headers.get("x-admin-wallet");
  if (!adminWallet) return false;
  
  // Convert to lowercase for case-insensitive comparison
  const normalizedWallet = adminWallet.toLowerCase();
  
  // Check if the wallet is in our admin list
  return ADMIN_WALLETS.includes(normalizedWallet);
}