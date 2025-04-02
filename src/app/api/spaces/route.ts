import { NextResponse } from "next/server";
import { twitterDb } from "@/lib/twitter-prisma";

// Days of week in order for sorting
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Mock data is now used as fallback when database connection fails
const FALLBACK_SPACES = [
  {
    id: 'fallback-1',
    title: 'ApeChain Trenches',
    description: 'Join us for the latest updates on ApeChain',
    day_of_week: 'Monday',
    start_time: new Date().setHours(14, 0, 0, 0),
    end_time: new Date().setHours(15, 0, 0, 0),
    hosts: [
      {
        id: 'fallback-host-1',
        username: 'ApeChain',
        name: 'ApeChain',
        profile_image_url: '/images/pm.PNG',
      }
    ],
    recurring: true,
    points: 120
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const useFallback = searchParams.get('fallback') === 'true';
    const hostFilter = searchParams.get('host');

    // Fetch all spaces from database
    let spaces = [];

    try {
      spaces = await twitterDb.twitterSpace.findMany({
        where: hostFilter ? {
          hosts: {
            some: {
              username: hostFilter.replace('@', '')
            }
          }
        } : undefined,
        include: {
          hosts: {
            select: {
              id: true,
              username: true,
              name: true,
              profile_image_url: true,
            },
          },
        },
        orderBy: [
          { day_of_week: "asc" },
          { start_time: "asc" },
        ],
      });
    } catch (error) {
      console.error("Database error fetching spaces:", error);

      if (useFallback) {
        console.log('Using fallback data due to database error');
        spaces = FALLBACK_SPACES as any;
      }
    }

    // If no spaces found and fallback parameter is true, use fallback data
    if (spaces.length === 0 && useFallback) {
      spaces = FALLBACK_SPACES as any;
      console.log('Using fallback data - no spaces found');
    }

    // Format the spaces for the frontend
    const formattedSpaces = spaces.map(space => {
      // Format start time for display
      const startTime = new Date(space.start_time);
      const formattedStartTime = startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      // Format end time if it exists
      let formattedEndTime = '';
      let displayTime = formattedStartTime;

      if (space.end_time) {
        const endTime = new Date(space.end_time);
        formattedEndTime = endTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        displayTime = `${formattedStartTime} - ${formattedEndTime}`;
      }

      return {
        ...space,
        formatted_start_time: formattedStartTime,
        formatted_end_time: formattedEndTime,
        display_time: displayTime
      };
    });

    // Group spaces by day of the week
    const spacesByDay = DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = formattedSpaces.filter(space => space.day_of_week === day);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json(spacesByDay);
  } catch (error) {
    console.error("Error fetching Twitter spaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch Twitter spaces" },
      { status: 500 },
    );
  }
}