
import { NextResponse } from "next/server";
import { db } from "@/lib/twitter-prisma";
import { format } from 'date-fns';

// Days of week in order for sorting
const DAYS_ORDER = {
  'Monday': 0,
  'Tuesday': 1,
  'Wednesday': 2,
  'Thursday': 3,
  'Friday': 4,
  'Saturday': 5,
  'Sunday': 6
};

export async function GET() {
  try {
    // Get all upcoming spaces
    const spaces = await db.twitterSpace.findMany({
      orderBy: [
        { day_of_week: 'asc' },
        { start_time: 'asc' }
      ],
      include: {
        hosts: true
      }
    });
    
    // Group by day of week
    const now = new Date();
    const currentDay = format(now, 'EEEE'); // Gets the full name of the day (Monday, Tuesday, etc.)
    
    // Format spaces for display and sort by day of week starting with current day
    const formattedSpaces = spaces.map(space => {
      // Handle null or undefined start_time
      const startDate = space.start_time || new Date();
      const startTime = format(startDate, 'HH:mm');
      const endTime = space.end_time ? format(space.end_time, 'HH:mm') : 
                    format(new Date(startDate.getTime() + 60 * 60 * 1000), 'HH:mm'); // Default 1hr
      
      // Format the time as 12-hour with AM/PM
      const formattedStartTime = format(startDate, 'h:mm a');
      
      // Safely access host information
      const primaryHost = space.hosts && space.hosts.length > 0 ? space.hosts[0] : null;
      const hostUsername = primaryHost?.username || '';
      const hostName = primaryHost?.name || hostUsername;
      const hostProfileImage = primaryHost?.profile_image_url || '';
      
      return {
        id: space.id,
        title: space.title,
        description: space.description || '',
        host: {
          username: hostUsername,
          name: hostName,
          profileImageUrl: hostProfileImage
        },
        dayOfWeek: space.day_of_week,
        startTime,
        endTime,
        formattedStartTime,
        durationMinutes: space.duration_minutes || 60,
        spaceUrl: space.space_url,
        rsvpCount: 0 // Placeholder, will be filled in later
      };
    });
    
    // Sort spaces by day of week starting with current day
    formattedSpaces.sort((a, b) => {
      const aDayOrder = DAYS_ORDER[a.dayOfWeek];
      const bDayOrder = DAYS_ORDER[b.dayOfWeek];
      const currentDayOrder = DAYS_ORDER[currentDay];
      
      // Calculate distance from current day (0 to 6)
      const aDist = (aDayOrder - currentDayOrder + 7) % 7;
      const bDist = (bDayOrder - currentDayOrder + 7) % 7;
      
      if (aDist !== bDist) {
        return aDist - bDist;
      }
      
      // If same day, sort by time
      return a.startTime.localeCompare(b.startTime);
    });
    
    // Get RSVP counts for each space
    const rsvpCounts = await Promise.all(
      formattedSpaces.map(async (space) => {
        try {
          const count = await db.twitterSpaceRSVP.count({
            where: {
              space_id: space.id
            }
          });
          return { id: space.id, count };
        } catch (error) {
          console.error(`Error getting RSVP count for space ${space.id}:`, error);
          return { id: space.id, count: 0 };
        }
      })
    );
    
    // Add RSVP counts to formatted spaces
    const spacesWithRSVP = formattedSpaces.map(space => {
      const rsvpData = rsvpCounts.find(rsvp => rsvp.id === space.id);
      return {
        ...space,
        rsvpCount: rsvpData?.count || 0
      };
    });
    
    // Group by day of week
    const spacesByDay = spacesWithRSVP.reduce<Record<string, any[]>>((acc, space) => {
      const day = space.dayOfWeek || 'Unknown';
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(space);
      return acc;
    }, {} as Record<string, any[]>);
    
    return NextResponse.json({
      success: true,
      spaces: spacesWithRSVP,
      spacesByDay
    });
  } catch (error) {
    console.error('Error in spaces API route:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
