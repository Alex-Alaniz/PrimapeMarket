
// Simple script to add mock data for testing
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
  },
});

const { query, getPool } = require('../src/lib/db');

async function addMockData() {
  const pool = getPool();
  
  try {
    console.log('Adding mock data for testing...');
    
    // Create mock users
    const users = [
      { wallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', name: 'CryptoWhale' },
      { wallet: '0xD8dA6BF26964aF9D7eEd9e03E53415D37aA96045', name: 'VitalikFan' },
      { wallet: '0x1E0049783F008A0085193E00003D00cd54003c71', name: 'ApeTrader' },
      { wallet: '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf', name: 'PredictionKing' },
      { wallet: '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF', name: 'MarketMaster' },
    ];
    
    // Add users
    for (const user of users) {
      // Check if user exists
      const existingUser = await query('SELECT * FROM users WHERE primary_wallet = $1', [user.wallet]);
      
      if (existingUser.rows.length === 0) {
        // Create user
        const result = await query(
          'INSERT INTO users (primary_wallet, display_name) VALUES ($1, $2) RETURNING user_id',
          [user.wallet, user.name]
        );
        
        const userId = result.rows[0].user_id;
        
        // Create leaderboard entry
        await query(
          'INSERT INTO users_leaderboard (user_id, total_invested, total_claimed, total_participated, total_won, total_lost) VALUES ($1, $2, $3, $4, $5, $6)',
          [userId, Math.floor(Math.random() * 10 * 1e18), Math.floor(Math.random() * 15 * 1e18), Math.floor(Math.random() * 20), Math.floor(Math.random() * 10), Math.floor(Math.random() * 5)]
        );
        
        console.log(`Created user: ${user.name}`);
      } else {
        console.log(`User ${user.name} already exists`);
      }
    }
    
    console.log('Mock data added successfully');
  } catch (error) {
    console.error('Error adding mock data:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  addMockData()
    .then(() => console.log('Mock data setup complete'))
    .catch(err => console.error('Mock data setup failed:', err))
    .finally(() => process.exit());
}
