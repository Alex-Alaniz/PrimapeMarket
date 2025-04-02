
import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { /* ExternalLink, */ Twitter } from "lucide-react";
import type { EngagementType } from '@/types/engagement-types';

type Creator = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  description: string;
  category: string;
  points: number;
  engagementTypes: EngagementType[];
};

type OnEngageFunction = (creatorId: string, engagementType: string) => Promise<void>;

export function CreatorCard({ creator, onEngage }: { creator: Creator; onEngage: OnEngageFunction }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleEngagement = async (type: EngagementType) => {
    setIsLoading(true);
    try {
      await onEngage(creator.id, type);
    } finally {
      setIsLoading(false);
    }
  };

  const engagementButtons: Record<EngagementType, { label: string; icon: JSX.Element; tooltip: string }> = {
    listen: {
      label: "Listen",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-9.33-5"></path><path d="m6 12-3.47-3.47a6 6 0 0 1 0-8.46"></path><path d="M8 15a6 6 0 0 0 9.33 5"></path><path d="m18 12 3.47 3.47a6 6 0 0 1 0 8.46"></path></svg>,
      tooltip: "Listen to their latest Space and earn points"
    },
    read: {
      label: "Read",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>,
      tooltip: "Read their latest article and earn points"
    },
    question: {
      label: "Ask",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
      tooltip: "Ask a question during a Space and earn points"
    },
    comment: {
      label: "Comment",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
      tooltip: "Leave a thoughtful comment and earn points"
    },
    share: {
      label: "Share",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>,
      tooltip: "Share their content and earn points"
    },
    promote: {
      label: "Promote",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
      tooltip: "Promote their Space or Podcast and earn bonus points"
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative h-[100px] bg-gradient-to-r from-primary/20 to-primary/10">
          {/* Creator avatar */}
          <div className="absolute -bottom-10 left-4">
            <div className="relative w-20 h-20 rounded-full border-4 border-background overflow-hidden">
              <Image 
                src={creator.avatar || '/images/pm.PNG'} 
                alt={creator.name}
                fill
                className="object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.src = '/images/pm.PNG';
                }}
              />
            </div>
          </div>
          
          {/* Twitter icon */}
          <div className="absolute top-4 right-4">
            <a 
              href={`https://twitter.com/${creator.handle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1DA1F2]/90 text-white p-1.5 rounded-full hover:bg-[#1DA1F2] transition-colors"
            >
              <Twitter size={16} />
            </a>
          </div>
        </div>
        
        <div className="p-6 pt-12">
          <h3 className="font-bold text-lg">
            {creator.name || `${creator.handle.replace('@', '')} | ApeChain Creator`}
          </h3>
          <p className="text-sm text-muted-foreground">{creator.handle}</p>
          
          <p className="mt-2 text-sm">
            {creator.description || 'An awesome ApeChain creator building the future of Web3 social engagement. Check back soon for their full profile!'}
          </p>
          
          <div className="mt-4 flex items-center gap-2">
            <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
              {creator.category}
            </div>
            <div className="text-xs text-muted-foreground">
              {creator.points} points per engagement
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2 p-4 pt-2 border-t">
        <TooltipProvider>
          {creator.engagementTypes.map(type => (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleEngagement(type as EngagementType)}
                  disabled={isLoading}
                  className="gap-1.5"
                >
                  {engagementButtons[type as EngagementType].icon}
                  <span>{engagementButtons[type as EngagementType].label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{engagementButtons[type].tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}
