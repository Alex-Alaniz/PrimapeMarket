
import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard, LeaderboardSortOption } from '@/lib/services/leaderboard-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get('sortBy') as LeaderboardSortOption || 'pnl';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const leaderboard = await getLeaderboard(sortBy, limit, offset);
    
    return NextResponse.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
