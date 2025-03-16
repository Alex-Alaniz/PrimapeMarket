import { NextRequest, NextResponse } from 'next/server';
import { getMarketById } from '../route';

// GET /api/markets/[marketId]
export async function GET(
  request: NextRequest,
  { params }: { params: { marketId: string } }
) {
  try {
    const marketId = params.marketId;
    
    if (!marketId) {
      return NextResponse.json({ error: 'Market ID is required' }, { status: 400 });
    }

    const result = await getMarketById(marketId);
    
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching market:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 