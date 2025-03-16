import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/leaderboard?sort=earnings&limit=10&offset=0
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'earnings'; // earnings, predictions, correct
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Validate sort parameter
    const validSortFields = ['earnings', 'predictions', 'correct'];
    if (!validSortFields.includes(sort)) {
      return NextResponse.json({ error: 'Invalid sort parameter' }, { status: 400 });
    }

    // Map sort parameter to database column
    const sortColumn = sort === 'earnings' ? 'total_earnings' : 
                       sort === 'predictions' ? 'total_predictions' : 
                       'correct_predictions';

    // Get leaderboard data
    const leaderboardResult = await query(
      `SELECT u.id, u.wallet_address, u.username, u.avatar_url,
              s.total_predictions, s.correct_predictions, s.total_volume, s.total_earnings, s.rank
       FROM users u
       JOIN user_stats s ON u.id = s.user_id
       ORDER BY s.${sortColumn} DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get total count for pagination
    const countResult = await query(
      'SELECT COUNT(*) as total FROM user_stats'
    );

    const total = parseInt(countResult.rows[0].total, 10);

    // Return leaderboard data
    return NextResponse.json({
      leaderboard: leaderboardResult.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 