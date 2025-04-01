import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * ✅ Test database connection when the API is called.
 */
async function testDBConnection() {
  try {
    await db.$connect();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw new Error("Database connection error");
  }
}

function isPrismaError(
  error: unknown
): error is { code: string; meta?: { target: string[] } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: string }).code === "string"
  );
}

/**
 * 🔹 CREATE (POST) - Add a new user profile.
 */
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Utility to check for Prisma errors
function isPrismaError(
  error: unknown
): error is { code: string; meta?: { target: string[] } } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: string }).code === "string"
  );
}

export async function POST(req: NextRequest) {
  try {
    const { wallet_address, display_name, profile_img_url, username } = await req.json();

    // Validate required fields
    if (!wallet_address) {
      return NextResponse.json(
        {
          error: "Missing required fields: wallet_address",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.userProfile.findUnique({
      where: { wallet_address }
    });

    if (existingUser) {
      // User already exists, return the user
      return NextResponse.json(existingUser, { status: 200 });
    }

    // Create a new user
    const newUser = await db.userProfile.create({
      data: {
        wallet_address,
        display_name: display_name || "",
        profile_img_url: profile_img_url || "",
        username: username || ""
      },
    });

    // Create an entry in the leaderboard
    await db.usersLeaderboard.create({
      data: {
        primary_wallet: wallet_address,
      }
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating user:", error);

    // Check if it's a Prisma error
    if (isPrismaError(error) && error.code === "P2002") {
      const field = error.meta?.target?.[0]; // Extract field causing the unique constraint violation
      return NextResponse.json(
        { error: `User with this ${field} already exists` },
        { status: 409 }
      );
    }

    // Handle other errors
    return NextResponse.json({ error: "Error creating user" }, { status: 500 });

//       let errorMessage = "A user with this information already exists.";
//       if (field === "username") errorMessage = "Username is already taken.";
//       if (field === "email") errorMessage = "Email is already registered.";
//       if (field === "wallet_address")
//         errorMessage = "Wallet address is already linked to an account.";

//       return NextResponse.json({ error: errorMessage }, { status: 409 }); // HTTP 409 Conflict
//     }

//     // ✅ Ensure error is an instance of Error before accessing message
//     if (error instanceof Error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ error: "Error creating user" }, { status: 500 });
//   }
// }

/**
 * 🔹 READ (GET) - Fetch user by wallet address.
 */
export async function GET(req: Request) {
  try {
    await testDBConnection(); // Ensure DB connection is active

    const { searchParams } = new URL(req.url);
    const wallet_address = searchParams.get("wallet_address");

    // Validate required parameters
    if (!wallet_address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Find user by wallet address
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

/**
 * 🔹 UPDATE (PUT) - Update user profile.
 */
export async function PUT(req: Request) {
  try {
    const { wallet_address, username, email, profile_img_url, display_name } =
      await req.json();

    // Validate wallet address
    if (!wallet_address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await db.userProfile.update({
      where: { wallet_address },
      data: { username, email, profile_img_url, display_name },
    });

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error("Error updating user:", error);

    // Handle unique constraint violations
    if (isPrismaError(error) && error.code === "P2002") {
      const field = error.meta?.target?.[0];

      let errorMessage = "Update failed due to unique constraint violation.";
      if (field === "username")
        errorMessage = "This username is already in use.";
      if (field === "email")
        errorMessage = "This email is already associated with another account.";

      return NextResponse.json({ error: errorMessage }, { status: 409 });
    }

    return NextResponse.json({ error: "Error updating user" }, { status: return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }
}

/**
 * 🔹 UPDATE (PUT) - Update a user profile.
 */
export async function PUT(req: NextRequest) {
  try {
    const { wallet_address, display_name, profile_img_url, username, email } = await req.json();

    // Validate required fields
    if (!wallet_address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.userProfile.findUnique({
      where: { wallet_address }
    });

    if (!existingUser) {
      // User doesn't exist, create it
      const newUser = await db.userProfile.create({
        data: {
          wallet_address,
          display_name: display_name || "",
          profile_img_url: profile_img_url || "",
          username: username || "",
          email: email || ""
        },
      });
      
      return NextResponse.json(newUser, { status: 201 });
    }

    // Update user profile
    const updatedUser = await db.userProfile.update({
      where: { wallet_address },
      data: {
        display_name: display_name !== undefined ? display_name : existingUser.display_name,
        profile_img_url: profile_img_url !== undefined ? profile_img_url : existingUser.profile_img_url,
        username: username !== undefined ? username : existingUser.username,
        email: email !== undefined ? email : existingUser.email
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Error updating user" }, { status: 500 });
  }
}

/**
 * 🔹 DELETE (DELETE) - Delete user by wallet address.
 */
export async function DELETE(req: Request) {
  try {
    await testDBConnection(); // Ensure DB connection is active

    const { searchParams } = new URL(req.url);
    const wallet_address = searchParams.get("wallet_address");

    // Validate required parameters
    if (!wallet_address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Delete user profile
    await db.userProfile.delete({ where: { wallet_address } });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
  }
}
