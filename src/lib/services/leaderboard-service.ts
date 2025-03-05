
import { query } from '../db';

export interface LeaderboardEntry {
  user_id: number;
  display_name: string;
  primary_wallet: string;
  total_invested: number;
  total_claimed: number;
  total_participated: number;
  total_won: number;
  total_lost: number;
  pnl: number;
}

export type LeaderboardSortOption = 'pnl' | 'total_won' | 'total_participated';

export async function getLeaderboard(
  sortBy: LeaderboardSortOption = 'pnl',
  limit: number = 50,
  offset: number = 0
): Promise<LeaderboardEntry[]> {
  let orderClause = '';
  
  switch (sortBy) {
    case 'pnl':
      orderClause = 'ORDER BY lb.pnl DESC';
      break;
    case 'total_won':
      orderClause = 'ORDER BY lb.total_won DESC';
      break;
    case 'total_participated':
      orderClause = 'ORDER BY lb.total_participated DESC';
      break;
    default:
      orderClause = 'ORDER BY lb.pnl DESC';
  }
  
  const result = await query(
    `SELECT lb.*, u.display_name, u.primary_wallet
     FROM users_leaderboard lb
     JOIN users u ON lb.user_id = u.user_id
     ${orderClause}
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  
  return result.rows;
}

export async function getUserRank(userId: number, sortBy: LeaderboardSortOption = 'pnl'): Promise<number> {
  let rankColumn = '';
  
  switch (sortBy) {
    case 'pnl':
      rankColumn = 'pnl';
      break;
    case 'total_won':
      rankColumn = 'total_won';
      break;
    case 'total_participated':
      rankColumn = 'total_participated';
      break;
    default:
      rankColumn = 'pnl';
  }
  
  const result = await query(
    `SELECT ranking
     FROM (
       SELECT user_id, ROW_NUMBER() OVER (ORDER BY ${rankColumn} DESC) as ranking
       FROM users_leaderboard
     ) ranks
     WHERE user_id = $1`,
    [userId]
  );
  
  return result.rows.length > 0 ? result.rows[0].ranking : 0;
}

export async function getTopPerformers(limit: number = 10): Promise<LeaderboardEntry[]> {
  const result = await query(
    `SELECT lb.*, u.display_name, u.primary_wallet
     FROM users_leaderboard lb
     JOIN users u ON lb.user_id = u.user_id
     ORDER BY lb.pnl DESC
     LIMIT $1`,
    [limit]
  );
  
  return result.rows;
}
