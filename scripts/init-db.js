
require('dotenv').config();
const { Client } = require('@vercel/postgres');

async function initDB() {
  // Get connection string with priority
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  console.log('Initializing database...');
  console.log('Connection string available:', !!connectionString);
  console.log('Using env vars:', Object.keys(process.env).filter(key => 
    key.includes('DATABASE') || key.includes('POSTGRES')).join(', '));
  
  if (!connectionString) {
    console.error('ERROR: No database connection string found!');
    console.error('Please create a PostgreSQL database through the Replit interface:');
    console.error('1. Open a new tab in Replit and type "Database"');
    console.error('2. Click "create a database"');
    console.error('3. Return to this script after the database is created');
    return;
  }
  
  const client = new Client({
    connectionString: connectionString
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Successfully connected to PostgreSQL database!');
    
    // Test query
    const result = await client.query('SELECT NOW() as now');
    console.log('Database time:', result.rows[0].now);
    
    // Create tables
    console.log('Creating tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        primary_wallet VARCHAR(255) UNIQUE NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_market_activity (
        activity_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id),
        market_id INTEGER NOT NULL,
        invested_amount NUMERIC(20, 18) NOT NULL DEFAULT 0,
        claimed_amount NUMERIC(20, 18) NOT NULL DEFAULT 0,
        participated_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        claimed_timestamp TIMESTAMP WITH TIME ZONE,
        option_index INTEGER NOT NULL,
        won BOOLEAN
      );
    `);
    
    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    try {
      await client.end();
      console.log('Database connection closed');
    } catch (err) {
      console.error('Error closing connection:', err);
    }
  }
}

initDB();
