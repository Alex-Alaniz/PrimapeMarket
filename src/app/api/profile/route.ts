import { NextResponse } from "next/server";
import { db } from "@/lib/db/utils";

export async function GET(request: Request) {
  try {
    // Simulate user profile data until DB is fully set up
    const mockProfile = {
      id: 1,
      username: "YourUsername",
      walletAddress: "0x1234567890123456789012345678901234567890",
      profileImage: "/images/ape1.png",
      bio: "Crypto enthusiast and prediction market player",
      totalWinnings: "45.7",
      winRate: "60",
      totalParticipation: 12,
      rank: 5
    };

    return NextResponse.json({ user: mockProfile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const dbUser = await getOrCreateUser(user.walletAddress);
    const data = await request.json();
    
    // Only allow updating certain fields
    const allowedFields = ['username', 'profileImage', 'bio'];
    const updateData: Record<string, any> = {};
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }
    
    const updatedUser = await updateUserProfile(dbUser.id, updateData);
    return NextResponse.json({ user: updatedUser[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}