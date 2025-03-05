
import { NextRequest, NextResponse } from 'next/server';
import { linkProfile, checkLinkStatus, getLinkHistoryForWallet } from '@/lib/services/thirdweb-user-service';

export async function POST(request: NextRequest) {
  try {
    const { wallet, provider, data } = await request.json();
    
    if (!wallet || !provider) {
      return NextResponse.json({ error: 'Wallet address and provider are required' }, { status: 400 });
    }
    
    const linkParams = {
      type: provider as "email" | "phone" | "google" | "apple" | "facebook" | "github" | "discord" | "twitch",
      data
    };
    
    const linkRequest = await linkProfile(wallet, linkParams);
    return NextResponse.json(linkRequest);
  } catch (error) {
    console.error('Error linking profile:', error);
    return NextResponse.json({ error: 'Failed to link profile' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get('wallet');
  const linkRequestId = request.nextUrl.searchParams.get('linkRequestId');
  
  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }
  
  try {
    if (linkRequestId) {
      // Check status of a specific link request
      const status = await checkLinkStatus(wallet, linkRequestId);
      return NextResponse.json(status);
    } else {
      // Get all link history
      const history = await getLinkHistoryForWallet(wallet);
      return NextResponse.json(history);
    }
  } catch (error) {
    console.error('Error with link request:', error);
    return NextResponse.json({ error: 'Failed to process link request' }, { status: 500 });
  }
}
