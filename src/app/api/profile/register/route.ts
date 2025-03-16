import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { walletAddress, displayName, email } = await request.json();

    // Validate required fields
    if (!walletAddress || !displayName) {
      return NextResponse.json(
        { success: false, message: 'Wallet address and display name are required' },
        { status: 400 }
      );
    }

    // Check if wallet already exists
    const existingUserResult = await query(
      'SELECT user_id FROM users WHERE primary_wallet = $1',
      [walletAddress]
    );

    if (existingUserResult.rows && existingUserResult.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'User with this wallet already exists' },
        { status: 409 }
      );
    }

    // Begin transaction
    await query('BEGIN');

    try {
      // Insert new user
      const userResult = await query(
        'INSERT INTO users (primary_wallet, display_name) VALUES ($1, $2) RETURNING user_id',
        [walletAddress, displayName]
      );

      const userId = userResult.rows[0].user_id;

      // Add email if provided
      if (email) {
        await query(
          'INSERT INTO user_emails (user_id, email) VALUES ($1, $2)',
          [userId, email]
        );
      }

      // Create leaderboard entry
      await query(
        'INSERT INTO users_leaderboard (user_id) VALUES ($1)',
        [userId]
      );

      // Commit transaction
      await query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'User registered successfully',
        userId
      });
    } catch (error) {
      // Rollback transaction on error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { success: false, message: 'Server error registering user' },
      { status: 500 }
    );
  }
} 