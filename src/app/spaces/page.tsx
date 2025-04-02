
'use client';

import { useState, useEffect } from 'react';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SpacesSchedule } from "@/components/spaces/spaces-schedule";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SpacesPage() {
  const { toast } = useToast();
  interface TwitterSpace {
    id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string | null;
    day_of_week: string;
    recurring: boolean;
    formatted_start_time: string;
    formatted_end_time: string;
    display_time: string;
    points: number;
    hosts: {
      id: string;
      username: string;
      name: string | null;
      profile_image_url: string | null;
    }[];
  }

  const [spacesData, setSpacesData] = useState<Record<string, TwitterSpace[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/spaces');
        const data = await response.json();
        
        if (response.ok) {
          setSpacesData(data);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch spaces schedule',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error fetching spaces:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpaces();
  }, [toast]);

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  // Get current day of week to set as default tab
  const getCurrentDayTab = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];
    return weekDays.includes(today) ? today.toLowerCase() : 'monday';
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container py-4">
        <Navbar />

        <div className="mt-8">
          <div className="flex flex-col justify-between items-start gap-6">
            <div>
              <h1 className="text-3xl font-bold">ApeChain Spaces Schedule</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Join our community spaces throughout the week and engage with top ApeChain creators.
                Earn points by participating and engaging with creators.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-card rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <Tabs defaultValue={getCurrentDayTab()} className="mt-8">
              <TabsList className="grid grid-cols-7 w-full">
                {weekDays.map((day) => (
                  <TabsTrigger key={day} value={day.toLowerCase()}>
                    {day}
                  </TabsTrigger>
                ))}
              </TabsList>

              {weekDays.map((day) => (
                <TabsContent key={day} value={day.toLowerCase()} className="mt-6">
                  <SpacesSchedule 
                    daySchedule={(spacesData[day] || []).map(space => ({
                      ...space,
                      description: space.description || null // Ensure description is never undefined
                    }))} 
                    day={day} 
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}

          <div className="mt-12 p-6 bg-blue-950 rounded-lg text-white">
            <h2 className="text-2xl font-bold mb-4">Streaming Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Blue Eye Queen</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Monday</span>
                    <span>7 pm</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Tuesday</span>
                    <span>9 am</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Wednesday</span>
                    <span>8 pm</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Thursday</span>
                    <span>6 pm</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Friday</span>
                    <span>10 am</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Red GoatQueen</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Wednesday</span>
                    <span>7 pm</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span>7 pm</span>
                  </li>
                </ul>
                <h3 className="text-xl font-semibold mt-4 mb-3">OVI LIVE</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Friday</span>
                    <span>11 am</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span>11 am</span>
                  </li>
                </ul>
                <h3 className="text-xl font-semibold mt-4 mb-3">Tater_Poutine.eth</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Thursday</span>
                    <span>9 pm</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
