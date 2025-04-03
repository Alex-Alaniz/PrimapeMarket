import 'dotenv/config';
import { db, twitterDb } from './twitter-prisma';

// Twitter API v2 endpoint for user lookup
const TWITTER_API_ENDPOINT = 'https://api.twitter.com/2/users/by/username/';

// Interface for Twitter API response
export interface TwitterUserData {
  id: string;
  name: string;
  username: string;
  description: string;
  profile_image_url: string;
}

// Rate limiting
let lastApiCallTime = 0;
const MIN_API_CALL_INTERVAL = 3000; // 3 seconds between API calls

/**
 * Checks if we can make an API call based on rate limiting
 */
export function canMakeApiCall(): boolean {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTime;
  return timeSinceLastCall >= MIN_API_CALL_INTERVAL;
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
      existingProfile = await db.twitterProfile.findUnique({
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

    // Check if we can make an API call based on rate limiting
    if (!canMakeApiCall()) {
      console.warn('Rate limit exceeded for Twitter API calls');
      return null;
    }

    // Check if we have Twitter bearer tokens (primary and backup)
    const primaryBearerToken = process.env.TWITTER_BEARER_TOKEN;
    const secondaryBearerToken = process.env.TWITTER_BEARER_TOKEN_SECONDARY;

    if (!primaryBearerToken && !secondaryBearerToken) {
      console.warn('No Twitter Bearer Tokens found in environment variables');
      return null;
    }

    // Set the bearer token (try primary first, then secondary)
    const bearerToken = primaryBearerToken || secondaryBearerToken;

    // Update last API call time for rate limiting
    lastApiCallTime = Date.now();

    // Make the API call
    const response = await fetch(`${TWITTER_API_ENDPOINT}${cleanUsername}?user.fields=profile_image_url,description`, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch Twitter profile for ${cleanUsername}: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (!data.data) {
      console.error(`No data returned for Twitter profile ${cleanUsername}`);
      return null;
    }

    // Return the user data
    return {
      id: data.data.id,
      name: data.data.name,
      username: data.data.username,
      description: data.data.description || '',
      profile_image_url: data.data.profile_image_url || ''
    };
  } catch (error) {
    console.error(`Error fetching Twitter profile for ${username}:`, error);
    return null;
  }
}

/**
 * Caches a Twitter profile in the database
 * @param profile Twitter profile data to cache
 */
export async function cacheTwitterProfile(profile: TwitterUserData): Promise<boolean> {
  if (!twitterDb) {
    console.warn('Twitter database not available, cannot cache profile');
    return false;
  }

  try {
    await db.twitterProfile.upsert({
      where: {
        username: profile.username
      },
      update: {
        name: profile.name,
        description: profile.description,
        profile_image_url: profile.profile_image_url,
        last_updated: new Date()
      },
      create: {
        id: profile.id,
        username: profile.username,
        name: profile.name,
        description: profile.description,
        profile_image_url: profile.profile_image_url,
        last_updated: new Date()
      }
    });

    console.log(`Twitter profile cached for ${profile.username}`);
    return true;
  } catch (error) {
    console.error(`Error caching Twitter profile for ${profile.username}:`, error);
    return false;
  }
}