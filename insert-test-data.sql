
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

-- Insert sample user stats
INSERT INTO user_stats (user_id, total_predictions, correct_predictions, total_volume, total_earnings, rank)
SELECT 
  id,
  FLOOR(RANDOM() * 50)::int,
  FLOOR(RANDOM() * 30)::int,
  RANDOM() * 1000,
  RANDOM() * 500,
  FLOOR(RANDOM() * 100)::int
FROM users
LIMIT 3
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample predictions
DO $$
DECLARE
  user_record RECORD;
  market_id_var VARCHAR(100);
  position_var BOOLEAN;
  amount_var NUMERIC;
  outcome_var BOOLEAN;
  payout_var NUMERIC;
  tx_hash_var VARCHAR(66);
  pred_id_var VARCHAR(100);
BEGIN
  FOR user_record IN SELECT id FROM users LIMIT 3 LOOP
    FOR i IN 1..5 LOOP
      -- Select random market
      SELECT market_id INTO market_id_var FROM markets ORDER BY RANDOM() LIMIT 1;
      
      -- Generate random values
      position_var := RANDOM() > 0.5;
      amount_var := RANDOM() * 100;
      
      IF RANDOM() > 0.5 THEN
        outcome_var := RANDOM() > 0.5;
        IF outcome_var THEN
          payout_var := amount_var * (1 + RANDOM());
        ELSE
          payout_var := 0;
        END IF;
      ELSE
        outcome_var := NULL;
        payout_var := NULL;
      END IF;
      
      tx_hash_var := '0x' || MD5(RANDOM()::TEXT || NOW()::TEXT || i::TEXT || user_record.id::TEXT);
      pred_id_var := 'pred_' || MD5(RANDOM()::TEXT || NOW()::TEXT || i::TEXT || user_record.id::TEXT);
      
      INSERT INTO predictions (
        user_id, prediction_id, market_id, position, amount, outcome, payout, transaction_hash
      )
      VALUES (
        user_record.id,
        pred_id_var,
        market_id_var,
        position_var,
        amount_var,
        outcome_var,
        payout_var,
        tx_hash_var
      )
      ON CONFLICT (transaction_hash) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
