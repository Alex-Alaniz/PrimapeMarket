import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ✅ Test database connection when the API is called
async function testDBConnection() {
  try {
    await db.$connect();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw new Error("Database connection error");
  }
}

// 🔹 CREATE (POST) - Add a new user profile
export async function POST(req: Request) {
  try {
    await testDBConnection(); // Check DB connection

    const { wallet_address, username, email, profile_img_url } =
      await req.json();

    if (!wallet_address || !username || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newUser = await db.userProfile.create({
      data: {
        wallet_address,
        username,
        email,
        profile_img_url,
        display_name: username,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.log("Error creating user:", error);
    // Handle specific error codes;
    // if ((error as { code?: string }).code === "P2002") {
    //   alert("User already exists");
    // }
    TODO: return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );
  }
}

// 🔹 READ (GET) - Fetch user by wallet address
export async function GET(req: Request) {
  try {
    await testDBConnection(); // Check DB connection

    const { searchParams } = new URL(req.url);
    const wallet_address = searchParams.get("wallet_address");

    if (!wallet_address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const user = await db.userProfile.findUnique({ where: { wallet_address } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 });
  }
}

// 🔹 UPDATE (PUT) - Update user profile
export async function PUT(req: Request) {
  try {
    // await testDBConnection(); // Check DB connection

    const { wallet_address, username, email, profile_img_url, display_name } =
      await req.json();

    if (!wallet_address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const updatedUser = await db.userProfile.update({
      where: { wallet_address },
      data: { username, email, profile_img_url, display_name },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Error updating user" }, { status: 500 });
  }
}

// 🔹 DELETE (DELETE) - Delete user by wallet address
export async function DELETE(req: Request) {
  try {
    await testDBConnection(); // Check DB connection

    const { searchParams } = new URL(req.url);
    const wallet_address = searchParams.get("wallet_address");

    if (!wallet_address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    await db.userProfile.delete({ where: { wallet_address } });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
  }
}
