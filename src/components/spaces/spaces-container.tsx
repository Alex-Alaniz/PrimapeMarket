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
  const [activeTab, setActiveTab] = useState("Monday");
  const [selectedHost, setSelectedHost] = useState<string | null>(null);

  // Get all hosts from spaces data
  const allHosts = Object.values(spacesData || {})
    .flat()
    .reduce((hosts: TwitterProfile[], space) => {
      if (!space.hosts) return hosts;

      space.hosts.forEach(host => {
        if (host && host.username && !hosts.some(h => h?.username === host.username)) {
          hosts.push(host);
        }
      });
      return hosts;
    }, []);

  // Filter spaces by selected host
  const filteredSpaces = selectedHost
    ? Object.entries(spacesData || {}).reduce((filtered: Record<string, Space[]>, [day, spaces]) => {
        filtered[day] = spaces.filter(space => 
          space.hosts?.some(host => host?.username === selectedHost)
        );
        return filtered;
      }, {})
    : spacesData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <CardDescription>
          Join the conversation with ApeChain creators and community members
        </CardDescription>
      </CardHeader>
      <CardContent>
        {allHosts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Filter by host:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedHost(null)}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedHost === null
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                All Hosts
              </button>
              {allHosts.map((host) => (
                <button
                  key={host.id}
                  onClick={() => setSelectedHost(host.username)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedHost === host.username
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  @{host.username}
                </button>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="Monday" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-7">
            <TabsTrigger value="Monday">Mon</TabsTrigger>
            <TabsTrigger value="Tuesday">Tue</TabsTrigger>
            <TabsTrigger value="Wednesday">Wed</TabsTrigger>
            <TabsTrigger value="Thursday">Thu</TabsTrigger>
            <TabsTrigger value="Friday">Fri</TabsTrigger>
            <TabsTrigger value="Saturday">Sat</TabsTrigger>
            <TabsTrigger value="Sunday">Sun</TabsTrigger>
          </TabsList>

          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
            <TabsContent key={day} value={day}>
              <SpacesSchedule
                daySchedule={filteredSpaces?.[day] || []}
                day={day}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}