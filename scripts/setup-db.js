
const { Client } = require('@vercel/postgres');

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL
  });

  try {
    await client.connect();
    console.log("Connected to database");

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        primary_wallet VARCHAR(255) UNIQUE NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Users table created/verified");

    // Create user_market_activity table to track user participation
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
    console.log("User market activity table created/verified");

    console.log("Database setup complete");
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.end();
  }
}

setupDatabase();
