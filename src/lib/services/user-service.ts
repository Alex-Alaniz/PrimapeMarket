
import { query } from '@/lib/db';

export type User = {
  user_id: number;
  primary_wallet: string;
  display_name: string;
  created_at: string;
};

/**
 * Get a user by their wallet address
 */
export async function getUserByWallet(wallet: string): Promise<User | null> {
  const result = await query(
    'SELECT * FROM users WHERE primary_wallet = $1',
    [wallet.toLowerCase()]
  );
  
  return result.rows[0] || null;
}

/**
 * Create a new user
 */
export async function createUser(wallet: string, displayName: string): Promise<User> {
  // Insert user
  const userResult = await query(
    'INSERT INTO users (primary_wallet, display_name) VALUES ($1, $2) RETURNING *',
    [wallet.toLowerCase(), displayName]
  );
  
  const user = userResult.rows[0];
  
  // Initialize user stats
  await query(
    'INSERT INTO user_stats (user_id) VALUES ($1)',
    [user.user_id]
  );
  
  return user;
}

/**
 * Update a user's display name
 */
export async function updateUserDisplayName(wallet: string, displayName: string): Promise<User> {
  const result = await query(
    'UPDATE users SET display_name = $1 WHERE primary_wallet = $2 RETURNING *',
    [displayName, wallet.toLowerCase()]
  );
  
  return result.rows[0];
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: number) {
  const result = await query(
    'SELECT * FROM user_stats WHERE user_id = $1',
    [userId]
  );
  
  return result.rows[0] || null;
}


import { query, executeTransaction } from '../db';

export interface User {
  user_id: number;
  primary_wallet: string;
  display_name: string;
  created_at: Date;
}

export interface UserEmail {
  user_id: number;
  email: string;
  verified: boolean;
}

export interface UserWallet {
  user_id: number;
  wallet_address: string;
}

export async function getUserByWallet(walletAddress: string): Promise<User | null> {
  const result = await query(
    'SELECT * FROM users WHERE primary_wallet = $1',
    [walletAddress]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function createUser(primaryWallet: string, displayName: string): Promise<User> {
  const result = await query(
    'INSERT INTO users (primary_wallet, display_name) VALUES ($1, $2) RETURNING *',
    [primaryWallet, displayName]
  );
  
  // Initialize leaderboard entry
  await query(
    'INSERT INTO users_leaderboard (user_id) VALUES ($1)',
    [result.rows[0].user_id]
  );
  
  return result.rows[0];
}

export async function updateUserDisplayName(userId: number, displayName: string): Promise<User> {
  const result = await query(
    'UPDATE users SET display_name = $1 WHERE user_id = $2 RETURNING *',
    [displayName, userId]
  );
  
  return result.rows[0];
}

export async function addUserEmail(userId: number, email: string): Promise<UserEmail> {
  const result = await query(
    'INSERT INTO user_emails (user_id, email) VALUES ($1, $2) RETURNING *',
    [userId, email]
  );
  
  return result.rows[0];
}

export async function addUserWallet(userId: number, walletAddress: string): Promise<UserWallet> {
  const result = await query(
    'INSERT INTO user_wallets (user_id, wallet_address) VALUES ($1, $2) RETURNING *',
    [userId, walletAddress]
  );
  
  return result.rows[0];
}

export async function getUserWallets(userId: number): Promise<string[]> {
  const result = await query(
    'SELECT wallet_address FROM user_wallets WHERE user_id = $1',
    [userId]
  );
  
  return result.rows.map(row => row.wallet_address);
}

export async function getUserEmails(userId: number): Promise<UserEmail[]> {
  const result = await query(
    'SELECT * FROM user_emails WHERE user_id = $1',
    [userId]
  );
  
  return result.rows;
}
