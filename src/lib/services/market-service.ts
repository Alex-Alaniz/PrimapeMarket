
import { query } from '../db';

export interface Market {
  market_id: number;
  question: string;
  end_time: Date;
  resolved: boolean;
  winning_option_index: number | null;
  total_pool: number;
}

export async function getMarket(marketId: number): Promise<Market | null> {
  const result = await query(
    'SELECT * FROM markets WHERE market_id = $1',
    [marketId]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function createOrUpdateMarket(
  marketId: number,
  question: string,
  endTime: Date,
  resolved: boolean = false,
  winningOptionIndex: number | null = null,
  totalPool: number = 0
): Promise<Market> {
  // First check if market exists
  const existingMarket = await getMarket(marketId);
  
  if (existingMarket) {
    // Update existing market
    const result = await query(
      `UPDATE markets 
       SET question = $1, end_time = $2, resolved = $3, 
           winning_option_index = $4, total_pool = $5
       WHERE market_id = $6
       RETURNING *`,
      [question, endTime, resolved, winningOptionIndex, totalPool, marketId]
    );
    
    return result.rows[0];
  } else {
    // Create new market
    const result = await query(
      `INSERT INTO markets 
       (market_id, question, end_time, resolved, winning_option_index, total_pool)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [marketId, question, endTime, resolved, winningOptionIndex, totalPool]
    );
    
    return result.rows[0];
  }
}

export async function getActiveMarkets(): Promise<Market[]> {
  const result = await query(
    'SELECT * FROM markets WHERE resolved = false AND end_time > NOW() ORDER BY end_time ASC'
  );
  
  return result.rows;
}

export async function getAllMarkets(limit: number = 100, offset: number = 0): Promise<Market[]> {
  const result = await query(
    'SELECT * FROM markets ORDER BY end_time DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  
  return result.rows;
}
