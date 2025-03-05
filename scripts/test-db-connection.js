
require('dotenv').config();
const { Client } = require('@vercel/postgres');

async function testConnection() {
  console.log('Testing PostgreSQL connection...');
  // Try both environment variables
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  console.log('Connection string available:', !!connectionString);
  
  if (!connectionString) {
    console.error('No database connection string found in environment variables!');
    console.error('Please set up the DATABASE_URL in Replit Secrets.');
    return;
  }
  
  const client = new Client({
    connectionString: connectionString
  });

  try {
    await client.connect();
    console.log('Successfully connected to PostgreSQL database!');
    const result = await client.query('SELECT NOW() as now');
    console.log('Current database time:', result.rows[0].now);
  } catch (error) {
    console.error('Connection error:', error.message);
    console.error('Full error:', error);
  } finally {
    try {
      await client.end();
      console.log('Connection closed');
    } catch (err) {
      console.error('Error closing connection:', err);
    }
  }
}

testConnection();
