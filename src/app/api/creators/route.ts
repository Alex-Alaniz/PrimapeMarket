
import { NextResponse } from 'next/server';
import { db } from '@/lib/twitter-prisma'; // Import the safe db wrapper instead
import { getTwitterProfileData, cacheTwitterProfile } from '@/lib/twitter-api';

export async function GET(request: Request) {
  // Get URL parameters
  const url = new URL(request.url);
  const useCache = url.searchParams.get('use_cache') === 'true';
  const _forceRefresh = url.searchParams.get('force_refresh') === 'true';
  
  try {
    // Define the specific order for creators
    const orderedCreators = [
      "PrimapeMarkets",
      "AlexDotEth",
      "apecoin",
      "ApeChainHUB",
      "yugalabs",
      "ApewhaleNFT",
      "boringmerch",
      "BoredApeYC"
    ];
    
    // Get whitelisted creators from the database using our safety wrapper
    let whitelistedCreators = [];
    try {
      // Use the safe wrapper which has built-in fallback for production
      const dbCreators = await db.twitterWhitelist.findMany();
      
      // If we have creators from DB, sort them according to our preferred order
      if (dbCreators && dbCreators.length > 0) {
        console.log(`Found ${dbCreators.length} creators in database`);
        
        // Sort creators in the specified order
        const creatorMap = {};
        dbCreators.forEach(creator => {
          creatorMap[creator.username] = creator;
        });
        
        // First add creators in our specific order
        whitelistedCreators = orderedCreators
          .filter(username => creatorMap[username])
          .map(username => creatorMap[username]);
        
        // Then add any remaining creators
        const remainingCreators = dbCreators.filter(
          creator => !orderedCreators.includes(creator.username)
        );
        
        whitelistedCreators = [...whitelistedCreators, ...remainingCreators];
      } else {
        // Fallback to hardcoded creators if no data in database
        console.log("No creators found in database, using fallback data");
        whitelistedCreators = [
          { username: "PrimapeMarkets", category: "News", points: 690, is_onboarded: true },
          { username: "AlexDotEth", category: "Spaces", points: 500, is_onboarded: true },
          { username: "apecoin", category: "News", points: 250, is_onboarded: true },
          { username: "ApeChainHUB", category: "News", points: 250, is_onboarded: true },
          { username: "yugalabs", category: "News", points: 250, is_onboarded: true },
          { username: "ApewhaleNFT", category: "Spaces", points: 250, is_onboarded: true },
          { username: "boringmerch", category: "News", points: 250, is_onboarded: true },
          { username: "BoredApeYC", category: "News", points: 250, is_onboarded: true }
        ];
      }
    } catch (error) {
      console.error("Failed to fetch from twitterWhitelist:", error);
      // Fallback to hardcoded creators if database fetch fails
      whitelistedCreators = [
        { username: "PrimapeMarkets", category: "News", points: 690, is_onboarded: true },
        { username: "AlexDotEth", category: "Spaces", points: 500, is_onboarded: true },
        { username: "apecoin", category: "News", points: 250, is_onboarded: true },
        { username: "ApeChainHUB", category: "News", points: 250, is_onboarded: true },
        { username: "yugalabs", category: "News", points: 250, is_onboarded: true },
        { username: "ApewhaleNFT", category: "Spaces", points: 250, is_onboarded: true },
        { username: "boringmerch", category: "News", points: 250, is_onboarded: true },
        { username: "BoredApeYC", category: "News", points: 250, is_onboarded: true }
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
          // Always check cached data first - force refresh from DB
          const cleanUsername = creator.handle.replace('@', '');
          console.log(`Fetching cached profile for ${cleanUsername}`);
          
          let cachedProfile = null;
          try {
            // Use the safer db wrapper that includes fallback handling
            cachedProfile = await db.twitterProfile.findUnique({
              where: { username: cleanUsername }
            });
          } catch (prismaError) {
            console.error(`Prisma error for ${cleanUsername}:`, prismaError);
            // Continue with null cachedProfile, will use fallback data below
          }
          
          if (cachedProfile) {
            console.log(`Using cached Twitter data for ${cleanUsername}`);
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
              
              // Mark as onboarded in the whitelist using our safer wrapper
              try {
                await db.twitterWhitelist.update({
                  where: { username: creator.handle.replace('@', '') },
                  data: { is_onboarded: true }
                });
              } catch (updateError) {
                console.error(`Error updating whitelist for ${creator.handle}:`, updateError);
                // Continue even if update fails
              }
              
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
