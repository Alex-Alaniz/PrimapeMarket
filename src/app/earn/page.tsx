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
  const [refreshStatus, setRefreshStatus] = useState<{
    refreshInProgress: boolean;
    nextRefresh: string | null;
  } | null>(null);

  // Track last fetch time in session storage to avoid repeated fetches
  const [_lastFetchTime, setLastFetchTime] = useState<string | null>(null);

  // Check refresh status periodically
  useEffect(() => {
    const checkRefreshStatus = async () => {
      try {
        const response = await fetch('/api/admin/creators/refresh');
        if (response.ok) {
          const data = await response.json();
          setRefreshStatus(data);
        }
      } catch (error) {
        console.error("Failed to check refresh status:", error);
      }
    };

    // Check immediately and then every minute
    checkRefreshStatus();
    const interval = setInterval(checkRefreshStatus, 60000);

    return () => clearInterval(interval);
  }, []);
  
  // Fallback creators data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _fallbackCreators = [
    {
      id: "AlexDotEth",
      handle: "@AlexDotEth",
      name: "Alex",
      points: 500,
      category: "Spaces",
      engagementTypes: ["listen", "share", "comment"],
      twitterId: "",
      description: "ApeChain Developer",
      avatar: "/images/pm.PNG",
      claimed: false
    },
    {
      id: "apecoin",
      handle: "@apecoin",
      name: "ApeCoin",
      points: 250,
      category: "News",
      engagementTypes: ["listen", "share", "comment"],
      twitterId: "",
      description: "An awesome ApeChain creator building the future of Web3 social engagement.",
      avatar: "/images/pm.PNG",
      claimed: false
    },
    {
      id: "ApeChainHUB",
      handle: "@ApeChainHUB",
      name: "ApeChain HUB",
      points: 250,
      category: "News",
      engagementTypes: ["listen", "share", "comment"],
      twitterId: "",
      description: "An awesome ApeChain creator building the future of Web3 social engagement.",
      avatar: "/images/pm.PNG",
      claimed: false
    },
    {
      id: "ApewhaleNFT",
      handle: "@ApewhaleNFT",
      name: "ApeWhale",
      points: 250,
      category: "Spaces",
      engagementTypes: ["listen", "share", "comment"],
      twitterId: "",
      description: "An awesome ApeChain creator building the future of Web3 social engagement.",
      avatar: "/images/pm.PNG",
      claimed: false
    },
    {
      id: "boringmerch",
      handle: "@boringmerch",
      name: "Boring Merch",
      points: 250,
      category: "News",
      engagementTypes: ["listen", "share", "comment"],
      twitterId: "",
      description: "An awesome ApeChain creator building the future of Web3 social engagement.",
      avatar: "/images/pm.PNG",
      claimed: false
    },
    {
      id: "BoredApeYC",
      handle: "@BoredApeYC",
      name: "Bored Ape Yacht Club",
      points: 250,
      category: "News",
      engagementTypes: ["listen", "share", "comment"],
      twitterId: "",
      description: "An awesome ApeChain creator building the future of Web3 social engagement.",
      avatar: "/images/pm.PNG",
      claimed: false
    },
    {
      id: "yugalabs",
      handle: "@yugalabs",
      name: "Yuga Labs",
      points: 250,
      category: "News",
      engagementTypes: ["listen", "share", "comment"],
      twitterId: "",
      description: "An awesome ApeChain creator building the future of Web3 social engagement.",
      avatar: "/images/pm.PNG",
      claimed: false
    }
  ];

  useEffect(() => {
    // Immediately set fallback creators to ensure something always displays
    // Production fallback data in case API completely fails
    const fallbackCreators = [
      {
        id: "PrimapeMarkets",
        handle: "@PrimapeMarkets",
        name: "PRIMAPE",
        points: 690,
        category: "News",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "1788583582811766785",
        description: "The premier prediction market platform on ApeChain",
        avatar: "/images/pm.PNG",
        claimed: false
      },
      {
        id: "AlexDotEth",
        handle: "@AlexDotEth",
        name: "Alex",
        points: 500,
        category: "Spaces",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "",
        description: "ApeChain Developer",
        avatar: "/images/pm.PNG",
        claimed: false
      },
      {
        id: "apecoin",
        handle: "@apecoin",
        name: "ApeCoin",
        points: 250,
        category: "News",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "",
        description: "An awesome ApeChain creator building the future of Web3 social engagement.",
        avatar: "/images/pm.PNG",
        claimed: false
      },
      {
        id: "ApeChainHUB",
        handle: "@ApeChainHUB",
        name: "ApeChain HUB",
        points: 250,
        category: "News",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "",
        description: "An awesome ApeChain creator building the future of Web3 social engagement.",
        avatar: "/images/pm.PNG",
        claimed: false
      },
      {
        id: "ApewhaleNFT",
        handle: "@ApewhaleNFT",
        name: "ApeWhale",
        points: 250,
        category: "Spaces",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "",
        description: "An awesome ApeChain creator building the future of Web3 social engagement.",
        avatar: "/images/pm.PNG",
        claimed: false
      },
      {
        id: "boringmerch",
        handle: "@boringmerch",
        name: "Boring Merch",
        points: 250,
        category: "News",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "",
        description: "An awesome ApeChain creator building the future of Web3 social engagement.",
        avatar: "/images/pm.PNG",
        claimed: false
      },
      {
        id: "BoredApeYC",
        handle: "@BoredApeYC",
        name: "Bored Ape Yacht Club",
        points: 250,
        category: "News",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "",
        description: "An awesome ApeChain creator building the future of Web3 social engagement.",
        avatar: "/images/pm.PNG",
        claimed: false
      },
      {
        id: "yugalabs",
        handle: "@yugalabs",
        name: "Yuga Labs",
        points: 250,
        category: "News",
        engagementTypes: ["listen", "share", "comment"],
        twitterId: "",
        description: "An awesome ApeChain creator building the future of Web3 social engagement.",
        avatar: "/images/pm.PNG",
        claimed: false
      }
    ];
    
    // Start with fallback data immediately to ensure something always displays
    setCreators(fallbackCreators);
    
    const fetchCreators = async () => {
      try {
        setIsLoading(true);

        // Check if we have cached creators in localStorage and when they were last fetched
        const cachedCreators = localStorage.getItem('cached_creators');
        const savedLastFetchTime = sessionStorage.getItem('creators_last_fetch');
        setLastFetchTime(savedLastFetchTime);

        const now = new Date().toISOString();
        const cacheAge = savedLastFetchTime 
          ? (new Date(now).getTime() - new Date(savedLastFetchTime).getTime()) 
          : Infinity;

        // Use cache for UI immediately if available (regardless of age)
        if (cachedCreators) {
          console.log("Using cached creators data from localStorage");
          setCreators(JSON.parse(cachedCreators));
          setIsLoading(false);
        }

        // Only fetch from API if cache is older than 5 minutes or doesn't exist
        if (!cachedCreators || cacheAge > 5 * 60 * 1000) {
          console.log("Cache expired or not available, fetching fresh data");

          try {
            // Always use_cache=true to ensure we use DB cached profiles rather than Twitter API
            const response = await fetch('/api/creators?use_cache=true');
            
            if (!response.ok) {
              console.warn("Main API failed, trying simplified API");
              // Try the simplified API as fallback
              const fallbackResponse = await fetch('/api/creators/simple');
              
              if (!fallbackResponse.ok) {
                throw new Error(`API returned ${fallbackResponse.status}: ${fallbackResponse.statusText}`);
              }
              
              return await fallbackResponse.json();
            }
            
            return await response.json();
          } catch (error) {
            console.error("Both APIs failed:", error);
            throw error;
          }

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

          // Store in localStorage for future use
          localStorage.setItem('cached_creators', JSON.stringify(enhancedData));
          sessionStorage.setItem('creators_last_fetch', now);
          setLastFetchTime(now);

          // Only update state if we got valid data
          if (enhancedData.length > 0) {
            console.log("Updating UI with fresh data from API");
            setCreators(enhancedData);
          }

          // Log the fetched data
          console.log("Fetched creators data:", enhancedData);
        }
      } catch (error) {
        console.error("Failed to fetch creators:", error);

        // Try to use cached data if available and we haven't already set it
        if (creators.length === 0) {
          const cachedCreators = localStorage.getItem('cached_creators');
          if (cachedCreators) {
            console.log("Using fallback cached data after API error");
            setCreators(JSON.parse(cachedCreators));
          } else {
            // No cached data but we still need to show something in production
            console.log("Using hardcoded fallback creator data");
            setCreators(fallbackCreators);
            // Store fallback data in cache so it's available next time
            const currentTime = new Date().toISOString();
            localStorage.setItem('cached_creators', JSON.stringify(fallbackCreators));
            sessionStorage.setItem('creators_last_fetch', currentTime);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreators();
  }, [isLoading, creators.length]); // Include creators.length as dependency

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
              {refreshStatus?.nextRefresh && (
                <div className="text-xs text-muted-foreground mt-2">
                  Next creator data refresh: {new Date(refreshStatus.nextRefresh).toLocaleTimeString()}
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="ml-2 text-xs"
                    onClick={() => {
                      // Clear cache and reload data
                      localStorage.removeItem('cached_creators');
                      sessionStorage.removeItem('creators_last_fetch');
                      setIsLoading(true);

                      // Fetch creators function
                      const refreshCreators = async () => {
                        try {
                          const response = await fetch('/api/creators?use_cache=true&force_refresh=true');
                          if (!response.ok) {
                            throw new Error(`API returned ${response.status}`);
                          }

                          const data = await response.json();

                          // Transform Twitter handles to include @ if not present
                          const enhancedData = data.map((creator: any) => ({
                            ...creator,
                            handle: creator.handle.startsWith('@') ? creator.handle : `@${creator.handle}`,
                          }));

                          // Store in localStorage and update state
                          localStorage.setItem('cached_creators', JSON.stringify(enhancedData));
                          sessionStorage.setItem('creators_last_fetch', new Date().toISOString());
                          setCreators(enhancedData);

                          toast({
                            title: "Refresh Complete",
                            description: "Creator data has been refreshed."
                          });
                        } catch (error) {
                          console.error("Error refreshing data:", error);
                          toast({
                            title: "Refresh Failed",
                            description: "Could not refresh creator data. Please try again later.",
                            variant: "destructive"
                          });
                        } finally {
                          setIsLoading(false);
                        }
                      };

                      refreshCreators();
                    }}
                  >
                    Refresh Now
                  </Button>
                </div>
              )}
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
                  // Split creators into two groups: those with avatar (cached data) and those without
                  [...creators]
                    .sort((a, b) => {
                      // Define priority order with exact IDs
                      const priorityOrder = [
                        "PrimapeMarkets", // 1. Primape
                        "AlexDotEth",     // 2. Alex
                        "apecoin",        // 3. apecoin
                        "ApeChainHUB",    // 4. ApeChainHUB
                        "ApewhaleNFT",    // 5. ApewhaleNFT
                        "boringmerch",    // 6. boringmerch
                        "BoredApeYC",     // 7. BoredApeYC
                        "yugalabs"        // 8. yugalabs
                      ];

                      // Case insensitive ID match for more reliable sorting
                      const idA = a.id.toLowerCase();
                      const idB = b.id.toLowerCase();

                      // Handle IDs that match our priority list (case insensitive)
                      const priorityA = priorityOrder.findIndex(id => id.toLowerCase() === idA);
                      const priorityB = priorityOrder.findIndex(id => id.toLowerCase() === idB);

                      // If both are in priority list, sort by priority order
                      if (priorityA !== -1 && priorityB !== -1) {
                        return priorityA - priorityB;
                      }

                      // If only A is in priority list, A comes first
                      if (priorityA !== -1) return -1;

                      // If only B is in priority list, B comes first
                      if (priorityB !== -1) return 1;

                      // For remaining creators, prioritize those with complete profiles
                      // This ensures creators with proper avatars appear before placeholder ones
                      const hasAvatarA = a.avatar && !a.avatar.includes('/images/pm.PNG');
                      const hasAvatarB = b.avatar && !b.avatar.includes('/images/pm.PNG');

                      if (hasAvatarA && !hasAvatarB) return -1;
                      if (!hasAvatarA && hasAvatarB) return 1;

                      // As a final sort, use alphabetical order by name
                      return a.name.localeCompare(b.name);
                    })
                    .map(creator => (
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

            {/* Spaces tab with prioritized cached profiles */}
            <TabsContent value="spaces" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...creators]
                  .filter(c => c.category === 'Spaces')
                  .sort((a, b) => {
                    // Define priority order with exact IDs
                    const priorityOrder = [
                      "PrimapeMarkets", // 1. Primape
                      "AlexDotEth",     // 2. Alex
                      "apecoin",        // 3. apecoin
                      "ApeChainHUB",    // 4. ApeChainHUB
                      "ApewhaleNFT",    // 5. ApewhaleNFT
                      "boringmerch",    // 6. boringmerch
                      "BoredApeYC",     // 7. BoredApeYC
                      "yugalabs"        // 8. yugalabs
                    ];

                    // Case insensitive ID match for more reliable sorting
                    const idA = a.id.toLowerCase();
                    const idB = b.id.toLowerCase();

                    // Handle IDs that match our priority list (case insensitive)
                    const priorityA = priorityOrder.findIndex(id => id.toLowerCase() === idA);
                    const priorityB = priorityOrder.findIndex(id => id.toLowerCase() === idB);

                    // If both are in priority list, sort by priority order
                    if (priorityA !== -1 && priorityB !== -1) {
                      return priorityA - priorityB;
                    }

                    // If only A is in priority list, A comes first
                    if (priorityA !== -1) return -1;

                    // If only B is in priority list, B comes first
                    if (priorityB !== -1) return 1;

                    // For remaining creators, prioritize those with complete profiles
                    // This ensures creators with proper avatars appear before placeholder ones
                    const hasAvatarA = a.avatar && !a.avatar.includes('/images/pm.PNG');
                    const hasAvatarB = b.avatar && !b.avatar.includes('/images/pm.PNG');

                    if (hasAvatarA && !hasAvatarB) return -1;
                    if (!hasAvatarA && hasAvatarB) return 1;

                    // As a final sort, use alphabetical order by name
                    return a.name.localeCompare(b.name);
                  })
                  .map(creator => (
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

            {/* Podcast tab with prioritized cached profiles */}
            <TabsContent value="podcast" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...creators]
                  .filter(c => c.category === 'Podcast')
                  .sort((a, b) => {
                    // Define priority order with exact IDs
                    const priorityOrder = [
                      "PrimapeMarkets", // 1. Primape
                      "AlexDotEth",     // 2. Alex
                      "apecoin",        // 3. apecoin
                      "ApeChainHUB",    // 4. ApeChainHUB
                      "ApewhaleNFT",    // 5. ApewhaleNFT
                      "boringmerch",    // 6. boringmerch
                      "BoredApeYC",     // 7. BoredApeYC
                      "yugalabs"        // 8. yugalabs
                    ];

                    // Case insensitive ID match for more reliable sorting
                    const idA = a.id.toLowerCase();
                    const idB = b.id.toLowerCase();

                    // Handle IDs that match our priority list (case insensitive)
                    const priorityA = priorityOrder.findIndex(id => id.toLowerCase() === idA);
                    const priorityB = priorityOrder.findIndex(id => id.toLowerCase() === idB);

                    // If both are in priority list, sort by priority order
                    if (priorityA !== -1 && priorityB !== -1) {
                      return priorityA - priorityB;
                    }

                    // If only A is in priority list, A comes first
                    if (priorityA !== -1) return -1;

                    // If only B is in priority list, B comes first
                    if (priorityB !== -1) return 1;

                    // For remaining creators, prioritize those with complete profiles
                    // This ensures creators with proper avatars appear before placeholder ones
                    const hasAvatarA = a.avatar && !a.avatar.includes('/images/pm.PNG');
                    const hasAvatarB = b.avatar && !b.avatar.includes('/images/pm.PNG');

                    if (hasAvatarA && !hasAvatarB) return -1;
                    if (!hasAvatarA && hasAvatarB) return 1;

                    // As a final sort, use alphabetical order by name
                    return a.name.localeCompare(b.name);
                  })
                  .map(creator => (
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

            {/* News tab with prioritized cached profiles */}
            <TabsContent value="news" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...creators]
                  .filter(c => c.category === 'News')
                  .sort((a, b) => {
                    // Define priority order with exact IDs
                    const priorityOrder = [
                      "PrimapeMarkets", // 1. Primape
                      "AlexDotEth",     // 2. Alex
                      "apecoin",        // 3. apecoin
                      "ApeChainHUB",    // 4. ApeChainHUB
                      "ApewhaleNFT",    // 5. ApewhaleNFT
                      "boringmerch",    // 6. boringmerch
                      "BoredApeYC",     // 7. BoredApeYC
                      "yugalabs"        // 8. yugalabs
                    ];

                    // Case insensitive ID match for more reliable sorting
                    const idA = a.id.toLowerCase();
                    const idB = b.id.toLowerCase();

                    // Handle IDs that match our priority list (case insensitive)
                    const priorityA = priorityOrder.findIndex(id => id.toLowerCase() === idA);
                    const priorityB = priorityOrder.findIndex(id => id.toLowerCase() === idB);

                    // If both are in priority list, sort by priority order
                    if (priorityA !== -1 && priorityB !== -1) {
                      return priorityA - priorityB;
                    }

                    // If only A is in priority list, A comes first
                    if (priorityA !== -1) return -1;

                    // If only B is in priority list, B comes first
                    if (priorityB !== -1) return 1;

                    // For remaining creators, prioritize those with complete profiles
                    // This ensures creators with proper avatars appear before placeholder ones
                    const hasAvatarA = a.avatar && !a.avatar.includes('/images/pm.PNG');
                    const hasAvatarB = b.avatar && !b.avatar.includes('/images/pm.PNG');

                    if (hasAvatarA && !hasAvatarB) return -1;
                    if (!hasAvatarA && hasAvatarB) return 1;

                    // As a final sort, use alphabetical order by name
                    return a.name.localeCompare(b.name);
                  })
                  .map(creator => (
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