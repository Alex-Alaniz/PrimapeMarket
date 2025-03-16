
-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Markets Table
CREATE TABLE IF NOT EXISTS markets (
  id SERIAL PRIMARY KEY,
  market_id VARCHAR(100) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  resolution_time TIMESTAMP WITH TIME ZONE,
  outcome BOOLEAN,
  total_volume NUMERIC(20, 8) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Stats Table
CREATE TABLE IF NOT EXISTS user_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  total_volume NUMERIC(20, 8) DEFAULT 0,
  total_earnings NUMERIC(20, 8) DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  prediction_id VARCHAR(100) NOT NULL,
  market_id VARCHAR(100) NOT NULL,
  position BOOLEAN NOT NULL,
  amount NUMERIC(20, 8) NOT NULL,
  outcome BOOLEAN,
  payout NUMERIC(20, 8),
  transaction_hash VARCHAR(66) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(transaction_hash)
);

-- Create indices
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_market_id ON predictions(market_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_earnings ON user_stats(total_earnings DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_correct_predictions ON user_stats(correct_predictions DESC);
