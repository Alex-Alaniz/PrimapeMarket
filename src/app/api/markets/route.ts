import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/markets?limit=10&offset=0&status=active
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const status = searchParams.get('status') || 'all'; // all, active, resolved

    // Build query based on status
    let whereClause = '';
    if (status === 'active') {
      whereClause = 'WHERE outcome IS NULL AND resolution_time > CURRENT_TIMESTAMP';
    } else if (status === 'resolved') {
      whereClause = 'WHERE outcome IS NOT NULL';
    }

    // Get markets
    const marketsResult = await query(
      `SELECT * FROM markets
       ${whereClause}
       ORDER BY resolution_time DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) as total FROM markets ${whereClause}`
    );

    const total = parseInt(countResult.rows[0].total, 10);

    // Return markets data
    return NextResponse.json({
      markets: marketsResult.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching markets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/markets/[market_id]
export async function getMarketById(marketId: string) {
  try {
    // Get market
    const marketResult = await query(
      'SELECT * FROM markets WHERE market_id = $1',
      [marketId]
    );

    if (marketResult.rows.length === 0) {
      return { error: 'Market not found', status: 404 };
    }

    const market = marketResult.rows[0];

    // Get market predictions
    const predictionsResult = await query(
      `SELECT p.*, u.username, u.wallet_address
       FROM predictions p
       JOIN users u ON p.user_id = u.id
       WHERE p.market_id = $1
       ORDER BY p.created_at DESC
       LIMIT 20`,
      [marketId]
    );

    // Return market data with predictions
    return {
      market,
      predictions: predictionsResult.rows
    };
  } catch (error) {
    console.error('Error fetching market:', error);
    return { error: 'Internal server error', status: 500 };
  }
} 