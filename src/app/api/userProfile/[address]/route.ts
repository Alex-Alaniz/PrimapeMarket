
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * 🔹 READ (GET) - Fetch user by wallet address from path parameter.
 */
export async function GET(
  request: Request,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    
    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Find user by wallet address
    const user = await db.userProfile.findUnique({ 
      where: { wallet_address: address },
      select: {
        wallet_address: true,
        username: true,
        display_name: true,
        profile_img_url: true,
        // Exclude email and other sensitive fields for public profile
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
}
