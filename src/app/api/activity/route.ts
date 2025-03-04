
import { NextResponse } from "next/server";
import { db } from "@/lib/db/utils";

export async function GET(request: Request) {
  try {
    // Simulate user activity data until DB is fully set up
    const mockActivity = {
      participations: [
        {
          id: 1,
          marketId: 0,
          optionIndex: 1,
          timestamp: new Date().toISOString(),
          amount: "5.0"
        },
        {
          id: 2,
          marketId: 2,
          optionIndex: 0,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          amount: "2.5"
        }
      ],
      results: [
        {
          id: 1,
          marketId: 1,
          result: "win",
          amount: "7.5",
          timestamp: new Date(Date.now() - 172800000).toISOString()
        }
      ]
    };
    
    return NextResponse.json({ activity: mockActivity });
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
