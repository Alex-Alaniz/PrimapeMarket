import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: 'postgres', // Connect to default database first
});

console.log('Starting database setup script...');

async function setupDatabase() {
  console.log('Connecting to PostgreSQL...');
  let client;

  try {
    client = await pool.connect();
    console.log('Connected to PostgreSQL successfully');

    console.log('Setting up database...');

    // Create database if it doesn't exist
    try {
      await client.query('CREATE DATABASE primape_market_db;');
      console.log('Database created successfully');
    } catch (error: any) {
      console.log('Error creating database:', error.message);
      if (error.code === '42P04') { // Database already exists error code
        console.log('Database already exists');
      } else {
        throw error;
      }
    }

    // Disconnect from default database and connect to our database
    console.log('Releasing client and ending pool...');
    await client.release();
    await pool.end();
    console.log('Connecting to primape_market_db database...');

    const appPool = new Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: 'primape_market_db',
    });

    console.log('Getting client from app pool...');
    const appClient = await appPool.connect();
    console.log('Connected to primape_market_db database');

    // Create tables
    console.log('Creating users table...');
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        wallet_address VARCHAR(42) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE,
        avatar_url TEXT,
        bio TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Users table created');

    console.log('Creating markets table...');
    await appClient.query(`
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
    `);
    console.log('Markets table created');

    console.log('Creating user_stats table...');
    await appClient.query(`
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
    `);
    console.log('User stats table created');

    console.log('Creating predictions table...');
    await appClient.query(`
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
    `);
    console.log('Predictions table created');

    // Create indices
    console.log('Creating indices...');
    await appClient.query(`
      CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
      CREATE INDEX IF NOT EXISTS idx_predictions_market_id ON predictions(market_id);
      CREATE INDEX IF NOT EXISTS idx_user_stats_total_earnings ON user_stats(total_earnings DESC);
      CREATE INDEX IF NOT EXISTS idx_user_stats_correct_predictions ON user_stats(correct_predictions DESC);
    `);
    console.log('Indices created');

    // Insert test data
    console.log('Inserting test users...');
    await appClient.query(`
      INSERT INTO users (wallet_address, username, bio)
      VALUES 
        ('0x1234567890123456789012345678901234567890', 'alice', 'Crypto enthusiast'),
        ('0x2345678901234567890123456789012345678901', 'bob', 'Prediction market expert'),
        ('0x3456789012345678901234567890123456789012', 'charlie', 'Just here for fun')
      ON CONFLICT (wallet_address) DO NOTHING;
    `);
    console.log('Test users created');

    console.log('Inserting test markets...');
    await appClient.query(`
      INSERT INTO markets (market_id, title, description, resolution_time)
      VALUES 
        ('market1', 'Will BTC reach $100k by end of 2024?', 'Market for BTC price prediction', '2024-12-31T23:59:59Z'),
        ('market2', 'Will ETH reach $10k by end of 2024?', 'Market for ETH price prediction', '2024-12-31T23:59:59Z'),
        ('market3', 'Will SOL reach $500 by end of 2024?', 'Market for SOL price prediction', '2024-12-31T23:59:59Z')
      ON CONFLICT (market_id) DO NOTHING;
    `);
    console.log('Test markets created');

    // Get user IDs
    console.log('Getting user IDs...');
    const userResult = await appClient.query(`SELECT id, wallet_address FROM users LIMIT 3;`);
    const users = userResult.rows;
    console.log('Found users:', users);

    if (users.length > 0) {
      // Insert user stats
      console.log('Inserting user stats...');
      for (const user of users) {
        await appClient.query(`
          INSERT INTO user_stats (user_id, total_predictions, correct_predictions, total_volume, total_earnings, rank)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (user_id) DO NOTHING;
        `, [user.id, Math.floor(Math.random() * 50), Math.floor(Math.random() * 30), Math.random() * 1000, Math.random() * 500, Math.floor(Math.random() * 100)]);
      }
      console.log('Test user stats created');

      // Insert predictions
      console.log('Inserting predictions...');
      const markets = ['market1', 'market2', 'market3'];
      for (const user of users) {
        for (let i = 0; i < 5; i++) {
          const marketId = markets[Math.floor(Math.random() * markets.length)];
          const position = Math.random() > 0.5;
          const amount = Math.random() * 100;
          const outcome = Math.random() > 0.5 ? Math.random() > 0.5 : null;
          const payout = outcome === true ? amount * (1 + Math.random()) : outcome === false ? 0 : null;

          await appClient.query(`
            INSERT INTO predictions (
              user_id, prediction_id, market_id, position, amount, outcome, payout, transaction_hash
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (transaction_hash) DO NOTHING;
          `, [
            user.id,
            `pred_${Math.random().toString(36).substring(2, 15)}`,
            marketId,
            position,
            amount,
            outcome,
            payout,
            `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
          ]);
        }
      }
      console.log('Test predictions created');
    }

    console.log('Database setup complete!');

    // Verify tables were created
    console.log('Verifying tables...');
    const tablesResult = await appClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('Tables in database:', tablesResult.rows);

    // Release client and end pool
    console.log('Releasing client and ending pool...');
    await appClient.release();
    await appPool.end();
  } catch (error: any) {
    console.error('Error setting up database:', error);
  } finally {
    try {
      if (client) {
        console.log('Releasing client in finally block...');
        client.release();
      }
    } catch (error: any) {
      console.error('Error releasing client:', error);
    }

    try {
      console.log('Ending pool in finally block...');
      await pool.end();
    } catch (error: any) {
      console.error('Error ending pool:', error);
    }
  }
}

setupDatabase().catch((err: any) => {
  console.error('Unhandled error in setupDatabase:', err);
});

export async function getMarketById(marketId: string): Promise<Record<string, unknown>> {
  //Implementation for getMarketById
  return {} as Record<string, unknown>;
}

export async function getUserByWallet(walletAddress: string): Promise<Record<string, unknown> | null> {
  //Implementation for getUserByWallet
  return null;
}

export async function getUserStats(userId: number): Promise<Record<string, unknown> | null> {
  //Implementation for getUserStats
  return null;
}

export async function getPredictionsByUserId(userId: number): Promise<Record<string, unknown>[]> {
  //Implementation for getPredictionsByUserId
  return [];
}