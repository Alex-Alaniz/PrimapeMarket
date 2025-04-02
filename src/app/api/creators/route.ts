
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { twitterDb } from '@/lib/twitter-prisma';
import { getTwitterProfileData, cacheTwitterProfile } from '@/lib/twitter-api';

export async function GET() {
  try {
    // Get whitelisted creators from the database
    const whitelistedCreators = await twitterDb.twitterWhitelist.findMany();
    
    // Map to the format expected by the frontend
    const creators = whitelistedCreators.map(creator => ({
      id: creator.username, // Using username as ID for now
      handle: creator.username,
      name: '',  // Will be populated from Twitter data
      points: creator.points,
      category: creator.category,
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
          // Check if we have cached data first
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
          
          // If no cached data, fetch from Twitter API
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
