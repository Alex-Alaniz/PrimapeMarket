
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Market } from '@/lib/db-models';

export async function GET(request: NextRequest, { params }: { params: { marketId: string } }) {
  try {
    const { marketId } = params;
    
    const { rows } = await sql`
      SELECT * FROM markets WHERE market_id = ${marketId}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching market:', error);
    return NextResponse.json({ error: 'Failed to fetch market' }, { status: 500 });
  }
}
