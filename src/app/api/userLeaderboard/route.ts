import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Function to test DB connection
async function testDBConnection() {
  try {
    await db.$connect();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw new Error("Database connection error");
  }
}

// GET API to fetch leaderboard users
export async function GET() {
  try {
    await testDBConnection();

    const users = await db.usersLeaderboard.findMany({
      orderBy: { total_won: "desc" }, // Sort by most wins
    });

    return NextResponse.json({ success: true, data: users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
