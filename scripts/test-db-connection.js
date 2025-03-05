
require('dotenv').config();
const { Client } = require('@vercel/postgres');

async function testConnection() {
  console.log('Testing PostgreSQL connection...');
  console.log('Connection string:', process.env.POSTGRES_URL);
  
  const client = new Client({
    connectionString: process.env.POSTGRES_URL
  });

  try {
    await client.connect();
    console.log('Successfully connected to PostgreSQL database!');
    const result = await client.query('SELECT NOW() as now');
    console.log('Current database time:', result.rows[0].now);
  } catch (error) {
    console.error('Connection error:', error.message);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

testConnection();
