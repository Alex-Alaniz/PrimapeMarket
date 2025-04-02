
import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getTwitterProfileData } from '@/lib/twitter-api';

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
          // Get Twitter profile data for this creator
          const twitterData = await getTwitterProfileData(creator.handle);
          
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
