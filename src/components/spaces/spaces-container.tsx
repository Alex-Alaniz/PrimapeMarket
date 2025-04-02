
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpacesSchedule } from "@/components/spaces/spaces-schedule";

interface TwitterProfile {
  id: string;
  username: string;
  name: string | null;
  profile_image_url: string | null;
}

interface Space {
  id: string;
  title: string;
  description: string | null;
  day_of_week: string;
  start_time: string;
  end_time: string | null;
  hosts: TwitterProfile[];
  points: number;
  display_time: string;
  formatted_start_time: string;
  formatted_end_time: string;
}

interface SpacesContainerProps {
  spacesData: Record<string, Space[]>;
  isLoading: boolean;
}

export function SpacesContainer({ spacesData, isLoading }: SpacesContainerProps) {
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Get current day of week to set as default tab
  const getCurrentDayTab = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];
    return weekDays.includes(today) ? today.toLowerCase() : 'monday';
  };

  // State to track filter by host
  const [hostFilter, setHostFilter] = useState<string | null>(null);
  
  // Get all unique hosts across all spaces
  const allHosts = Object.values(spacesData)
    .flat()
    .flatMap(space => space.hosts)
    .filter((host, index, self) => 
      index === self.findIndex(h => h.username === host.username)
    )
    .sort((a, b) => a.username.localeCompare(b.username));

  // Filter spaces by selected host if one is selected
  const filteredSpacesData = hostFilter 
    ? Object.fromEntries(
        Object.entries(spacesData).map(([day, spaces]) => [
          day,
          spaces.filter(space => 
            space.hosts.some(host => host.username === hostFilter)
          )
        ])
      )
    : spacesData;

  // Count today's spaces
  const today = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
  const todaySpaces = spacesData[today] ? spacesData[today].length : 0;
  
  return (
    <div className="space-y-8">
      {!isLoading && todaySpaces > 0 && (
        <div className="bg-blue-900 text-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold">Today's Schedule</h2>
          <p className="mt-1">There {todaySpaces === 1 ? 'is' : 'are'} {todaySpaces} space{todaySpaces === 1 ? '' : 's'} scheduled for today!</p>
        </div>
      )}
      
      {!isLoading && allHosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Filter by Host</CardTitle>
            <CardDescription>
              Select a host to see their scheduled spaces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setHostFilter(null)}
                className={`px-3 py-1 rounded-full text-sm ${
                  hostFilter === null 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                All Hosts
              </button>
              {allHosts.map(host => (
                <button
                  key={host.id}
                  onClick={() => setHostFilter(host.username)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    hostFilter === host.username 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  @{host.username}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-card rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <Tabs defaultValue={getCurrentDayTab()}>
          <TabsList className="grid grid-cols-7 w-full">
            {weekDays.map((day) => (
              <TabsTrigger key={day} value={day.toLowerCase()}>
                {day.substring(0, 3)}
              </TabsTrigger>
            ))}
          </TabsList>

          {weekDays.map((day) => (
            <TabsContent key={day} value={day.toLowerCase()} className="mt-6">
              <SpacesSchedule 
                daySchedule={filteredSpacesData[day] || []}
                day={day} 
              />
              {filteredSpacesData[day]?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {hostFilter 
                      ? `No scheduled spaces for ${hostFilter} on ${day}.` 
                      : `No scheduled spaces for ${day}.`}
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
