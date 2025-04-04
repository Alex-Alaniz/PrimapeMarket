
import { NextRequest, NextResponse } from "next/server";
import { processBatch, getBatchStatus } from "@/lib/batch-twitter-fetcher";

// Admin wallet addresses (use the same as in other admin routes)
const ADMIN_WALLETS = [
  "0x1a5b5a2ff1f70989e186ac6109705cf2ca327158",
  "*" // Temporary wildcard for testing
];

async function validateAdmin(req: NextRequest): Promise<boolean> {
  const adminWallet = req.headers.get("x-admin-wallet");
  if (!adminWallet) return false;
  
  // Convert to lowercase for case-insensitive comparison
  const normalizedWallet = adminWallet.toLowerCase();
  
  // Check if the wallet is in our admin list
  return ADMIN_WALLETS.includes(normalizedWallet);
}

// GET /api/admin/creators/refresh - Get status of refresh process
export async function GET(req: NextRequest) {
  try {
    // Anyone can check status, but we'll include more details for admins
    const isAdmin = await validateAdmin(req);
    
    const status = getBatchStatus();
    
    if (!isAdmin) {
      // Limited info for non-admins
      return NextResponse.json({
        refreshInProgress: status.isProcessing,
        nextRefresh: status.nextBatchTime,
      });
    }
    
    // Full info for admins
    return NextResponse.json(status);
  } catch (error) {
    console.error("Error getting refresh status:", error);
    return NextResponse.json(
      { error: "Failed to get refresh status" },
      { status: 500 }
    );
  }
}

// POST /api/admin/creators/refresh - Trigger a refresh batch
export async function POST(req: NextRequest) {
  try {
    // Validate admin access
    if (!(await validateAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Process a batch
    const result = await processBatch();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error triggering refresh:", error);
    return NextResponse.json(
      { error: "Failed to trigger refresh" },
      { status: 500 }
    );
  }
}
