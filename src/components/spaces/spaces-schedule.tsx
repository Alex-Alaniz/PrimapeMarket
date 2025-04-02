
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Twitter, Calendar, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useActiveAccount } from "thirdweb/react";
import { Badge } from "@/components/ui/badge";

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

interface SpacesScheduleProps {
  daySchedule: Space[];
  day: string;
}

export function SpacesSchedule({ daySchedule, day }: SpacesScheduleProps) {
  const { toast } = useToast();
  const activeAccount = useActiveAccount();
  const [expandedSpace, setExpandedSpace] = useState<string | null>(null);

  const toggleExpand = (spaceId: string) => {
    setExpandedSpace(expandedSpace === spaceId ? null : spaceId);
  };
  
  const handleRSVP = async (spaceId: string, title: string) => {
    if (!activeAccount) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to RSVP for spaces",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch('/api/spaces/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spaceId,
          walletAddress: activeAccount.address,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "RSVP Successful!",
          description: `You've been added to the guest list for "${title}"`,
        });
      } else {
        throw new Error(data.error || 'Failed to RSVP');
      }
    } catch (error) {
      console.error('RSVP error:', error);
      toast({
        title: "RSVP Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  };
  
  const isCurrentOrUpcoming = (space: Space) => {
    const now = new Date();
    const spaceTime = new Date();
    
    // Parse the formatted time (HH:MM)
    const [hours, minutes] = space.formatted_start_time.split(':').map(Number);
    spaceTime.setHours(hours, minutes, 0, 0);
    
    // If we're checking for today's spaces
    const today = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()];
    
    if (day === today) {
      // For today's spaces, highlight if they're upcoming or current
      return spaceTime >= now || 
             (space.formatted_end_time && now <= new Date(spaceTime.getTime() + 2 * 60 * 60 * 1000));
    }
    
    // For other days, all spaces are upcoming
    return true;
  };

  // Sort spaces by start time
  const sortedSchedule = [...daySchedule].sort((a, b) => {
    const timeA = a.formatted_start_time.split(':').map(Number);
    const timeB = b.formatted_start_time.split(':').map(Number);
    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
  });

  if (sortedSchedule.length === 0) {
    return null; // We'll handle empty state in the parent component
  }

  return (
    <div className="space-y-4">
      {sortedSchedule.map((space) => (
        <Card 
          key={space.id} 
          className={`overflow-hidden transition-all ${
            isCurrentOrUpcoming(space) ? 'border-primary/50 shadow-md' : ''
          }`}
        >
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {/* Time column */}
              <div className="bg-blue-900 text-white p-4 md:w-1/6 flex flex-col justify-center items-center">
                <div className="text-2xl font-bold">{space.formatted_start_time}</div>
                {space.formatted_end_time && (
                  <>
                    <div className="text-sm">to</div>
                    <div className="text-xl font-bold">{space.formatted_end_time}</div>
                  </>
                )}
                <div className="mt-2 bg-primary/20 text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                  {space.points} points
                </div>
              </div>
              
              {/* Content column */}
              <div className="p-4 md:p-6 flex-1">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">{space.title}</h3>
                      {isCurrentOrUpcoming(space) && day === ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()] && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500">
                          Today
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="text-sm font-semibold mb-2">Hosted by:</h4>
                      <div className="flex flex-wrap items-center gap-3">
                        {space.hosts.map((host) => (
                          <div key={host.id} className="flex items-center gap-2 bg-secondary/50 rounded-full pl-1 pr-3 py-1">
                            <div className="w-6 h-6 rounded-full overflow-hidden">
                              <Image 
                                src={host.profile_image_url || '/images/pm.PNG'} 
                                alt={host.name || host.username}
                                width={24}
                                height={24}
                                className="object-cover"
                              />
                            </div>
                            <span className="text-sm">@{host.username}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {expandedSpace === space.id && space.description && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold mb-1">Description:</h4>
                        <p className="text-muted-foreground">{space.description}</p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{day}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{space.display_time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col mt-4 md:mt-0 gap-2 md:items-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full md:w-auto"
                      onClick={() => handleRSVP(space.id, space.title)}
                    >
                      RSVP
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="w-full md:w-auto gap-1"
                    >
                      <Twitter className="h-4 w-4" />
                      <span>Join</span>
                    </Button>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleExpand(space.id)}
                      className="w-full md:w-auto mt-1"
                    >
                      {expandedSpace === space.id ? 'Show less' : 'Show more'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
