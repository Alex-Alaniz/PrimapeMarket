
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { twitterDb } from '@/lib/twitter-prisma';
import { getTwitterProfileData, cacheTwitterProfile } from '@/lib/twitter-api';

export async function GET() {
  try {
    // Get creators from the database
    const creators = [
      {
        id: '1',
        handle: 'AlexDotEth',
        name: 'Alex | Web3 Builder',
        points: 250,
        category: 'Spaces',
        engagementTypes: ['listen', 'share', 'comment'],
        twitterId: '',
        description: '', 
        avatar: '',
        claimed: false
      },
      // More creators would be added from database eventually
    ];

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
              twitterId: cachedProfile.id,
              avatar: cachedProfile.profile_image_url || '/images/pm.PNG',
              description: cachedProfile.description || 'Creator information not available at this time.'
            };
          }
          
          // If no cached data, fetch from Twitter API
          const twitterData = await getTwitterProfileData(creator.handle);
          
          // Cache the Twitter data for future use
          if (twitterData) {
            await cacheTwitterProfile(twitterData);
          }
          
          return {
            ...creator,
            twitterId: twitterData?.id || '',
            avatar: twitterData?.profile_image_url || '/images/pm.PNG',
            description: twitterData?.description || 'Creator information not available at this time.'
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
