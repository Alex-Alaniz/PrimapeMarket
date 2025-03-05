import { NextRequest, NextResponse } from 'next/server';
import { getUserByWallet, createUser, updateUserDisplayName } from '@/lib/services/user-service';
import { getWalletProfiles, linkProfile } from '@/lib/services/thirdweb-user-service';

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get('wallet');

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }

  try {
    // Get user from our database
    const user = await getUserByWallet(wallet);

    // Get linked profiles from Thirdweb
    const profiles = await getWalletProfiles(wallet);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Combine database profile with Thirdweb linked profiles
    return NextResponse.json({
      ...user,
      linked_profiles: profiles
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { wallet, displayName } = await request.json();

    if (!wallet || !displayName) {
      return NextResponse.json({ error: 'Wallet address and display name are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await getUserByWallet(wallet);
    if (existingUser) {
      return NextResponse.json({ error: 'User with this wallet already exists' }, { status: 409 });
    }

    const newUser = await createUser(wallet, displayName);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { wallet, displayName } = await request.json();

    if (!wallet || !displayName) {
      return NextResponse.json({ error: 'Wallet address and display name are required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await getUserByWallet(wallet);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = await updateUserDisplayName(wallet, displayName);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}