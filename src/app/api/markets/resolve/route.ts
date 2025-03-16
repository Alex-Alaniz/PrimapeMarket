import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/markets/resolve
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { market_id, outcome } = body;

    // Validate required fields
    if (!market_id || outcome === undefined) {
      return NextResponse.json({ 
        error: 'Market ID and outcome are required' 
      }, { status: 400 });
    }

    // Check if market exists
    const marketResult = await query(
      'SELECT * FROM markets WHERE market_id = $1',
      [market_id]
    );

    if (marketResult.rows.length === 0) {
      return NextResponse.json({ 
        error: 'Market not found' 
      }, { status: 404 });
    }

    const market = marketResult.rows[0];

    // Check if market is already resolved
    if (market.outcome !== null) {
      return NextResponse.json({ 
        error: 'Market is already resolved',
        market
      }, { status: 409 });
    }

    // Begin transaction
    try {
      // Update market outcome
      const updateMarketResult = await query(
        `UPDATE markets 
         SET outcome = $1, 
             updated_at = CURRENT_TIMESTAMP
         WHERE market_id = $2
         RETURNING *`,
        [outcome, market_id]
      );

      const updatedMarket = updateMarketResult.rows[0];

      // Get all predictions for this market
      const predictionsResult = await query(
        'SELECT * FROM predictions WHERE market_id = $1',
        [market_id]
      );

      const predictions = predictionsResult.rows;

      // Update predictions and user stats
      for (const prediction of predictions) {
        // Set prediction outcome and calculate payout
        const predictionOutcome = prediction.position === outcome;
        const payout = predictionOutcome ? prediction.amount * 2 : 0; // Simple 2x payout for winners

        // Update prediction
        await query(
          `UPDATE predictions 
           SET outcome = $1, 
               payout = $2,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [predictionOutcome, payout, prediction.id]
        );

        // Update user stats
        await query(
          `UPDATE user_stats 
           SET correct_predictions = correct_predictions + $1,
               total_earnings = total_earnings + $2
           WHERE user_id = $3`,
          [predictionOutcome ? 1 : 0, payout, prediction.user_id]
        );
      }

      // Update user rankings
      await query(`
        WITH ranked_users AS (
          SELECT 
            user_id,
            RANK() OVER (ORDER BY total_earnings DESC) as new_rank
          FROM user_stats
        )
        UPDATE user_stats us
        SET rank = ru.new_rank
        FROM ranked_users ru
        WHERE us.user_id = ru.user_id
      `);

      // Commit transaction
      await query('COMMIT');

      return NextResponse.json({ 
        success: true,
        market: updatedMarket,
        resolved_predictions: predictions.length
      });
    } catch (error: unknown) {
      // Rollback transaction on error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error: unknown) {
    console.error('Error resolving market:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}