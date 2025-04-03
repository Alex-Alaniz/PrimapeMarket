import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/twitter-prisma";

// Admin wallet addresses - keep this list secure and limited
const ADMIN_WALLETS = [
  "0xD1D1B36c40D522eb84D9a8f76A99f713A9BfA9C4",
  "0xE9e6a56Fe9b8C47dF185B25e3B07f7d08e1fBb77",
  "0xc88B5AaC42e0FD868cBCE2D0C5A8aA30a91FB9EA",
  "0xC17A09F8599B53d55Fa6426f38B6F6F7C4d95A10"
];

// Day of week validation
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export async function GET(req: NextRequest) {
  try {
    // Get the wallet address from URL params
    const walletAddress = req.nextUrl.searchParams.get('walletAddress');

    // Validate admin wallet
    if (!walletAddress || !ADMIN_WALLETS.includes(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Get all spaces with host data if available
    const spaces = await db.twitterSpace.findMany({
      orderBy: [
        { day_of_week: 'asc' },
        { start_time: 'asc' }
      ],
      include: {
        hosts: true
      }
    });

    return NextResponse.json({
      success: true,
      spaces,
      count: spaces.length
    });
  } catch (error) {
    console.error('Error in spaces GET API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { walletAddress, space } = data;

    // Validate admin wallet
    if (!walletAddress || !ADMIN_WALLETS.includes(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Validate space data
    if (!space || !space.host_username || !space.title || !space.day_of_week) {
      return NextResponse.json({ error: 'Missing required space data' }, { status: 400 });
    }

    // Validate day of week
    if (!DAYS_OF_WEEK.includes(space.day_of_week)) {
      return NextResponse.json({ error: 'Invalid day of week' }, { status: 400 });
    }

    // Clean the username (remove @ if present)
    const cleanUsername = space.host_username.replace('@', '');

    // Find or create the host profile
    let hostProfile = await db.twitterProfile.findUnique({
      where: {
        username: cleanUsername
      }
    });

    if (!hostProfile) {
      // If host doesn't exist in our database, create a placeholder
      hostProfile = await db.twitterProfile.create({
        data: {
          id: `placeholder_${cleanUsername}`,
          username: cleanUsername,
          name: cleanUsername,
          description: '',
          profile_image_url: '',
          fetched_at: new Date()
        }
      });
    }

    // Get the host profile for the relation
    const host = await db.twitterProfile.findUnique({
      where: {
        username: cleanUsername
      }
    });

    // Create the space
    const createdSpace = await db.twitterSpace.create({
      data: {
        id: space.id || `space_${Date.now()}`,
        title: space.title,
        description: space.description || '',
        day_of_week: space.day_of_week,
        start_time: space.scheduled_date ? new Date(space.scheduled_date) : new Date(),
        end_time: null,
        recurring: space.is_recurring || false,
        space_id: space.space_url ? space.space_url.split('/').pop() : null,
        points: 100,
        created_at: new Date(),
        updated_at: new Date(),
        hosts: {
          connect: host ? [{ id: host.id }] : []
        }
      }
    });

    return NextResponse.json({
      success: true,
      space: createdSpace
    });
  } catch (error) {
    console.error('Error in spaces POST API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { walletAddress, space } = data;

    // Validate admin wallet
    if (!walletAddress || !ADMIN_WALLETS.includes(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Validate space data
    if (!space || !space.id) {
      return NextResponse.json({ error: 'Missing space ID' }, { status: 400 });
    }

    // Validate day of week if provided
    if (space.day_of_week && !DAYS_OF_WEEK.includes(space.day_of_week)) {
      return NextResponse.json({ error: 'Invalid day of week' }, { status: 400 });
    }

    // Find the space to update
    const existingSpace = await db.twitterSpace.findUnique({
      where: {
        id: space.id
      }
    });

    if (!existingSpace) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Clean the username if provided (remove @ if present)
    let cleanUsername = undefined;
    if (space.host_username) {
      cleanUsername = space.host_username.replace('@', '');

      // Check if host exists, create placeholder if not
      const hostProfile = await db.twitterProfile.findUnique({
        where: {
          username: cleanUsername
        }
      });

      if (!hostProfile) {
        await db.twitterProfile.create({
          data: {
            id: `placeholder_${cleanUsername}`,
            username: cleanUsername,
            name: cleanUsername,
            description: '',
            profile_image_url: '',
            fetched_at: new Date()
          }
        });
      }
    }

    // Update the space
    const updatedSpace = await db.twitterSpace.update({
      where: {
        id: space.id
      },
      data: {
        host_username: cleanUsername,
        title: space.title,
        description: space.description,
        day_of_week: space.day_of_week,
        start_hour: space.start_hour !== undefined ? parseInt(space.start_hour) : undefined,
        start_minute: space.start_minute !== undefined ? parseInt(space.start_minute) : undefined,
        duration_minutes: space.duration_minutes !== undefined ? parseInt(space.duration_minutes) : undefined,
        scheduled_date: space.scheduled_date ? new Date(space.scheduled_date) : undefined,
        is_recurring: space.is_recurring,
        recurring_rule: space.recurring_rule,
        space_url: space.space_url,
        status: space.status,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      space: updatedSpace
    });
  } catch (error) {
    console.error('Error in spaces PUT API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    const { walletAddress, spaceId } = data;

    // Validate admin wallet
    if (!walletAddress || !ADMIN_WALLETS.includes(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Validate space ID
    if (!spaceId) {
      return NextResponse.json({ error: 'Missing space ID' }, { status: 400 });
    }

    // Find the space to delete
    const existingSpace = await db.twitterSpace.findUnique({
      where: {
        id: spaceId
      }
    });

    if (!existingSpace) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Delete the space
    await db.twitterSpace.delete({
      where: {
        id: spaceId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Space deleted successfully'
    });
  } catch (error) {
    console.error('Error in spaces DELETE API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}