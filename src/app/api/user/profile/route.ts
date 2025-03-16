import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { User, UserStats, toUserProfile } from '@/lib/db-models';

// GET /api/user/profile?wallet=0x...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Get user by wallet address
    const userResult = await query(
      'SELECT * FROM users WHERE wallet_address = $1',
      [wallet]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0] as User;

    // Get user stats
    const statsResult = await query(
      'SELECT * FROM user_stats WHERE user_id = $1',
      [user.id]
    );

    const stats = statsResult.rows.length > 0 ? statsResult.rows[0] as UserStats : null;

    // Get user's recent predictions
    const predictionsResult = await query(
      `SELECT p.*, m.title as market_title 
       FROM predictions p
       JOIN markets m ON p.market_id = m.market_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT 5`,
      [user.id]
    );

    // Return user profile with stats and recent predictions
    return NextResponse.json({
      profile: toUserProfile(user, stats),
      recent_predictions: predictionsResult.rows
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/user/profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet_address, username, avatar_url, bio } = body;

    if (!wallet_address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Check if user exists
    const existingUserResult = await query(
      'SELECT * FROM users WHERE wallet_address = $1',
      [wallet_address]
    );

    let user: User;

    if (existingUserResult.rows.length === 0) {
      // Create new user
      const insertResult = await query(
        `INSERT INTO users (wallet_address, username, avatar_url, bio) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [wallet_address, username || null, avatar_url || null, bio || null]
      );
      
      user = insertResult.rows[0] as User;
      
      // Create empty stats for new user
      await query(
        `INSERT INTO user_stats (user_id, total_predictions, correct_predictions, total_volume, total_earnings) 
         VALUES ($1, 0, 0, 0, 0)`,
        [user.id]
      );
    } else {
      // Update existing user
      user = existingUserResult.rows[0] as User;
      
      const updateResult = await query(
        `UPDATE users 
         SET username = COALESCE($2, username), 
             avatar_url = COALESCE($3, avatar_url), 
             bio = COALESCE($4, bio),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [user.id, username || null, avatar_url || null, bio || null]
      );
      
      user = updateResult.rows[0] as User;
    }

    // Get user stats
    const statsResult = await query(
      'SELECT * FROM user_stats WHERE user_id = $1',
      [user.id]
    );

    const stats = statsResult.rows.length > 0 ? statsResult.rows[0] as UserStats : null;

    // Return updated user profile
    return NextResponse.json({
      profile: toUserProfile(user, stats)
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 