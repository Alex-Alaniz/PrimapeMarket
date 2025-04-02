
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
    
    // Check if we have a Twitter bearer token
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!bearerToken) {
      console.warn('Twitter Bearer Token not found in environment variables');
      return null;
    }

    // Fetch user data from Twitter API
    const response = await fetch(
      `${TWITTER_API_ENDPOINT}${cleanUsername}?user.fields=description,profile_image_url`, 
      {
        headers: {
          Authorization: `Bearer ${bearerToken}`
        }
      }
    );

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
 * Note: This function would integrate with the Twitter-specific Prisma client
 */
export async function cacheTwitterProfile(profileData: TwitterUserData): Promise<void> {
  // Implement Twitter profile caching
  // This would be connected to the Twitter-specific Prisma client
  console.log('Caching Twitter profile:', profileData.username);
}
