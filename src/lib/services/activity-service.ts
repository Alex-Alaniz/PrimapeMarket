
import { query, executeTransaction } from '../db';

export interface WalletActivity {
  id: number;
  wallet_address: string;
  market_id: number;
  option_index: number;
  shares: number;
  amount_spent: number;
  amount_claimed: number;
  event_type: 'buy' | 'claim';
  timestamp: Date;
}

export async function recordSharePurchase(
  walletAddress: string,
  marketId: number,
  optionIndex: number,
  shares: number,
  amountSpent: number
): Promise<WalletActivity> {
  return await executeTransaction(async (client) => {
    // Record the activity
    const activityResult = await client.query(
      `INSERT INTO wallet_activity 
       (wallet_address, market_id, option_index, shares, amount_spent, event_type)
       VALUES ($1, $2, $3, $4, $5, 'buy')
       RETURNING *`,
      [walletAddress, marketId, optionIndex, shares, amountSpent]
    );
    
    // Update leaderboard stats
    await client.query(
      `INSERT INTO users_leaderboard (user_id, total_invested, total_participated)
       SELECT u.user_id, $1, 1
       FROM users u
       WHERE u.primary_wallet = $2
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         total_invested = users_leaderboard.total_invested + $1,
         total_participated = users_leaderboard.total_participated + 1`,
      [amountSpent, walletAddress]
    );
    
    return activityResult.rows[0];
  });
}

export async function recordWinningClaim(
  walletAddress: string,
  marketId: number,
  optionIndex: number,
  amountClaimed: number
): Promise<WalletActivity> {
  return await executeTransaction(async (client) => {
    // Get the amount spent by this user on this option
    const spentResult = await client.query(
      `SELECT SUM(amount_spent) as total_spent
       FROM wallet_activity
       WHERE wallet_address = $1 AND market_id = $2 AND option_index = $3 AND event_type = 'buy'`,
      [walletAddress, marketId, optionIndex]
    );
    
    const totalSpent = spentResult.rows[0]?.total_spent || 0;
    
    // Record the claim activity
    const activityResult = await client.query(
      `INSERT INTO wallet_activity 
       (wallet_address, market_id, option_index, shares, amount_spent, amount_claimed, event_type)
       VALUES ($1, $2, $3, 0, 0, $4, 'claim')
       RETURNING *`,
      [walletAddress, marketId, optionIndex, amountClaimed]
    );
    
    // Update leaderboard stats
    await client.query(
      `UPDATE users_leaderboard
       SET total_claimed = total_claimed + $1,
           total_won = total_won + 1
       FROM users
       WHERE users.user_id = users_leaderboard.user_id AND users.primary_wallet = $2`,
      [amountClaimed, walletAddress]
    );
    
    return activityResult.rows[0];
  });
}

export async function getUserActivity(
  walletAddress: string, 
  limit: number = 50, 
  offset: number = 0
): Promise<WalletActivity[]> {
  const result = await query(
    `SELECT wa.* FROM wallet_activity wa
     WHERE wa.wallet_address = $1
     ORDER BY wa.timestamp DESC
     LIMIT $2 OFFSET $3`,
    [walletAddress, limit, offset]
  );
  
  return result.rows;
}

export async function getMarketActivity(
  marketId: number,
  limit: number = 50,
  offset: number = 0
): Promise<WalletActivity[]> {
  const result = await query(
    `SELECT wa.* FROM wallet_activity wa
     WHERE wa.market_id = $1
     ORDER BY wa.timestamp DESC
     LIMIT $2 OFFSET $3`,
    [marketId, limit, offset]
  );
  
  return result.rows;
}
