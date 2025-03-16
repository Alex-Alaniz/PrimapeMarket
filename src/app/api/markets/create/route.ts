import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/markets/create
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { market_id, title, description, resolution_time } = body;

    // Validate required fields
    if (!market_id || !title) {
      return NextResponse.json({ 
        error: 'Market ID and title are required' 
      }, { status: 400 });
    }

    // Check if market already exists
    const existingMarketResult = await query(
      'SELECT * FROM markets WHERE market_id = $1',
      [market_id]
    );

    if (existingMarketResult.rows.length > 0) {
      return NextResponse.json({ 
        error: 'Market with this ID already exists',
        market: existingMarketResult.rows[0]
      }, { status: 409 });
    }

    // Create new market
    const insertMarketResult = await query(
      `INSERT INTO markets (
        market_id, title, description, resolution_time
      ) VALUES ($1, $2, $3, $4) RETURNING *`,
      [market_id, title, description || null, resolution_time || null]
    );

    const market = insertMarketResult.rows[0];

    return NextResponse.json({ 
      success: true,
      market 
    });
  } catch (error) {
    console.error('Error creating market:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 