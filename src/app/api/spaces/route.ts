
import { NextResponse } from "next/server";
import { twitterDb } from "@/lib/twitter-prisma";

// Helper function to sort days of the week
function getDayIndex(day: string): number {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days.indexOf(day);
}

export async function GET() {
  try {
    // Get all spaces with host information
    const spaces = await twitterDb.twitterSpace.findMany({
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
    });

    // Group spaces by day of week
    const spacesByDay = spaces.reduce((acc, space) => {
      if (!acc[space.day_of_week]) {
        acc[space.day_of_week] = [];
      }
      
      // Format start and end times for display
      const startTime = new Date(space.start_time);
      const startHour = startTime.getHours();
      const startMinute = startTime.getMinutes();
      
      const formattedStartTime = `${startHour}:${startMinute.toString().padStart(2, '0')}`;
      
      let formattedEndTime = '';
      if (space.end_time) {
        const endTime = new Date(space.end_time);
        const endHour = endTime.getHours();
        const endMinute = endTime.getMinutes();
        formattedEndTime = `${endHour}:${endMinute.toString().padStart(2, '0')}`;
      }
      
      // Add time display to space object
      const enhancedSpace = {
        ...space,
        formatted_start_time: formattedStartTime,
        formatted_end_time: formattedEndTime,
        display_time: formattedEndTime 
          ? `${formattedStartTime} - ${formattedEndTime}`
          : formattedStartTime,
      };
      
      acc[space.day_of_week].push(enhancedSpace);
      return acc;
    }, {} as Record<string, any[]>);

    // Sort spaces within each day by start time
    Object.keys(spacesByDay).forEach(day => {
      spacesByDay[day].sort((a, b) => {
        const aTime = new Date(a.start_time);
        const bTime = new Date(b.start_time);
        return aTime.getTime() - bTime.getTime();
      });
    });

    // Order days of the week
    const orderedDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const orderedSpacesByDay = orderedDays
      .filter(day => spacesByDay[day])
      .reduce((acc, day) => {
        acc[day] = spacesByDay[day];
        return acc;
      }, {} as Record<string, any[]>);

    return NextResponse.json(orderedSpacesByDay);
  } catch (error) {
    console.error("Error fetching spaces schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch Twitter spaces schedule" },
      { status: 500 },
    );
  }
}
