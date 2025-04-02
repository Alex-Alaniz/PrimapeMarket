
import { NextResponse } from 'next/server';
import { twitterDb } from '@/lib/twitter-prisma';
import { getTwitterProfileData, cacheTwitterProfile } from '@/lib/twitter-api';

export async function GET(request: Request) {
  // Get URL parameters
  const url = new URL(request.url);
  const useCache = url.searchParams.get('use_cache') === 'true';
  
  try {
    // Get whitelisted creators from the database
    let whitelistedCreators = [];
    try {
      whitelistedCreators = await twitterDb.twitterWhitelist.findMany();
    } catch (error) {
      console.error("Failed to fetch from twitterWhitelist:", error);
      // Fallback to hardcoded creators if database fetch fails
      whitelistedCreators = [
        { username: "apecoin", category: "News", points: 250, is_onboarded: true },
        { username: "BoredApeYC", category: "News", points: 250, is_onboarded: true },
        { username: "yugalabs", category: "News", points: 250, is_onboarded: true }
      ];
    }
    
    // Map to the format expected by the frontend
    const creators = whitelistedCreators.map(creator => ({
      id: creator.username, // Using username as ID for now
      handle: creator.username,
      name: '',  // Will be populated from Twitter data
      points: creator.points || 200,
      category: creator.category || "Creator",
      engagementTypes: ['listen', 'share', 'comment'], // Default engagement types
      twitterId: '',
      description: '', 
      avatar: '',
      claimed: false
    }));

    // Enhance creators with Twitter data
    const enhancedCreators = await Promise.all(
      creators.map(async (creator) => {
        try {
          // Always check cached data first
          const cachedProfile = await twitterDb.twitterProfile.findUnique({
            where: { username: creator.handle.replace('@', '') }
          });
          
          if (cachedProfile) {
            console.log(`Using cached Twitter data for ${creator.handle}`);
            return {
              ...creator,
              name: cachedProfile.name || creator.handle,
              twitterId: cachedProfile.id,
              avatar: cachedProfile.profile_image_url || '/images/pm.PNG',
              description: cachedProfile.description || 'Creator information not available at this time.'
            };
          }
          
          // If useCache is true, don't try to fetch from Twitter API for uncached profiles
          // This respects rate limits by only using cached data
          if (useCache) {
            return {
              ...creator,
              name: `${creator.handle.replace('@', '')} | ApeChain Creator`,
              avatar: '/images/pm.PNG',
              description: 'Profile data will be loaded soon. Check back later for full details!'
            };
          }
          
          // If no cached data and we're allowed to fetch from API, do so
          try {
            const twitterData = await getTwitterProfileData(creator.handle);
            
            // Cache the Twitter data for future use
            if (twitterData) {
              await cacheTwitterProfile(twitterData);
              
              // Mark as onboarded in the whitelist
              await twitterDb.twitterWhitelist.update({
                where: { username: creator.handle.replace('@', '') },
                data: { is_onboarded: true }
              });
              
              return {
                ...creator,
                name: twitterData.name || creator.handle,
                twitterId: twitterData.id,
                avatar: twitterData.profile_image_url || '/images/pm.PNG',
                description: twitterData.description || 'Creator information not available at this time.'
              };
            }
          } catch (twitterError) {
            console.error(`Error fetching Twitter data for ${creator.handle}:`, twitterError);
            // Fall through to default placeholder data
          }
          
          // Return with placeholder data if Twitter API failed or returned no data
          return {
            ...creator,
            name: `${creator.handle.replace('@', '')} | ApeChain Creator`,
            twitterId: creator.id || '',
            avatar: '/images/pm.PNG',
            description: 'An awesome ApeChain creator building the future of Web3 social engagement. Check back soon for their full profile!'
          };
        } catch (error) {
          console.error(`Error fetching Twitter data for ${creator.handle}:`, error);
          return creator;
        }
      })
    );

    return NextResponse.json(enhancedCreators);
  } catch (error) {
    console.error('Error fetching creators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creators' },
      { status: 500 }
    );
  }
}
