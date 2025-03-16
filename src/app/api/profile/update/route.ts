import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId, displayName } = await request.json();

    // Validate required fields
    if (!userId || !displayName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the user's display name
    await query(
      'UPDATE users SET display_name = $1 WHERE user_id = $2',
      [displayName, userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, message: 'Server error updating profile' },
      { status: 500 }
    );
  }
} 