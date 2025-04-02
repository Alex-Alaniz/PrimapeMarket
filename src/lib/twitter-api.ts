
import 'dotenv/config';
import { twitterDb } from './twitter-prisma';

// Twitter API v2 endpoint for user lookup
const TWITTER_API_ENDPOINT = 'https://api.twitter.com/2/users/by/username/';

// Track API rate limits
let apiCallsInWindow = 0;
let apiWindowResetTime = Date.now() + (15 * 60 * 1000); // 15 minutes from now

// Reset counter when the time window passes
function checkAndResetRateLimit() {
  const now = Date.now();
  if (now > apiWindowResetTime) {
    apiCallsInWindow = 0;
    apiWindowResetTime = now + (15 * 60 * 1000); // 15 minutes from now
    return true;
  }
  return false;
}

// Check if we're within rate limits
export function canMakeApiCall() {
  checkAndResetRateLimit();
  return apiCallsInWindow < 3; // 3 requests per 15 minutes
}

interface TwitterUserData {
  id: string;
  name: string;
  username: string;
  description: string;
  profile_image_url: string;
}

/**
 * Fetches Twitter profile data for a given username
 * @param username Twitter handle (without the @ symbol)
 * @returns Twitter profile data
 */
export async function getTwitterProfileData(username: string): Promise<TwitterUserData | null> {
  try {
    // Clean the username (remove @ if present)
    const cleanUsername = username.replace('@', '');
    
    // First, try to get data from our database to avoid API calls
    let existingProfile;
    try {
      existingProfile = await twitterDb.twitterProfile.findUnique({
        where: {
          username: cleanUsername
        }
      });
    } catch (error) {
      console.error(`Error fetching existing Twitter profile for ${cleanUsername}:`, error);
      existingProfile = null;
    }
    
    if (existingProfile) {
      console.log(`Using existing Twitter profile for ${cleanUsername}`);
      return {
        id: existingProfile.id,
        name: existingProfile.name || cleanUsername,
        username: existingProfile.username,
        description: existingProfile.description || '',
        profile_image_url: existingProfile.profile_image_url || ''
      };
    }
    
    // Check if we have Twitter bearer tokens (primary and backup)
    const primaryBearerToken = process.env.TWITTER_BEARER_TOKEN;
    const secondaryBearerToken = process.env.TWITTER_BEARER_TOKEN_SECONDARY;
    
    if (!primaryBearerToken && !secondaryBearerToken) {
      console.warn('No Twitter Bearer Tokens found in environment variables');
      return null;
    }
    
    // For manual fetching, we'll bypass the rate limit check
    const isManualFetch = process.env.MANUAL_FETCH === 'true';
    
    // Check rate limits before making API call (unless it's a manual fetch)
    if (!isManualFetch && !canMakeApiCall()) {
      console.warn(`Rate limit reached for Twitter API. Cannot fetch ${cleanUsername} data.`);
      return null;
    }

    // Only fetch from Twitter API if we don't have data in our DB
    console.log(`Fetching Twitter data for ${cleanUsername} from API`);
    
    // Increment API call counter (unless it's a manual fetch)
    if (!isManualFetch) {
      apiCallsInWindow++;
    }
    
    // Determine which token to use - start with primary
    let bearerToken = primaryBearerToken;
    
    // Fetch user data from Twitter API with retry logic
    let retries = 2;
    let response: Response | undefined;
    
    let useSecondaryToken = false;
    
    while (retries >= 0) {
      // If primary token fails with auth error and we have a secondary token, try that
      if (useSecondaryToken && secondaryBearerToken) {
        console.log(`Trying secondary token for ${cleanUsername}`);
        bearerToken = secondaryBearerToken;
      }
      
      try {
        response = await fetch(
          `${TWITTER_API_ENDPOINT}${cleanUsername}?user.fields=description,profile_image_url`, 
          {
            headers: {
              Authorization: `Bearer ${bearerToken}`
            }
          }
        );
        
        // If we get a 401 Unauthorized and have a secondary token to try
        if (response.status === 401 && secondaryBearerToken && !useSecondaryToken) {
          console.warn(`Auth failed for ${cleanUsername}, trying secondary token...`);
          useSecondaryToken = true;
          continue; // Try again with secondary token
        }
        
        if (response.status === 429) {
          // Rate limited - wait and retry if we have retries left
          if (retries > 0) {
            console.warn(`Rate limited fetching ${cleanUsername}, retrying in 2s...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            retries--;
            continue;
          }
          throw new Error('Twitter API rate limited');
        }
        
        // Break out of retry loop if we got a response (even if it's an error)
        break;
      } catch (error) {
        console.error(`Network error fetching ${cleanUsername}:`, error);
        if (retries > 0) {
          retries--;
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw error; // Re-throw if out of retries
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Twitter API error: ${response?.status || 'unknown'} ${response?.statusText || 'unknown'}`);
    }

    const data = await response.json();
    
    if (!data.data) {
      console.warn(`No Twitter data found for username: ${username}`);
      return null;
    }

    return {
      id: data.data.id,
      name: data.data.name,
      username: data.data.username,
      description: data.data.description || '',
      profile_image_url: data.data.profile_image_url || ''
    };
  } catch (error) {
    console.error(`Error fetching Twitter data for ${username}:`, error);
    return null;
  }
}

/**
 * Caches Twitter profile data in our database
 */
export async function cacheTwitterProfile(profileData: TwitterUserData): Promise<void> {
  try {
    await twitterDb.twitterProfile.upsert({
      where: { id: profileData.id },
      update: {
        username: profileData.username,
        name: profileData.name,
        description: profileData.description,
        profile_image_url: profileData.profile_image_url,
        // You can update other fields as needed
      },
      create: {
        id: profileData.id,
        username: profileData.username,
        name: profileData.name,
        description: profileData.description,
        profile_image_url: profileData.profile_image_url,
        // Set default values for other required fields
        followers_count: 0,
        following_count: 0,
        tweet_count: 0,
      },
    });
    console.log('Twitter profile cached successfully:', profileData.username);
  } catch (error) {
    console.error('Error caching Twitter profile:', error);
  }
}
