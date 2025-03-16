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

-- Insert test users
INSERT INTO users (wallet_address, username, bio)
VALUES 
  ('0x1234567890123456789012345678901234567890', 'alice', 'Crypto enthusiast'),
  ('0x2345678901234567890123456789012345678901', 'bob', 'Prediction market expert'),
  ('0x3456789012345678901234567890123456789012', 'charlie', 'Just here for fun')
ON CONFLICT (wallet_address) DO NOTHING;

-- Insert test markets
INSERT INTO markets (market_id, title, description, resolution_time)
VALUES 
  ('market1', 'Will BTC reach $100k by end of 2024?', 'Market for BTC price prediction', '2024-12-31T23:59:59Z'),
  ('market2', 'Will ETH reach $10k by end of 2024?', 'Market for ETH price prediction', '2024-12-31T23:59:59Z'),
  ('market3', 'Will SOL reach $500 by end of 2024?', 'Market for SOL price prediction', '2024-12-31T23:59:59Z')
ON CONFLICT (market_id) DO NOTHING;

-- Insert user stats and predictions
DO $$
DECLARE
  user_record RECORD;
  market_ids TEXT[] := ARRAY['market1', 'market2', 'market3'];
  market_id TEXT;
  position BOOLEAN;
  amount NUMERIC;
  outcome BOOLEAN;
  payout NUMERIC;
  tx_hash TEXT;
  pred_id TEXT;
BEGIN
  FOR user_record IN SELECT id FROM users LIMIT 3 LOOP
    -- Insert user stats
    INSERT INTO user_stats (user_id, total_predictions, correct_predictions, total_volume, total_earnings, rank)
    VALUES (
      user_record.id,
      FLOOR(RANDOM() * 50),
      FLOOR(RANDOM() * 30),
      RANDOM() * 1000,
      RANDOM() * 500,
      FLOOR(RANDOM() * 100)
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert predictions
    FOR i IN 1..5 LOOP
      market_id := market_ids[1 + FLOOR(RANDOM() * 3)];
      position := RANDOM() > 0.5;
      amount := RANDOM() * 100;
      
      IF RANDOM() > 0.5 THEN
        outcome := RANDOM() > 0.5;
        IF outcome THEN
          payout := amount * (1 + RANDOM());
        ELSE
          payout := 0;
        END IF;
      ELSE
        outcome := NULL;
        payout := NULL;
      END IF;
      
      tx_hash := '0x' || MD5(RANDOM()::TEXT);
      pred_id := 'pred_' || MD5(RANDOM()::TEXT);
      
      INSERT INTO predictions (
        user_id, prediction_id, market_id, position, amount, outcome, payout, transaction_hash
      )
      VALUES (
        user_record.id,
        pred_id,
        market_id,
        position,
        amount,
        outcome,
        payout,
        tx_hash
      )
      ON CONFLICT (transaction_hash) DO NOTHING;
    END LOOP;
  END LOOP;
END $$; 