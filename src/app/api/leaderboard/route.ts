
import { NextResponse } from "next/server";
import { db } from "@/lib/db/utils";

export async function GET(request: Request) {
  try {
    // Simulate leaderboard data until DB is fully set up
    const mockLeaderboard = [
      {
        id: 1,
        rank: 1,
        username: "PrimatePredictor",
        walletAddress: "0x1234567890123456789012345678901234567890",
        profileImage: "/images/ape1.png",
        totalWinnings: "125.5",
        winRate: "75"
      },
      {
        id: 2,
        rank: 2,
        username: "ApeCoinWhale",
        walletAddress: "0x2345678901234567890123456789012345678901",
        profileImage: "/images/ape2.png",
        totalWinnings: "98.3",
        winRate: "68"
      },
      {
        id: 3,
        rank: 3,
        username: "CryptoApe",
        walletAddress: "0x3456789012345678901234567890123456789012",
        profileImage: "",
        totalWinnings: "45.7",
        winRate: "55"
      }
    ];
    
    return NextResponse.json({ leaderboard: mockLeaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
