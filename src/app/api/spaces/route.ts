import { NextResponse } from "next/server";
import { twitterDb } from "@/lib/twitter-prisma";

// Days of week in order for sorting
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Mock data for testing when no spaces are available
const MOCK_SPACES = [
  {
    id: 'mock-1',
    title: 'ApeChain Weekly Update',
    description: 'Join us for the latest updates on ApeChain',
    day_of_week: 'Monday',
    start_time: new Date().setHours(14, 0, 0, 0),
    end_time: new Date().setHours(15, 0, 0, 0),
    hosts: [
      {
        id: 'mock-host-1',
        username: 'ApeChainDev',
        name: 'ApeChain Dev',
        profile_image_url: '/images/pm.PNG',
      }
    ],
    recurring: true,
    points: 120
  },
  {
    id: 'mock-2',
    title: 'Web3 Social Media Future',
    description: 'Discussion on the future of social media in Web3',
    day_of_week: 'Wednesday',
    start_time: new Date().setHours(18, 30, 0, 0),
    end_time: new Date().setHours(19, 30, 0, 0),
    hosts: [
      {
        id: 'mock-host-2',
        username: 'BlueEyeQueen',
        name: 'Blue Eye Queen',
        profile_image_url: '/images/pm.PNG',
      }
    ],
    recurring: true,
    points: 150
  },
  {
    id: 'mock-3',
    title: 'Crypto Market Analysis',
    description: 'Analysis of the current crypto market trends',
    day_of_week: 'Friday',
    start_time: new Date().setHours(17, 0, 0, 0),
    end_time: new Date().setHours(18, 0, 0, 0),
    hosts: [
      {
        id: 'mock-host-3',
        username: 'RedGoatQueen',
        name: 'Red Goat Queen',
        profile_image_url: '/images/pm.PNG',
      }
    ],
    recurring: true,
    points: 130
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const useMock = searchParams.get('mock') === 'true';
    const hostFilter = searchParams.get('host');

    // Fetch all spaces from database
    let spaces = await twitterDb.twitterSpace.findMany({
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

    // If no spaces found and mock parameter is true, use mock data
    if (spaces.length === 0 && useMock) {
      spaces = MOCK_SPACES as any;
      console.log('Using mock data for spaces');
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