
import { NextRequest, NextResponse } from "next/server";
import { twitterDb } from "@/lib/twitter-prisma";

// Admin wallet addresses - keep this list secure and limited
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

// POST /api/admin/spaces/status - Update space status
export async function POST(req: NextRequest) {
  try {
    // Validate admin access
    if (!(await validateAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, isActive } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Space ID is required" },
        { status: 400 },
      );
    }

    // Update the space (in a real implementation, you might have a specific status field)
    const updatedSpace = await twitterDb.twitterSpace.update({
      where: { id },
      data: {
        // This could be a specific status field in your schema
        // For now, we'll use a placeholder approach
        // isActive: isActive,
        description: isActive 
          ? `${(await twitterDb.twitterSpace.findUnique({ where: { id } }))?.description || ''} (Active)`.trim()
          : ((await twitterDb.twitterSpace.findUnique({ where: { id } }))?.description || '')
              .replace(/ \(Active\)$/, ''),
      },
      include: {
        hosts: true,
      },
    });

    return NextResponse.json(updatedSpace);
  } catch (error) {
    console.error("Error updating space status:", error);
    return NextResponse.json(
      { error: "Failed to update space status" },
      { status: 500 },
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { twitterDb } from "@/lib/twitter-prisma";

// Admin wallet addresses - keep this list secure and limited
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

// POST /api/admin/spaces/status - Update space status
export async function POST(req: NextRequest) {
  try {
    // Validate admin access
    if (!(await validateAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, isActive } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Space ID is required" },
        { status: 400 },
      );
    }

    // Update the space (in a real implementation, you might have a specific status field)
    const updatedSpace = await twitterDb.twitterSpace.update({
      where: { id },
      data: {
        // This could be a specific status field in your schema
        // For now, we'll use a placeholder approach
        // isActive: isActive,
        description: isActive 
          ? `${(await twitterDb.twitterSpace.findUnique({ where: { id } }))?.description || ''} (Active)`.trim()
          : ((await twitterDb.twitterSpace.findUnique({ where: { id } }))?.description || '')
              .replace(/ \(Active\)$/, ''),
      },
      include: {
        hosts: true,
      },
    });

    return NextResponse.json(updatedSpace);
  } catch (error) {
    console.error("Error updating space status:", error);
    return NextResponse.json(
      { error: "Failed to update space status" },
      { status: 500 },
    );
  }
}
