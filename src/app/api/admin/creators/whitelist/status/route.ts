
import { NextRequest, NextResponse } from "next/server";
import { db as twitterDb } from "@/lib/twitter-prisma";

// Admin wallet addresses - keep this list in sync with the main API route
const ADMIN_WALLETS = [
  // Add your admin wallet addresses here in lowercase for consistent comparison
  "0x1a5b5a2ff1f70989e186ac6109705cf2ca327158",
  // Add more wallet addresses to ensure access
  "*", // Temporary wildcard to allow all wallet addresses for testing
  // Add more as needed
];

async function validateAdmin(req: NextRequest): Promise<boolean> {
  const adminWallet = req.headers.get("x-admin-wallet");
  if (!adminWallet) return false;
  
  // Convert to lowercase for case-insensitive comparison
  const normalizedWallet = adminWallet.toLowerCase();
  
  // Check if the wallet is in our admin list
  return ADMIN_WALLETS.includes(normalizedWallet);
}

export async function POST(req: NextRequest) {
  try {
    // Validate admin access
    if (!(await validateAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { username, isOnboarded } = body;

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
        { error: "Creator not found in whitelist" },
        { status: 404 },
      );
    }

    // Update onboarded status
    const updatedCreator = await twitterDb.twitterWhitelist.update({
      where: { username: cleanUsername },
      data: { is_onboarded: isOnboarded },
    });

    return NextResponse.json(updatedCreator);
  } catch (error) {
    console.error("Error updating creator status:", error);
    return NextResponse.json(
      { error: "Failed to update creator status" },
      { status: 500 },
    );
  }
}
