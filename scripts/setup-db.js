
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupTables() {
  try {
    console.log('Setting up database tables...');
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        primary_wallet TEXT UNIQUE NOT NULL,
        display_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create user_stats table for leaderboard
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        stat_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id),
        total_invested BIGINT DEFAULT 0,
        total_claimed BIGINT DEFAULT 0,
        total_participated INTEGER DEFAULT 0,
        total_won INTEGER DEFAULT 0,
        total_lost INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Database tables created successfully!');
  } catch (error) {
    console.error('Error setting up database tables:', error);
  } finally {
    await pool.end();
  }
}

setupTables();
