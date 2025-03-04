
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getOrCreateUser, getUserActivity } from '@/lib/db/utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const dbUser = await getOrCreateUser(user.walletAddress);
    const activity = await getUserActivity(dbUser.id);
    
    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}
