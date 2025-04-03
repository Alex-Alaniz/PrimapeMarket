import { NextResponse } from 'next/server';
import { db } from '@/lib/twitter-prisma';

export async function GET() {
  try {
    console.log('Simple creators API called');

    // First get all whitelisted creators from the database
    let whitelistedCreators = [];
    try {
      // Get all creators with no limit
      const dbCreators = await db.twitterWhitelist.findMany({
        orderBy: {
          // Sort by onboarded status first, then by points (descending), then by username
          is_onboarded: 'desc',
          points: 'desc',
          username: 'asc'
        }
      });
      
      console.log(`Simple API - Fetching all creators, found: ${dbCreators?.length || 0}`);

      if (dbCreators && dbCreators.length > 0) {
        console.log(`Found ${dbCreators.length} creators in whitelist`);
        whitelistedCreators = dbCreators;
      } else {
        console.log('No creators found in whitelist, using fallback data');
        // Fallback to hardcoded creators
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
      console.error('Error fetching whitelist:', error);
      // Fallback data in case of error
      whitelistedCreators = [
        { username: "PrimapeMarkets", category: "News", points: 690, is_onboarded: true },
        { username: "AlexDotEth", category: "Spaces", points: 500, is_onboarded: true },
        { username: "apecoin", category: "News", points: 250, is_onboarded: true }
      ];
    }

    // Map creators to the format expected by the frontend with placeholder data
    const creatorsWithPlaceholders = whitelistedCreators.map(creator => ({
      id: creator.username,
      handle: `@${creator.username}`,
      name: `${creator.username} | ApeChain Creator`, // Default name, will be replaced if profile exists
      points: creator.points || 200,
      category: creator.category || "Creator",
      engagementTypes: ['listen', 'share', 'comment'],
      twitterId: '',
      description: 'Profile data will be loaded soon. Check back later for full details!',
      avatar: '/images/pm.PNG',
      claimed: false
    }));

    // Get all the usernames as an array for the database query
    const usernames = whitelistedCreators.map(creator => creator.username);

    // Fetch all Twitter profiles in a single query
    const twitterProfiles = await db.twitterProfile.findMany({
      where: {
        username: {
          in: usernames
        }
      }
    });

    console.log(`Found ${twitterProfiles.length} Twitter profiles for ${usernames.length} creators`);

    // Create a username-to-profile map for quick lookups
    const profileMap = {};
    twitterProfiles.forEach(profile => {
      profileMap[profile.username.toLowerCase()] = profile;
    });

    // Now enhance our creators with profile data where available
    const enhancedCreators = creatorsWithPlaceholders.map(creator => {
      const username = creator.handle.replace('@', '').toLowerCase();
      const profile = profileMap[username];

      if (profile) {
        console.log(`Found profile for ${username}: ${profile.name || 'No name'}`);
        return {
          ...creator,
          name: profile.name || creator.name,
          twitterId: profile.id || creator.twitterId,
          avatar: profile.profile_image_url || creator.avatar,
          description: profile.description || creator.description
        };
      } else {
        console.log(`No profile found for ${username}, using placeholder data`);
        return creator;
      }
    });

    return NextResponse.json(enhancedCreators);
  } catch (error) {
    console.error('Error in simple creators API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creators' },
      { status: 500 }
    );
  }
}