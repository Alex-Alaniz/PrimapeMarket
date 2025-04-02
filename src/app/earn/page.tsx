'use client';

import { useState, useEffect } from 'react';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveAccount } from "thirdweb/react";
import { CreatorCard } from "@/components/earn/creator-card";
import type { EngagementType } from '@/types/engagement-types';
import { EngagementHistory } from "@/components/earn/engagement-history";
import { RewardTier } from "@/components/earn/reward-tier";
import { useToast } from "@/components/ui/use-toast";

export default function EarnPage() {
  const { toast } = useToast();
  const activeAccount = useActiveAccount();
  const [creators, setCreators] = useState<{
    id: string;
    name: string;
    handle: string;
    avatar: string;
    description: string;
    category: string;
    points: number;
    engagementTypes: string[];
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        // Fetch from the API which now includes Twitter profile data
        const response = await fetch('/api/creators');
        const data = await response.json();

        // Transform Twitter handles to include @ if not present
        const enhancedData = data.map((creator: {
          id: string;
          name: string;
          handle: string;
          avatar: string;
          description: string;
          category: string;
          points: number;
          engagementTypes: string[];
        }) => ({
          ...creator,
          handle: creator.handle.startsWith('@') ? creator.handle : `@${creator.handle}`,
        }));

        setCreators(enhancedData);
      } catch (error) {
        console.error("Failed to fetch creators:", error);
        // No fallback data needed - API is working correctly
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreators();
  }, []);

  const handleEngagement = async (creatorId: string, engagementType: string) => {
    if (!activeAccount) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet to engage with creators",
        variant: "destructive"
      });
      return;
    }

    try {
      // In production, this would call your API
      const response = await fetch('/api/engage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorId,
          engagementType,
          walletAddress: activeAccount.address,
          timestamp: new Date().toISOString(),
          // Include Twitter auth token if you have it
          // twitterAuthToken: localStorage.getItem('twitter_auth_token')
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Engagement Recorded!",
          description: `You earned ${data.pointsEarned} points for ${engagementType}`,
        });
      } else {
        throw new Error(data.message || "Failed to record engagement");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to record engagement";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container py-4">
        <Navbar />

        <div className="mt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-3xl font-bold">Earn with Primape</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Engage with top ApeChain creators and earn points redeemable for $APE tokens, 
                exclusive NFTs, and platform features.
              </p>
            </div>

            <div className="bg-card p-4 rounded-lg w-full lg:w-auto">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"/><path d="M9.4 15h5.2c.5 0 .8-.4.8-.8v-4.4c0-.5-.4-.8-.8-.8H9.4c-.5 0-.8.4-.8.8v4.4c0 .4.3.8.8.8Z"/></svg>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Your Points</div>
                  <div className="text-2xl font-bold">{activeAccount ? "5,230" : "Connect Wallet"}</div>
                </div>
              </div>

              {activeAccount && (
                <Button variant="outline" className="w-full mt-4" size="sm">
                  Redeem Points
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="all" className="mt-8">
            <TabsList className="grid grid-cols-4 lg:w-[400px]">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="spaces">Spaces</TabsTrigger>
              <TabsTrigger value="podcast">Podcasts</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bg-card h-[200px] animate-pulse rounded-xl"></div>
                  ))
                ) : (
                  creators.map(creator => (
                    <CreatorCard 
                      key={creator.id} 
                      creator={{
                        ...creator,
                        engagementTypes: creator.engagementTypes as EngagementType[]
                      }} 
                      onEngage={handleEngagement}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            {/* Other tabs content would filter by category */}
            <TabsContent value="spaces" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creators.filter(c => c.category === 'Spaces').map(creator => (
                  <CreatorCard 
                    key={creator.id} 
                    creator={{
                      ...creator,
                      engagementTypes: creator.engagementTypes as EngagementType[]
                    }} 
                    onEngage={handleEngagement}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Similar implementation for other tabs */}
          </Tabs>

          {activeAccount && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Your Engagement History</h2>
              <EngagementHistory walletAddress={activeAccount.address} />
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Reward Tiers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <RewardTier 
                title="Bronze" 
                pointsRequired={1000}
                benefits={[
                  "Basic prediction fee discounts",
                  "Bronze badge on profile",
                  "Access to monthly rewards"
                ]}
              />
              <RewardTier 
                title="Silver" 
                pointsRequired={5000}
                benefits={[
                  "Increased fee discounts",
                  "Silver badge on profile",
                  "Weekly $APE rewards",
                  "Early access to new features"
                ]}
              />
              <RewardTier 
                title="Gold" 
                pointsRequired={15000}
                benefits={[
                  "Maximum fee discounts",
                  "Gold badge on profile",
                  "Daily $APE rewards",
                  "Exclusive NFT airdrops",
                  "Priority access to creator events"
                ]}
              />
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