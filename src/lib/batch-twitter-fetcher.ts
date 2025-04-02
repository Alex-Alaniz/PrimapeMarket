
import { twitterDb } from './twitter-prisma';
import { getTwitterProfileData, cacheTwitterProfile } from './twitter-api';

// Constants for batch processing
const BATCH_SIZE = 3; // Process 3 creators at a time
const BATCH_INTERVAL_MS = 16 * 60 * 1000; // 16 minutes in milliseconds

// State variables
let isFetchingBatch = false;
let lastBatchTime = 0;
let currentBatchIndex = 0;

/**
 * Process a single batch of Twitter profiles
 */
export async function processBatch() {
  if (isFetchingBatch) {
    console.log('A batch is already being processed, skipping this request');
    return { processed: 0, remaining: null, nextBatchTime: lastBatchTime + BATCH_INTERVAL_MS };
  }

  const now = Date.now();
  const timeSinceLastBatch = now - lastBatchTime;
  
  // Check if we need to wait before processing the next batch
  if (lastBatchTime > 0 && timeSinceLastBatch < BATCH_INTERVAL_MS) {
    const waitTimeRemaining = BATCH_INTERVAL_MS - timeSinceLastBatch;
    console.log(`Need to wait ${Math.ceil(waitTimeRemaining / 1000)} seconds before next batch`);
    return { 
      processed: 0, 
      remaining: null, 
      nextBatchTime: lastBatchTime + BATCH_INTERVAL_MS,
      waitTimeMs: waitTimeRemaining 
    };
  }

  isFetchingBatch = true;
  lastBatchTime = now;
  
  try {
    // Get all whitelisted creators
    let creators = [];
    try {
      creators = await twitterDb.twitterWhitelist.findMany({
        orderBy: { added_at: 'asc' }
      });
    } catch (error) {
      console.error("Failed to fetch creators from database:", error);
      return { processed: 0, error: "Database error" };
    }
    
    // If we've processed all creators, start from the beginning
    if (currentBatchIndex >= creators.length) {
      currentBatchIndex = 0;
    }
    
    // Get current batch
    const endIndex = Math.min(currentBatchIndex + BATCH_SIZE, creators.length);
    const currentBatch = creators.slice(currentBatchIndex, endIndex);
    
    // Process each creator in the batch
    console.log(`Processing batch of ${currentBatch.length} creators (${currentBatchIndex+1}-${endIndex} of ${creators.length})`);
    let processed = 0;
    
    for (const creator of currentBatch) {
      try {
        console.log(`Fetching Twitter data for ${creator.username}`);
        const twitterData = await getTwitterProfileData(creator.username);
        
        if (twitterData) {
          await cacheTwitterProfile(twitterData);
          processed++;
          console.log(`Successfully updated ${creator.username}`);
        } else {
          console.log(`No Twitter data available for ${creator.username}`);
        }
      } catch (error) {
        console.error(`Error processing ${creator.username}:`, error);
      }
    }
    
    // Update index for next batch
    currentBatchIndex = endIndex;
    if (currentBatchIndex >= creators.length) {
      currentBatchIndex = 0; // Reset to beginning for next run
    }
    
    const nextBatchTime = Date.now() + BATCH_INTERVAL_MS;
    const remainingCreators = creators.length - currentBatchIndex;
    
    return { 
      processed, 
      remaining: remainingCreators,
      total: creators.length,
      nextBatchTime,
      nextBatchDate: new Date(nextBatchTime).toISOString()
    };
  } catch (error) {
    console.error("Error processing batch:", error);
    return { processed: 0, error: "Batch processing error" };
  } finally {
    isFetchingBatch = false;
  }
}

/**
 * Get the status of the batch processing
 */
export function getBatchStatus() {
  const now = Date.now();
  const timeSinceLastBatch = now - lastBatchTime;
  const nextBatchTime = lastBatchTime + BATCH_INTERVAL_MS;
  const timeUntilNextBatch = Math.max(0, nextBatchTime - now);
  
  return {
    isFetchingBatch,
    lastBatchTime: lastBatchTime > 0 ? new Date(lastBatchTime).toISOString() : null,
    nextBatchTime: lastBatchTime > 0 ? new Date(nextBatchTime).toISOString() : null,
    timeUntilNextBatchMs: timeUntilNextBatch,
    timeUntilNextBatchMinutes: Math.ceil(timeUntilNextBatch / 60000),
    currentBatchIndex,
  };
}
