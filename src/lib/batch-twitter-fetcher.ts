import { db, twitterDb } from './twitter-prisma';
import { getTwitterProfileData, cacheTwitterProfile, canMakeApiCall } from './twitter-api';

// Constants for batch processing
const BATCH_SIZE = 5; // Number of profiles to process in a batch
const BATCH_INTERVAL_MS = 60000; // 1 minute between batches

// Batch processing state
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

  try {
    isFetchingBatch = true;

    // Count total creators to process
    const totalCreatorsCount = await db.whitelistedCreator.count();

    if (totalCreatorsCount === 0) {
      console.log('No creators to process');
      isFetchingBatch = false;
      return { processed: 0, remaining: 0, nextBatchTime: now + BATCH_INTERVAL_MS };
    }

    // Get creators for this batch
    const creators = await db.whitelistedCreator.findMany({
      skip: currentBatchIndex,
      take: BATCH_SIZE,
      orderBy: { username: 'asc' }
    });

    if (creators.length === 0) {
      // Reset batch index if we've processed all creators
      currentBatchIndex = 0;
      lastBatchTime = now;
      isFetchingBatch = false;
      return { processed: 0, remaining: totalCreatorsCount, nextBatchTime: now + BATCH_INTERVAL_MS };
    }

    // Process each creator in the batch
    let processedCount = 0;
    for (const creator of creators) {
      if (!canMakeApiCall()) {
        console.log('Rate limit reached, stopping batch processing');
        break;
      }

      const twitterData = await getTwitterProfileData(creator.username);
      if (twitterData) {
        await cacheTwitterProfile(twitterData);
        processedCount++;
      }
    }

    // Update state for next batch
    currentBatchIndex += creators.length;
    if (currentBatchIndex >= totalCreatorsCount) {
      currentBatchIndex = 0;
    }

    const remainingCreators = totalCreatorsCount - currentBatchIndex;

    lastBatchTime = now;
    isFetchingBatch = false;

    return { 
      processed: processedCount, 
      remaining: remainingCreators, 
      nextBatchTime: now + BATCH_INTERVAL_MS 
    };
  } catch (error) {
    console.error('Error processing Twitter batch:', error);
    isFetchingBatch = false;
    return { processed: 0, remaining: null, nextBatchTime: now + BATCH_INTERVAL_MS, error: true };
  }
}

/**
 * Get the status of the batch processing
 */
export function getBatchStatus() {
  const now = Date.now();
  const nextBatchTime = lastBatchTime + BATCH_INTERVAL_MS;
  const timeUntilNextBatch = Math.max(0, nextBatchTime - now);

  return {
    isProcessing: isFetchingBatch,
    lastBatchTime: lastBatchTime > 0 ? new Date(lastBatchTime).toISOString() : null,
    nextBatchTime: lastBatchTime > 0 ? new Date(nextBatchTime).toISOString() : null,
    timeUntilNextBatchMs: timeUntilNextBatch,
    currentBatchIndex
  };
}