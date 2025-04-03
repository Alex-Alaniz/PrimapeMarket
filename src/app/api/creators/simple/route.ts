
import { NextResponse } from 'next/server';
import { db } from '@/lib/twitter-prisma';

export async function GET() {
  try {
    console.log('Simple creators API called');
    
    // Get whitelisted creators from the database
    const whitelistedCreators = await db.twitterWhitelist.findMany();
    
    console.log(`Found ${whitelistedCreators.length} creators in whitelist`);
    
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
    
    // Sort creators in the specified order
    const creatorMap = {};
    whitelistedCreators.forEach(creator => {
      creatorMap[creator.username] = creator;
    });
    
    // First add creators in our specific order
    let sortedCreators = orderedCreators
      .filter(username => creatorMap[username])
      .map(username => creatorMap[username]);
    
    // Then add any remaining creators
    const remainingCreators = whitelistedCreators.filter(
      creator => !orderedCreators.includes(creator.username)
    );
    
    sortedCreators = [...sortedCreators, ...remainingCreators];
    console.log(`Sorted ${sortedCreators.length} creators in preferred order`);
    
    // Map to the format expected by the frontend
    const creators = sortedCreators.map(creator => ({
      id: creator.username,
      handle: `@${creator.username}`,
      name: `${creator.username} | ApeChain Creator`,
      points: creator.points || 200,
      category: creator.category || "Creator",
      engagementTypes: ['listen', 'share', 'comment'],
      twitterId: '',
      description: 'Profile data will be loaded soon. Check back later for full details!',
      avatar: '/images/pm.PNG',
      claimed: false
    }));
    
    // Fetch Twitter profile data to enhance creator info
    const twitterProfiles = await db.twitterProfile.findMany({
      where: {
        username: { 
          in: sortedCreators.map(creator => creator.username)
        }
      }
    });
    
    console.log(`Found ${twitterProfiles.length} Twitter profiles`);
    
    // Create a map for quick lookup
    const profileMap = {};
    twitterProfiles.forEach(profile => {
      profileMap[profile.username] = profile;
    });
    
    // Enhance creators with Twitter profile data when available
    const enhancedCreators = creators.map(creator => {
      const username = creator.handle.replace('@', '');
      const profile = profileMap[username];
      
      if (profile) {
        console.log(`Found profile for ${username}`);
        return {
          ...creator,
          name: profile.name || creator.name,
          twitterId: profile.id || '',
          avatar: profile.profile_image_url || creator.avatar,
          description: profile.description || creator.description
        };
      }
      
      return creator;
    });
    
    return NextResponse.json(enhancedCreators);
  } catch (error) {
    console.error('Error in simple creators API:', error);
    
    // Fallback creators if there's an error
    const fallbackCreators = [
      { 
        id: "PrimapeMarkets", 
        handle: "@PrimapeMarkets", 
        name: "PRIMAPE",
        points: 690, 
        category: "News", 
        engagementTypes: ["listen", "share", "comment"],
        avatar: '/images/pm.PNG',
        description: "The premier prediction markets platform in the Ape ecosystem."
      },
      { 
        id: "AlexDotEth", 
        handle: "@AlexDotEth", 
        name: "Alex | ApeChain",
        points: 500, 
        category: "Spaces", 
        engagementTypes: ["listen", "share", "comment"],
        avatar: '/images/pm.PNG',
        description: "Building ApeChain - The future of Web3 social engagement."
      },
      { 
        id: "apecoin", 
        handle: "@apecoin", 
        name: "ApeCoin",
        points: 250, 
        category: "News", 
        engagementTypes: ["listen", "share", "comment"],
        avatar: '/images/pm.PNG',
        description: "The official ApeCoin account."
      },
      { 
        id: "ApeChainHUB", 
        handle: "@ApeChainHUB", 
        name: "ApeChain HUB",
        points: 250, 
        category: "News", 
        engagementTypes: ["listen", "share", "comment"],
        avatar: '/images/pm.PNG',
        description: "Central hub for ApeChain news and updates."
      },
      { 
        id: "yugalabs", 
        handle: "@yugalabs", 
        name: "Yuga Labs",
        points: 250, 
        category: "News", 
        engagementTypes: ["listen", "share", "comment"],
        avatar: '/images/pm.PNG',
        description: "Creators of Bored Ape Yacht Club and other iconic NFT collections."
      }
    ];
    
    return NextResponse.json(fallbackCreators);
  }
}
