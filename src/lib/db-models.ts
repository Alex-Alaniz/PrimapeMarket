// User model
export interface User {
  id: number;
  wallet_address: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: Date;
  updated_at: Date;
}

// Market model
export interface Market {
  id: number;
  market_id: string;
  title: string;
  description: string | null;
  resolution_time: Date | null;
  outcome: boolean | null;
  total_volume: number;
  created_at: Date;
  updated_at: Date;
}

// UserStats model
export interface UserStats {
  id: number;
  user_id: number;
  total_predictions: number;
  correct_predictions: number;
  total_volume: number;
  total_earnings: number;
  rank: number | null;
  created_at: Date;
  updated_at: Date;
}

// Prediction model
export interface Prediction {
  id: number;
  user_id: number;
  prediction_id: string;
  market_id: string;
  position: boolean;
  amount: number;
  outcome: boolean | null;
  payout: number | null;
  transaction_hash: string;
  created_at: Date;
  updated_at: Date;
  market_title?: string;
  username?: string | null;
  wallet_address?: string;
}

// UserProfile model (combines User and UserStats)
export interface UserProfile {
  id: number;
  wallet_address: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  total_predictions: number;
  correct_predictions: number;
  total_volume: number;
  total_earnings: number;
  rank: number | null;
  created_at: Date;
  updated_at: Date;
}

// Helper function to convert database row to UserProfile
export function toUserProfile(user: User, stats: UserStats | null): UserProfile {
  return {
    id: user.id,
    wallet_address: user.wallet_address,
    username: user.username,
    avatar_url: user.avatar_url,
    bio: user.bio,
    total_predictions: stats?.total_predictions || 0,
    correct_predictions: stats?.correct_predictions || 0,
    total_volume: stats?.total_volume || 0,
    total_earnings: stats?.total_earnings || 0,
    rank: stats?.rank || null,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
} 