
import { twitterDb } from './twitter-prisma';
import { getTwitterProfileData, cacheTwitterProfile, canMakeApiCall } from './twitter-api';

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
    let skipped = 0;
    
    for (const creator of currentBatch) {
      try {
        // Check if profile already exists in cache
        const existingProfile = await twitterDb.twitterProfile.findUnique({
          where: { username: creator.username }
        });
        
        if (existingProfile && existingProfile.updated_at) {
          // Get the difference in hours
          const lastUpdated = new Date(existingProfile.updated_at).getTime();
          const hoursSinceUpdate = (now - lastUpdated) / (1000 * 60 * 60);
          
          // Only update profiles older than 24 hours
          if (hoursSinceUpdate < 24) {
            console.log(`Skipping ${creator.username} - cached profile is less than 24 hours old`);
            skipped++;
            continue;
          }
          console.log(`Profile for ${creator.username} is ${hoursSinceUpdate.toFixed(2)} hours old - updating`);
        }
        
        // Only reach this point if the profile doesn't exist or is older than 24 hours
        console.log(`Fetching Twitter data for ${creator.username}`);
        
        // Check if we should use the cached data instead of making an API call
        if (existingProfile && !canMakeApiCall()) {
          console.log(`Rate limited - using existing data for ${creator.username} instead of API call`);
          // Still count it as processed since we're handling it
          processed++;
          continue;
        }
        
        // Now make the API call if needed
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
      skipped,
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
