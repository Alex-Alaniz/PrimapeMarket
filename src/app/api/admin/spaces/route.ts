import { NextRequest, NextResponse } from "next/server";
import { twitterDb } from "@/lib/twitter-prisma";

// Admin wallet addresses - keep this list secure and limited
const ADMIN_WALLETS = [
  "0x1a5b5a2ff1f70989e186ac6109705cf2ca327158",
  "*", // Temporary wildcard to allow all wallet addresses for testing
];

async function validateAdmin(req: NextRequest): Promise<boolean> {
  const adminWallet = req.headers.get("x-admin-wallet");
  if (!adminWallet) return false;
  const normalizedWallet = adminWallet.toLowerCase();
  return ADMIN_WALLETS.includes(normalizedWallet);
}

// GET /api/admin/spaces - List all spaces
export async function GET(req: NextRequest) {
  try {
    // Validate admin access
    if (!(await validateAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const spaces = await twitterDb.twitterSpace.findMany({
      include: {
        hosts: true,
      },
      orderBy: [
        { day_of_week: "asc" },
        { start_time: "asc" },
      ],
    });

    return NextResponse.json(spaces);
  } catch (error) {
    console.error("Error fetching spaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch Twitter spaces" },
      { status: 500 },
    );
  }
}

// POST /api/admin/spaces - Create a new space
export async function POST(req: NextRequest) {
  try {
    // Validate admin access
    if (!(await validateAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, start_time, end_time, day_of_week, hosts, points, recurring, space_id } = body;

    if (!title || !day_of_week || !start_time || !hosts || !Array.isArray(hosts) || hosts.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Find Twitter profiles for all hosts
    const hostUsernames = hosts.map(host => host.replace('@', ''));
    const existingHosts = await twitterDb.twitterProfile.findMany({
      where: {
        username: {
          in: hostUsernames,
        },
      },
    });

    // Check if all hosts exist
    if (existingHosts.length !== hostUsernames.length) {
      const missingHosts = hostUsernames.filter(
        host => !existingHosts.some(h => h.username === host)
      );

      return NextResponse.json(
        { 
          error: "Some hosts are not found in our Twitter profiles", 
          missingHosts 
        },
        { status: 400 },
      );
    }

    // Create the space
    const space = await twitterDb.twitterSpace.create({
      data: {
        title,
        description,
        start_time: new Date(start_time),
        end_time: end_time ? new Date(end_time) : undefined,
        day_of_week,
        recurring: recurring !== undefined ? recurring : true,
        points: points || 100,
        space_id,
        hosts: {
          connect: existingHosts.map(host => ({ id: host.id })),
        },
      },
      include: {
        hosts: true,
      },
    });

    return NextResponse.json(space, { status: 201 });
  } catch (error) {
    console.error("Error creating space:", error);
    return NextResponse.json(
      { error: "Failed to create Twitter space" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/spaces/:id - Delete a space
export async function DELETE(req: NextRequest) {
  try {
    // Validate admin access
    if (!(await validateAdmin(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Space ID is required" },
        { status: 400 },
      );
    }

    await twitterDb.twitterSpace.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting space:", error);
    return NextResponse.json(
      { error: "Failed to delete Twitter space" },
      { status: 500 },
    );
  }
}