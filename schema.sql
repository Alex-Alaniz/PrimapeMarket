-- Users Table: Stores user profiles with a primary wallet and display name
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Emails Table: Allows multiple emails per user
CREATE TABLE user_emails (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, email)
);

-- User Wallets Table: Allows linking multiple wallets to a user profile
CREATE TABLE user_wallets (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  PRIMARY KEY (user_id, wallet_address)
);

-- Markets Table: Stores market data from the smart contract
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

-- Wallet Activity Table: Tracks user activities like buying shares and claiming winnings
CREATE TABLE wallet_activity (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) NOT NULL,
  market_id BIGINT REFERENCES markets(market_id) ON DELETE CASCADE,
  option_index BIGINT NOT NULL,
  shares BIGINT NOT NULL,
  amount_spent BIGINT NOT NULL, -- Amount spent on shares
  amount_claimed BIGINT DEFAULT 0, -- Amount claimed after resolution
  event_type VARCHAR(20) CHECK (event_type IN ('buy', 'claim')) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Leaderboard Table: Aggregates user performance metrics for the leaderboard
CREATE TABLE users_leaderboard (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_invested BIGINT DEFAULT 0,
  total_claimed BIGINT DEFAULT 0,
  total_participated INT DEFAULT 0,
  total_won INT DEFAULT 0,
  total_lost INT DEFAULT 0,
  pnl BIGINT GENERATED ALWAYS AS (total_claimed - total_invested) STORED
);

-- Indices for performance optimization
CREATE INDEX idx_wallet_activity_wallet ON wallet_activity(wallet_address);
CREATE INDEX idx_wallet_activity_market ON wallet_activity(market_id);
CREATE INDEX idx_leaderboard_pnl ON users_leaderboard(pnl DESC);
CREATE INDEX idx_leaderboard_won ON users_leaderboard(total_won DESC);

-- User Stats Table: Stores user performance metrics for the leaderboard
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

-- Predictions Table: Stores individual prediction data
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

-- Create indices for performance optimization
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_market_id ON predictions(market_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_earnings ON user_stats(total_earnings DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_correct_predictions ON user_stats(correct_predictions DESC); 