
import { NextRequest, NextResponse } from 'next/server';
import { twitterDb } from '@/lib/twitter-prisma';
import { getTwitterProfileData, cacheTwitterProfile } from '@/lib/twitter-api';

// Simple admin validation - in production use a more robust system
const ADMIN_WALLETS = [
  // Add your admin wallet addresses here
  "0x1234567890123456789012345678901234567890",
  // Add more as needed
];

async function validateAdmin(req: NextRequest): Promise<boolean> {
  const adminWallet = req.headers.get('x-admin-wallet');
  return ADMIN_WALLETS.includes(adminWallet || '');
}

// GET /api/admin/creators/whitelist - List all whitelisted creators
export async function GET(req: NextRequest) {
  try {
    // Validate admin access
    if (!await validateAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const whitelistedCreators = await twitterDb.twitterWhitelist.findMany({
      orderBy: { added_at: 'desc' },
    });

    return NextResponse.json(whitelistedCreators);
  } catch (error) {
    console.error('Error fetching whitelisted creators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch whitelisted creators' },
      { status: 500 }
    );
  }
}

// POST /api/admin/creators/whitelist - Add new creators to whitelist
export async function POST(req: NextRequest) {
  try {
    // Validate admin access
    if (!await validateAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { username, category, points, adminWallet } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Twitter username is required' },
        { status: 400 }
      );
    }

    // Clean username (remove @ if present)
    const cleanUsername = username.replace('@', '');

    // Check if already in whitelist
    const existing = await twitterDb.twitterWhitelist.findUnique({
      where: { username: cleanUsername }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Creator already in whitelist', creator: existing },
        { status: 409 }
      );
    }

    // Add to whitelist
    const whitelistedCreator = await twitterDb.twitterWhitelist.create({
      data: {
        username: cleanUsername,
        category: category || 'Spaces',
        points: points || 250,
        added_by: adminWallet || null,
      }
    });

    // Try to pre-fetch their Twitter data (but don't fail if this fails)
    try {
      const twitterData = await getTwitterProfileData(cleanUsername);
      if (twitterData) {
        await cacheTwitterProfile(twitterData);
      }
    } catch (prefetchError) {
      console.warn(`Pre-fetching Twitter data failed for ${cleanUsername}:`, prefetchError);
      // Continue anyway - this is just a convenience feature
    }

    return NextResponse.json(whitelistedCreator, { status: 201 });
  } catch (error) {
    console.error('Error adding creator to whitelist:', error);
    return NextResponse.json(
      { error: 'Failed to add creator to whitelist' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/creators/whitelist?username=handle - Remove from whitelist
export async function DELETE(req: NextRequest) {
  try {
    // Validate admin access
    if (!await validateAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 }
      );
    }

    // Clean username (remove @ if present)
    const cleanUsername = username.replace('@', '');

    // Check if in whitelist
    const existing = await twitterDb.twitterWhitelist.findUnique({
      where: { username: cleanUsername }
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Creator not found in whitelist' },
        { status: 404 }
      );
    }

    // Remove from whitelist
    await twitterDb.twitterWhitelist.delete({
      where: { username: cleanUsername }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing creator from whitelist:', error);
    return NextResponse.json(
      { error: 'Failed to remove creator from whitelist' },
      { status: 500 }
    );
  }
}
