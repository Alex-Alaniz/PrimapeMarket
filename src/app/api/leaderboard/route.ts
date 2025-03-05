
import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/services/leaderboard-service';

export async function GET() {
  try {
    const leaderboard = await getLeaderboard();
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface LeaderboardEntry {
  user_id: number;
  display_name: string;
  primary_wallet: string;
  markets_participated: number;
  winnings: number;
  rank: number;
}

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would query your database for user stats
    // This is a simplified example
    const users = await db.query(`
      SELECT 
        u.user_id,
        u.display_name,
        u.primary_wallet,
        COUNT(DISTINCT p.market_id) as markets_participated,
        SUM(p.winnings) as total_winnings
      FROM users u
      LEFT JOIN participations p ON u.user_id = p.user_id
      GROUP BY u.user_id
      ORDER BY total_winnings DESC, markets_participated DESC
    `);
    
    // Add rank to each user
    const leaderboard: LeaderboardEntry[] = users.rows.map((user: any, index: number) => ({
      ...user,
      rank: index + 1
    }));
    
    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 });
  }
}
