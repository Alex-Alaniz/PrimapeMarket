
import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser, updateUserProfile } from '@/lib/db/utils';
import { getUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const dbUser = await getOrCreateUser(user.walletAddress);
    return NextResponse.json({ user: dbUser });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const dbUser = await getOrCreateUser(user.walletAddress);
    const data = await request.json();
    
    // Only allow updating certain fields
    const allowedFields = ['username', 'profileImage', 'bio'];
    const updateData: Record<string, any> = {};
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }
    
    const updatedUser = await updateUserProfile(dbUser.id, updateData);
    return NextResponse.json({ user: updatedUser[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
