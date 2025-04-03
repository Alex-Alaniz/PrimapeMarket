import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CalendarIcon, MessageSquare, Share2 } from "lucide-react";

type Creator = {
  id: string;
  handle: string;
  name: string;
  points: number;
  category: string;
  description: string;
  avatar: string;
  engagementTypes: string[];
};

export function CreatorCard({ creator }: { creator: Creator }) {
  // Function to get a background image based on creator ID
  const getBgImage = (id: string) => {
    // Use creator ID to select one of the 4 background images consistently
    const bgImages = ['cheetah.png', 'dmt.png', 'trippy.png', 'zombie.png'];
    
    // Use the sum of character codes to create a deterministic selection
    const charSum = id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return bgImages[charSum % bgImages.length];
  };

  // Format handle for display and links
  const cleanHandle = creator.handle.replace("@", "");

  // Ensure we have proper display values even if API data is incomplete
  const displayName =
    creator.name && creator.name.trim() !== ""
      ? creator.name
      : `${cleanHandle} | ApeChain Creator`;

  const displayAvatar =
    creator.avatar && creator.avatar !== "" ? creator.avatar : "/images/pm.PNG";

  const displayDescription =
    creator.description && creator.description.trim() !== ""
      ? creator.description
      : "Profile data will be loaded soon. Check back later for full details!";

  return (
    <Card className="overflow-hidden bg-card border-0 shadow-md">
      <div className="relative">
        <div 
          className="h-32 bg-cover bg-center" 
          style={{ 
            backgroundImage: `url('/apechain/${getBgImage(creator.id)}')`,
            backgroundSize: 'cover'
          }}
        ></div>
        <div className="absolute -bottom-7 left-4">
          <div className="h-20 w-20 rounded-full border-4 border-background overflow-hidden">
            <img
              src={displayAvatar}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      <CardContent className="pt-16 p-4">
        <div className="flex justify-between items-start mb-4 mt-8">
          <div className="max-w-[70%]">
            <h3 className="font-bold truncate">{displayName}</h3>
            <p className="text-sm text-muted-foreground">@{cleanHandle}</p>
          </div>
          <div className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-medium">
            {creator.category}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 min-h-[3.6rem]">
          {displayDescription}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium">
            <span className="text-primary">{creator.points}</span> points
          </div>
          <a
            href={`https://twitter.com/${cleanHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline"
          >
            Follow on Twitter
          </a>
        </div>

        <div className="flex gap-2 w-full justify-between mt-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="hidden md:inline">Listen</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Listen to Twitter Spaces</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden md:inline">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share creator content</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden md:inline">Comment</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Comment on tweets</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
