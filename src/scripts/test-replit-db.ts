
import { query, pool } from '../lib/db';

async function testReplitDbConnection() {
  try {
    console.log('Testing Replit database connection...');
    
    // Test connection
    const result = await query('SELECT NOW() as current_time');
    console.log('Connection successful!', result.rows[0]);
    
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

testReplitDbConnection();
