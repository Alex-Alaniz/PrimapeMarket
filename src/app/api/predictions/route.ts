import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/predictions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      wallet_address, 
      prediction_id, 
      market_id, 
      position, 
      amount, 
      transaction_hash 
    } = body;

    // Validate required fields
    if (!wallet_address || !prediction_id || !market_id || position === undefined || !amount || !transaction_hash) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT * FROM users WHERE wallet_address = $1',
      [wallet_address]
    );

    let userId;

    if (userResult.rows.length === 0) {
      // Create new user
      const insertUserResult = await query(
        'INSERT INTO users (wallet_address) VALUES ($1) RETURNING id',
        [wallet_address]
      );
      userId = insertUserResult.rows[0].id;

      // Create empty stats for new user
      await query(
        `INSERT INTO user_stats (user_id, total_predictions, correct_predictions, total_volume, total_earnings) 
         VALUES ($1, 0, 0, 0, 0)`,
        [userId]
      );
    } else {
      userId = userResult.rows[0].id;
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

    // Check if prediction already exists
    const existingPredictionResult = await query(
      'SELECT * FROM predictions WHERE transaction_hash = $1',
      [transaction_hash]
    );

    if (existingPredictionResult.rows.length > 0) {
      return NextResponse.json({ 
        error: 'Prediction with this transaction hash already exists',
        prediction: existingPredictionResult.rows[0]
      }, { status: 409 });
    }

    // Create prediction
    const insertPredictionResult = await query(
      `INSERT INTO predictions (
        user_id, prediction_id, market_id, position, amount, transaction_hash
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, prediction_id, market_id, position, amount, transaction_hash]
    );

    const prediction = insertPredictionResult.rows[0];

    // Update user stats
    await query(
      `UPDATE user_stats 
       SET total_predictions = total_predictions + 1,
           total_volume = total_volume + $1
       WHERE user_id = $2`,
      [amount, userId]
    );

    // Update market volume
    await query(
      `UPDATE markets 
       SET total_volume = total_volume + $1
       WHERE market_id = $2`,
      [amount, market_id]
    );

    return NextResponse.json({ 
      success: true,
      prediction 
    });
  } catch (err: Error | unknown) {
    console.error('Error creating prediction:', err);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// GET /api/predictions?wallet=0x...&market=market1
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');
    const marketId = searchParams.get('market');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query based on parameters
    let whereClause = '';
    const queryParams: (string | number)[] = [limit, offset];

    if (wallet && marketId) {
      whereClause = 'WHERE u.wallet_address = $3 AND p.market_id = $4';
      queryParams.push(wallet, marketId);
    } else if (wallet) {
      whereClause = 'WHERE u.wallet_address = $3';
      queryParams.push(wallet);
    } else if (marketId) {
      whereClause = 'WHERE p.market_id = $3';
      queryParams.push(marketId);
    }

    // Get predictions
    const predictionsResult = await query(
      `SELECT p.*, u.username, u.wallet_address, m.title as market_title
       FROM predictions p
       JOIN users u ON p.user_id = u.id
       JOIN markets m ON p.market_id = m.market_id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      queryParams
    );

    // Get total count for pagination
    const countQueryParams = queryParams.slice(2);
    const countResult = await query(
      `SELECT COUNT(*) as total 
       FROM predictions p
       JOIN users u ON p.user_id = u.id
       ${whereClause}`,
      countQueryParams
    );

    const total = parseInt(countResult.rows[0].total, 10);

    // Return predictions data
    return NextResponse.json({
      predictions: predictionsResult.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (err: Error | unknown) {
    console.error('Error fetching predictions:', err);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}