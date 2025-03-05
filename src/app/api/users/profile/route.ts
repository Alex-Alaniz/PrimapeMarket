
import { NextRequest, NextResponse } from 'next/server';
import { getUserByWallet, createUser, updateUserDisplayName } from '@/lib/services/user-service';

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get('wallet');
  
  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
  }
  
  try {
    const user = await getUserByWallet(wallet);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
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

export async function PUT(request: NextRequest) {
  const userId = parseInt(request.nextUrl.searchParams.get('userId') || '0');
  
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }
  
  try {
    const { displayName } = await request.json();
    
    if (!displayName) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 });
    }
    
    const updatedUser = await updateUserDisplayName(userId, displayName);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// GET /api/users/profile?wallet=0x...
export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
  }

  try {
    const result = await sql`
      SELECT * FROM users WHERE primary_wallet = ${wallet.toLowerCase()} LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}

// POST /api/users/profile
export async function POST(request: NextRequest) {
  try {
    const { wallet, displayName } = await request.json();

    if (!wallet || !displayName) {
      return NextResponse.json({ error: "Wallet address and display name are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE primary_wallet = ${wallet.toLowerCase()} LIMIT 1
    `;

    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "User with this wallet already exists" }, { status: 409 });
    }

    // Create new user
    const result = await sql`
      INSERT INTO users (primary_wallet, display_name)
      VALUES (${wallet.toLowerCase()}, ${displayName})
      RETURNING *
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 });
  }
}

// PUT /api/users/profile
export async function PUT(request: NextRequest) {
  try {
    const { wallet, displayName } = await request.json();

    if (!wallet || !displayName) {
      return NextResponse.json({ error: "Wallet address and display name are required" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT * FROM users WHERE primary_wallet = ${wallet.toLowerCase()} LIMIT 1
    `;

    if (existingUser.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user
    const result = await sql`
      UPDATE users
      SET display_name = ${displayName}
      WHERE primary_wallet = ${wallet.toLowerCase()}
      RETURNING *
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 });
  }
}
