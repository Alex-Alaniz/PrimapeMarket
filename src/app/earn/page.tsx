
'use client';

import { useState, useEffect } from 'react';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveAccount } from "thirdweb/react";

export default function EarnPage() {
  const activeAccount = useActiveAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    // Function to fetch creators data
    const fetchCreators = async () => {
      try {
        setIsLoading(true);
        // Try to get from localStorage first for faster rendering
        const cachedData = localStorage.getItem('creatorsData');
        const cacheTimestamp = localStorage.getItem('creatorsTimestamp');
        const now = Date.now();
        const cacheExpired = !cacheTimestamp || (now - parseInt(cacheTimestamp)) > 300000; // 5 minutes
        
        if (cachedData && !cacheExpired) {
          const parsedData = JSON.parse(cachedData);
          if (parsedData && parsedData.length > 0) {
            console.log("Using cached creators data from localStorage");
            setCreators(parsedData);
            setIsLoading(false);
            // Refresh in the background
            fetchFreshData();
            return;
          }
        }
        
        console.log("Cache expired or not available, fetching fresh data");
        await fetchFreshData();
      } catch (error) {
        console.error("Error fetching creators:", error);
        // Try fallback data if everything else fails
        useFallbackData();
        setIsLoading(false);
      }
    };
    
    const fetchFreshData = async () => {
      try {
        // First try the regular endpoint
        const response = await fetch('/api/creators?use_cache=true');
        if (!response.ok) {
          throw new Error('Regular API failed');
        }
        const data = await response.json();
        console.log("Fetched creators data:", data);
        
        if (data && data.length > 0) {
          // Update state and save to cache
          setCreators(data);
          localStorage.setItem('creatorsData', JSON.stringify(data));
          localStorage.setItem('creatorsTimestamp', Date.now().toString());
          console.log("Updating UI with fresh data from API");
          setIsLoading(false);
          return;
        }
        throw new Error('Empty data from regular API');
      } catch (firstError) {
        console.error("Error with primary API, trying fallback:", firstError);
        
        // Try fallback endpoint if first one fails
        try {
          const fallbackResponse = await fetch('/api/creators/simple');
          if (!fallbackResponse.ok) {
            throw new Error('Fallback API also failed');
          }
          const fallbackData = await fallbackResponse.json();
          if (fallbackData && fallbackData.length > 0) {
            setCreators(fallbackData);
            localStorage.setItem('creatorsData', JSON.stringify(fallbackData));
            localStorage.setItem('creatorsTimestamp', Date.now().toString());
            setIsLoading(false);
            return;
          }
          throw new Error('Empty data from fallback API');
        } catch (fallbackError) {
          console.error("Both APIs failed:", fallbackError);
          // Use hardcoded creators if all API attempts fail
          useFallbackData();
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    // Hardcoded fallback data when all else fails
    const useFallbackData = () => {
      const fallbackCreators = [
        {
          id: "PrimapeMarkets",
          handle: "@PrimapeMarkets",
          name: "PRIMAPE",
          points: 690,
          category: "News",
          engagementTypes: ["listen", "share", "comment"],
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
          description: "An awesome ApeChain creator building the future of Web3 social engagement.",
          avatar: "/images/pm.PNG",
          claimed: false
        }
      ];
      
      console.log("Using hardcoded fallback creator data");
      setCreators(fallbackCreators);
    };

    fetchCreators();
  }, []);

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
                  <div className="text-2xl font-bold">{activeAccount ? "Coming Soon" : "Connect Wallet"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Creators Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Featured Creators</h2>
              <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-sm">Points Coming Soon!</span>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-32 bg-muted animate-pulse"></div>
                    <CardContent className="p-4">
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded mb-2"></div>
                      <div className="h-3 bg-muted animate-pulse rounded mb-4 w-1/2"></div>
                      <div className="h-10 bg-muted animate-pulse rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : creators.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p>No creators available at this time. Check back soon!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creators.map((creator) => (
                  <Card key={creator.id} className="overflow-hidden">
                    <div className="relative">
                      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                      <div className="absolute -bottom-10 left-4">
                        <div className="h-20 w-20 rounded-full border-4 border-background overflow-hidden">
                          <img 
                            src={creator.avatar || '/images/pm.PNG'} 
                            alt={creator.name} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    <CardContent className="pt-12 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold">{creator.name}</h3>
                          <p className="text-sm text-muted-foreground">{creator.handle}</p>
                        </div>
                        <div className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-medium">
                          {creator.category}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {creator.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          <span className="text-primary">{creator.points}</span> points
                        </div>
                        <a 
                          href={`https://twitter.com/${creator.handle.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          Follow on Twitter
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Program Info Tabs - Moved to the bottom */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Program Information</h2>
            <Tabs defaultValue="info" className="mt-4">
              <TabsList className="grid grid-cols-2 lg:w-[300px]">
                <TabsTrigger value="info">Program Info</TabsTrigger>
                <TabsTrigger value="rewards">Reward Tiers</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>How It Works</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>The Primape Earn program will reward users for engaging with content from top ApeChain creators.</p>
                      <ul className="mt-4 space-y-2">
                        <li className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          Listen to Twitter Spaces
                        </li>
                        <li className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          Comment on content
                        </li>
                        <li className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          Share creator content
                        </li>
                        <li className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          Promote your favorite creators
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Coming Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                          Creator profiles and verification
                        </li>
                        <li className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                          Engagement tracking and verification
                        </li>
                        <li className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                          Point redemption for $APE tokens
                        </li>
                        <li className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                          Exclusive NFT rewards
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="rewards" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Bronze Tier */}
                  <Card className="border-2 border-amber-700">
                    <CardHeader className="pb-2 bg-amber-700/10">
                      <CardTitle className="text-center text-lg">Bronze Tier</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="text-center mb-4">
                        <span className="text-3xl font-bold">1,000</span>
                        <span className="text-muted-foreground"> points</span>
                      </div>

                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="mr-2 mt-0.5 rounded-full p-1 bg-amber-700/20 text-amber-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                          <span className="text-sm">Basic prediction fee discounts</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-0.5 rounded-full p-1 bg-amber-700/20 text-amber-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                          <span className="text-sm">Bronze badge on profile</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-0.5 rounded-full p-1 bg-amber-700/20 text-amber-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                          <span className="text-sm">Access to monthly rewards</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Silver Tier */}
                  <Card className="border-2 border-gray-400">
                    <CardHeader className="pb-2 bg-gray-400/10">
                      <CardTitle className="text-center text-lg">Silver Tier</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="text-center mb-4">
                        <span className="text-3xl font-bold">5,000</span>
                        <span className="text-muted-foreground"> points</span>
                      </div>

                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="mr-2 mt-0.5 rounded-full p-1 bg-gray-400/20 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                          <span className="text-sm">Increased fee discounts</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-0.5 rounded-full p-1 bg-gray-400/20 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                          <span className="text-sm">Silver badge on profile</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-0.5 rounded-full p-1 bg-gray-400/20 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                          <span className="text-sm">Weekly $APE rewards</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-0.5 rounded-full p-1 bg-gray-400/20 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                          <span className="text-sm">Early access to new features</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Gold Tier */}
                  <Card className="border-2 border-yellow-500">
                    <CardHeader className="pb-2 bg-yellow-500/10">
                      <CardTitle className="text-center text-lg">Gold Tier</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="text-center mb-4">
                        <span className="text-3xl font-bold">15,000</span>
                        <span className="text-muted-foreground"> points</span>
                      </div>

                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <span className="mr-2 mt-0.5 rounded-full p-1 bg-yellow-500/20 text-yellow-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                          <span className="text-sm">Maximum fee discounts</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-0.5 rounded-full p-1 bg-yellow-500/20 text-yellow-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                          <span className="text-sm">Gold badge on profile</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-0.5 rounded-full p-1 bg-yellow-500/20 text-yellow-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                          <span className="text-sm">Daily $APE rewards</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-0.5 rounded-full p-1 bg-yellow-500/20 text-yellow-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                          <span className="text-sm">Exclusive NFT airdrops</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-0.5 rounded-full p-1 bg-yellow-500/20 text-yellow-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </span>
                          <span className="text-sm">Priority access to creator events</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
