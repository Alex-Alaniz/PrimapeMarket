
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Twitter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useActiveAccount } from "thirdweb/react";

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
    
    // In a real implementation, this would call your API
    toast({
      title: "RSVP Successful!",
      description: `You've been added to the guest list for "${title}"`,
    });
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

  if (daySchedule.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No scheduled spaces for {day}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {daySchedule.map((space) => (
        <Card 
          key={space.id} 
          className={`overflow-hidden transition-all ${
            isCurrentOrUpcoming(space) ? 'border-primary/50' : ''
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
              </div>
              
              {/* Content column */}
              <div className="p-4 md:p-6 flex-1">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{space.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {space.hosts.map((host) => (
                        <div key={host.id} className="flex items-center gap-2">
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
                    
                    {expandedSpace === space.id && space.description && (
                      <p className="mt-3 text-muted-foreground">{space.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3 md:mt-0">
                    <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                      {space.points} points
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="hidden md:flex"
                      onClick={() => handleRSVP(space.id, space.title)}
                    >
                      RSVP
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="gap-1 hidden md:flex"
                    >
                      <Twitter className="h-4 w-4" />
                      <span>Join</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleExpand(space.id)}
                  >
                    {expandedSpace === space.id ? 'Show less' : 'Show more'}
                  </Button>
                  
                  <div className="flex gap-2 md:hidden">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRSVP(space.id, space.title)}
                    >
                      RSVP
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="gap-1"
                    >
                      <Twitter className="h-4 w-4" />
                      <span>Join</span>
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
