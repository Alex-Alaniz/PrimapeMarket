
import 'dotenv/config';

// Twitter API v2 endpoint for user lookup
const TWITTER_API_ENDPOINT = 'https://api.twitter.com/2/users/by/username/';

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
    const existingProfile = await twitterDb.twitterProfile.findFirst({
      where: {
        username: cleanUsername
      }
    });
    
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
    
    // Check if we have a Twitter bearer token
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!bearerToken) {
      console.warn('Twitter Bearer Token not found in environment variables');
      return null;
    }

    // Only fetch from Twitter API if we don't have data in our DB
    console.log(`Fetching Twitter data for ${cleanUsername} from API`);
    
    // Fetch user data from Twitter API with retry logic
    let retries = 2;
    let response;
    
    while (retries >= 0) {
      response = await fetch(
        `${TWITTER_API_ENDPOINT}${cleanUsername}?user.fields=description,profile_image_url`, 
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`
          }
        }
      );
      
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
    }

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
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
import { twitterDb } from './twitter-prisma';

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
