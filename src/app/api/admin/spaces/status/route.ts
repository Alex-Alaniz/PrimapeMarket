
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/twitter-prisma";

// Admin wallet addresses - keep this list secure and limited
const ADMIN_WALLETS = [
  "0xD1D1B36c40D522eb84D9a8f76A99f713A9BfA9C4",
  "0xE9e6a56Fe9b8C47dF185B25e3B07f7d08e1fBb77",
  "0xc88B5AaC42e0FD868cBCE2D0C5A8aA30a91FB9EA",
  "0xC17A09F8599B53d55Fa6426f38B6F6F7C4d95A10"
];

export async function GET(req: NextRequest) {
  try {
    // Get the wallet address from URL params
    const walletAddress = req.nextUrl.searchParams.get('walletAddress');
    
    // Validate admin wallet
    if (!walletAddress || !ADMIN_WALLETS.includes(walletAddress)) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    // Basic stats
    const totalSpaces = await db.twitterSpace.count();
    const upcomingSpaces = await db.twitterSpace.count({
      where: {
        end_time: null
      }
    });
    const completedSpaces = await db.twitterSpace.count({
      where: {
        end_time: {
          not: null
        }
      }
    });
    const cancelledSpaces = 0; // Adjust as needed based on schema
    
    // Get spaces by day of week
    const spacesByDay = await Promise.all(
      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(async (day) => {
        const count = await db.twitterSpace.count({
          where: {
            day_of_week: day
          }
        });
        return { day, count };
      })
    );
    
    // Get top hosts
    const topHosts = await db.twitterSpace.groupBy({
      by: ['host_username'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });
    
    // Get host details
    const hostUsernames = topHosts.map(host => host.host_username);
    const hostProfiles = await db.twitterProfile.findMany({
      where: {
        username: {
          in: hostUsernames
        }
      }
    });
    
    // Create a map for quick lookup
    const profileMap = hostProfiles.reduce((map, profile) => {
      map[profile.username] = profile;
      return map;
    }, {} as Record<string, any>);
    
    // Format top hosts with profile data
    const formattedTopHosts = topHosts.map(host => ({
      username: host.host_username,
      count: host._count.id,
      profile: profileMap[host.host_username] || null
    }));
    
    // RSVPs stats
    const totalRSVPs = await db.twitterSpaceRSVP.count();
    
    return NextResponse.json({
      success: true,
      stats: {
        total: totalSpaces,
        upcoming: upcomingSpaces,
        completed: completedSpaces,
        cancelled: cancelledSpaces,
        byDay: spacesByDay,
        topHosts: formattedTopHosts,
        rsvps: totalRSVPs
      }
    });
  } catch (error) {
    console.error('Error in spaces status API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
