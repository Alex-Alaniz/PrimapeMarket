
import { getPool } from './db';

async function setupDatabase() {
  const pool = getPool();
  
  try {
    console.log('Setting up PrimapeMarket database schema...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          user_id SERIAL PRIMARY KEY,
          primary_wallet VARCHAR(42) UNIQUE NOT NULL,
          display_name VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create user_emails table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_emails (
          user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
          email VARCHAR(255) UNIQUE NOT NULL,
          verified BOOLEAN DEFAULT FALSE,
          PRIMARY KEY (user_id, email)
      );
    `);
    
    // Create user_wallets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_wallets (
          user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
          wallet_address VARCHAR(42) UNIQUE NOT NULL,
          PRIMARY KEY (user_id, wallet_address)
      );
    `);
    
    // Create markets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS markets (
          market_id BIGINT PRIMARY KEY,
          question TEXT NOT NULL,
          end_time TIMESTAMP NOT NULL,
          resolved BOOLEAN DEFAULT FALSE,
          winning_option_index BIGINT,
          total_pool BIGINT DEFAULT 0
      );
    `);
    
    // Create wallet_activity table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wallet_activity (
          id SERIAL PRIMARY KEY,
          wallet_address VARCHAR(42) NOT NULL,
          market_id BIGINT REFERENCES markets(market_id) ON DELETE CASCADE,
          option_index BIGINT NOT NULL,
          shares BIGINT NOT NULL,
          amount_spent BIGINT NOT NULL,
          amount_claimed BIGINT DEFAULT 0,
          event_type VARCHAR(20) CHECK (event_type IN ('buy', 'claim')) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create users_leaderboard table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users_leaderboard (
          user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
          total_invested BIGINT DEFAULT 0,
          total_claimed BIGINT DEFAULT 0,
          total_participated INT DEFAULT 0,
          total_won INT DEFAULT 0,
          total_lost INT DEFAULT 0,
          pnl BIGINT GENERATED ALWAYS AS (total_claimed - total_invested) STORED
      );
    `);
    
    // Create indices for performance optimization
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_wallet_activity_wallet ON wallet_activity(wallet_address);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_wallet_activity_market ON wallet_activity(market_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_leaderboard_pnl ON users_leaderboard(pnl DESC);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_leaderboard_won ON users_leaderboard(total_won DESC);`);
    
    // Verify the setup
    const result = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`);
    console.log('Tables created:');
    result.rows.forEach((row: any) => console.log(`- ${row.table_name}`));
    
    console.log('PostgreSQL database schema created successfully.');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => console.log('Database setup complete'))
    .catch(err => console.error('Database setup failed:', err))
    .finally(() => process.exit());
}

export default setupDatabase;
