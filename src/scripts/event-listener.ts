import { createPublicClient, http, parseAbiItem } from 'viem';
import { base } from 'viem/chains';
import { query } from '../lib/db';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a public client for Base
const client = createPublicClient({
  chain: base,
  transport: http(process.env.RPC_URL || 'https://mainnet.base.org'),
});

// Contract address and ABI events
const PREDICTION_CONTRACT_ADDRESS = process.env.PREDICTION_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

// Event signatures
const PREDICTION_MADE_EVENT = parseAbiItem('event PredictionMade(address indexed user, uint256 indexed marketId, uint256 predictionId, bool position, uint256 amount)');
const MARKET_CREATED_EVENT = parseAbiItem('event MarketCreated(uint256 indexed marketId, string title, string description, uint256 resolutionTime)');
const MARKET_RESOLVED_EVENT = parseAbiItem('event MarketResolved(uint256 indexed marketId, bool outcome)');

async function startEventListener() {
  console.log('Starting event listener...');
  console.log(`Listening for events from contract: ${PREDICTION_CONTRACT_ADDRESS}`);

  try {
    // Listen for PredictionMade events
    client.watchEvent({
      address: PREDICTION_CONTRACT_ADDRESS as `0x${string}`,
      event: PREDICTION_MADE_EVENT,
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            const { user, marketId, predictionId, position, amount } = log.args;
            
            console.log(`New prediction: Market #${marketId}, User: ${user}, Position: ${position}, Amount: ${amount}`);
            
            // Check if market exists
            const marketResult = await query(
              'SELECT * FROM markets WHERE market_id = $1',
              [marketId.toString()]
            );
            
            if (marketResult.rows.length === 0) {
              console.log(`Market #${marketId} not found, creating placeholder...`);
              
              // Create placeholder market
              await query(
                `INSERT INTO markets (market_id, title, description) 
                 VALUES ($1, $2, $3)
                 ON CONFLICT (market_id) DO NOTHING`,
                [marketId.toString(), `Market #${marketId}`, 'Placeholder market']
              );
            }
            
            // Check if user exists
            const userResult = await query(
              'SELECT * FROM users WHERE wallet_address = $1',
              [user]
            );
            
            let userId;
            
            if (userResult.rows.length === 0) {
              console.log(`User ${user} not found, creating...`);
              
              // Create user
              const insertUserResult = await query(
                'INSERT INTO users (wallet_address) VALUES ($1) RETURNING id',
                [user]
              );
              
              userId = insertUserResult.rows[0].id;
              
              // Create empty stats for new user
              await query(
                `INSERT INTO user_stats (user_id, total_predictions, correct_predictions, total_volume, total_earnings) 
                 VALUES ($1, 0, 0, 0, 0)`,
                [userId]
              );
            } else {
              userId = userResult.rows[0].id;
            }
            
            // Create prediction
            const txHash = log.transactionHash;
            
            // Check if prediction already exists
            const existingPredictionResult = await query(
              'SELECT * FROM predictions WHERE transaction_hash = $1',
              [txHash]
            );
            
            if (existingPredictionResult.rows.length > 0) {
              console.log(`Prediction with transaction hash ${txHash} already exists, skipping...`);
              continue;
            }
            
            // Insert prediction
            await query(
              `INSERT INTO predictions (
                user_id, prediction_id, market_id, position, amount, transaction_hash
              ) VALUES ($1, $2, $3, $4, $5, $6)`,
              [userId, predictionId.toString(), marketId.toString(), position, amount.toString(), txHash]
            );
            
            // Update user stats
            await query(
              `UPDATE user_stats 
               SET total_predictions = total_predictions + 1,
                   total_volume = total_volume + $1
               WHERE user_id = $2`,
              [amount.toString(), userId]
            );
            
            // Update market volume
            await query(
              `UPDATE markets 
               SET total_volume = total_volume + $1
               WHERE market_id = $2`,
              [amount.toString(), marketId.toString()]
            );
            
            console.log(`Prediction recorded: ID #${predictionId}`);
          } catch (error) {
            console.error('Error processing prediction event:', error);
          }
        }
      },
    });
    
    // Listen for MarketCreated events
    client.watchEvent({
      address: PREDICTION_CONTRACT_ADDRESS as `0x${string}`,
      event: MARKET_CREATED_EVENT,
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            const { marketId, title, description, resolutionTime } = log.args;
            
            console.log(`New market: #${marketId}, Title: ${title}`);
            
            // Convert resolution time from seconds to ISO date
            const resolutionDate = new Date(Number(resolutionTime) * 1000).toISOString();
            
            // Create or update market
            await query(
              `INSERT INTO markets (market_id, title, description, resolution_time) 
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (market_id) 
               DO UPDATE SET 
                 title = EXCLUDED.title,
                 description = EXCLUDED.description,
                 resolution_time = EXCLUDED.resolution_time`,
              [marketId.toString(), title, description, resolutionDate]
            );
            
            console.log(`Market recorded: ID #${marketId}`);
          } catch (error) {
            console.error('Error processing market creation event:', error);
          }
        }
      },
    });
    
    // Listen for MarketResolved events
    client.watchEvent({
      address: PREDICTION_CONTRACT_ADDRESS as `0x${string}`,
      event: MARKET_RESOLVED_EVENT,
      onLogs: async (logs) => {
        for (const log of logs) {
          try {
            const { marketId, outcome } = log.args;
            
            console.log(`Market resolved: #${marketId}, Outcome: ${outcome}`);
            
            // Begin transaction
            await query('BEGIN');
            
            try {
              // Update market outcome
              await query(
                `UPDATE markets 
                 SET outcome = $1, 
                     updated_at = CURRENT_TIMESTAMP
                 WHERE market_id = $2`,
                [outcome, marketId.toString()]
              );
              
              // Get all predictions for this market
              const predictionsResult = await query(
                'SELECT * FROM predictions WHERE market_id = $1',
                [marketId.toString()]
              );
              
              const predictions = predictionsResult.rows;
              
              // Update predictions and user stats
              for (const prediction of predictions) {
                // Set prediction outcome and calculate payout
                const predictionOutcome = prediction.position === outcome;
                const payout = predictionOutcome ? prediction.amount * 2 : 0; // Simple 2x payout for winners
                
                // Update prediction
                await query(
                  `UPDATE predictions 
                   SET outcome = $1, 
                       payout = $2,
                       updated_at = CURRENT_TIMESTAMP
                   WHERE id = $3`,
                  [predictionOutcome, payout, prediction.id]
                );
                
                // Update user stats
                await query(
                  `UPDATE user_stats 
                   SET correct_predictions = correct_predictions + $1,
                       total_earnings = total_earnings + $2
                   WHERE user_id = $3`,
                  [predictionOutcome ? 1 : 0, payout, prediction.user_id]
                );
              }
              
              // Update user rankings
              await query(`
                WITH ranked_users AS (
                  SELECT 
                    user_id,
                    RANK() OVER (ORDER BY total_earnings DESC) as new_rank
                  FROM user_stats
                )
                UPDATE user_stats us
                SET rank = ru.new_rank
                FROM ranked_users ru
                WHERE us.user_id = ru.user_id
              `);
              
              // Commit transaction
              await query('COMMIT');
              
              console.log(`Market resolution recorded: ID #${marketId}, affected ${predictions.length} predictions`);
            } catch (error) {
              // Rollback transaction on error
              await query('ROLLBACK');
              throw error;
            }
          } catch (error) {
            console.error('Error processing market resolution event:', error);
          }
        }
      },
    });
    
    console.log('Event listeners started successfully');
  } catch (error) {
    console.error('Error starting event listeners:', error);
  }
}

// Start the event listener
startEventListener().catch(console.error);

// Keep the process running
process.on('SIGINT', async () => {
  console.log('Stopping event listener...');
  process.exit(0);
}); 