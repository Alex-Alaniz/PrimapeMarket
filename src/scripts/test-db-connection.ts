import { query, pool } from '../lib/db';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test connection
    const result = await query('SELECT NOW() as current_time');
    console.log('Connection successful!', result.rows[0]);
    
    // Get table names
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in database:', tables.rows.map(row => row.table_name));
    
    // Get users
    console.log('Fetching users...');
    const users = await query('SELECT * FROM users LIMIT 5');
    console.log('Users:', users.rows);
    
    // Get user stats
    console.log('Fetching user stats...');
    const userStats = await query('SELECT * FROM user_stats LIMIT 5');
    console.log('User stats:', userStats.rows);
    
    // Get predictions
    console.log('Fetching predictions...');
    const predictions = await query('SELECT * FROM predictions LIMIT 5');
    console.log('Predictions:', predictions.rows);
    
    // Get markets
    console.log('Fetching markets...');
    const markets = await query('SELECT * FROM markets LIMIT 5');
    console.log('Markets:', markets.rows);
    
    // Close the pool
    await pool.end();
    
    console.log('Database connection test complete!');
  } catch (error) {
    console.error('Error testing database connection:', error);
    try {
      await pool.end();
    } catch (err) {
      console.error('Error closing pool:', err);
    }
  }
}

testConnection().catch(error => {
  console.error('Unhandled error in testConnection:', error);
}); 