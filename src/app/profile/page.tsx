
'use client'

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { UserProfileCard } from '@/components/user-profile-card';
import { UserActivityTable } from '@/components/user-activity-table';
import { UserStatsCard } from '@/components/user-stats-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { Search, TrendingUp, Clock, ChevronRight, Trophy } from 'lucide-react';
import { useUserBalance } from '@/hooks/useUserBalance';
import { contract } from '@/constants/contract';
import { Button } from '@/components/ui/button';
import { MarketCard } from '@/components/marketCard';

// Integrate the recharts package if necessary
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProfilePage() {
  const account = useActiveAccount();
  const [activeTab, setActiveTab] = useState('current');
  const userPerformance = useUserBalance();
  const [featuredMarketId, setFeaturedMarketId] = useState<number | null>(null);

  // Fetch the user's most recent/active market for featured section
  const { data: marketCount } = useReadContract({
    contract,
    method: "function marketCount() view returns (uint256)",
    params: []
  });

  useEffect(() => {
    if (!account || !marketCount) return;

    const findUserMarket = async () => {
      // Start from most recent market and work backward
      for (let i = Number(marketCount) - 1; i >= 0; i--) {
        try {
          const userShares = await contract.read.getUserShares([BigInt(i), account.address]);
          const hasShares = userShares.some(shares => shares > BigInt(0));
          
          if (hasShares) {
            setFeaturedMarketId(i);
            break;
          }
        } catch (error) {
          console.error(`Error checking user shares for market ${i}:`, error);
        }
      }
    };

    findUserMarket();
  }, [account, marketCount]);

  // Example data for portfolio growth chart
  // const portfolioData = [
  //   { date: 'Jan', value: 1000 },
  //   { date: 'Feb', value: 1200 },
  //   { date: 'Mar', value: 900 },
  //   { date: 'Apr', value: 1500 },
  //   { date: 'May', value: 2000 },
  //   { date: 'Jun', value: 1800 },
  // ];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container py-4">
        <Navbar />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">
          {/* Left Column - User Profile and Stats */}
          <div className="md:col-span-3 space-y-6">
            <UserProfileCard />
            
            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-between text-sm">
                  Create Prediction <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full justify-between text-sm">
                  Claim Rewards <Trophy className="h-4 w-4 text-yellow-500" />
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Activity and Statistics */}
          <div className="md:col-span-9 space-y-6">
            {/* Featured Market */}
            {featuredMarketId !== null && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Your Featured Prediction</h2>
                </div>
                <MarketCard 
                  index={featuredMarketId} 
                  filter="all" 
                  featured={true}
                />
              </div>
            )}
            
            {/* Performance Statistics */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Performance Statistics</h2>
              <UserStatsCard performance={userPerformance} />
            </div>
            
            {/* Portfolio Growth Chart */}
            {/* Uncomment if you want to add chart visualization */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Portfolio Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolioData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card> */}
            
            {/* Prediction Activity */}
            <div className="rounded-lg bg-card text-card-foreground shadow-sm">
              <Tabs defaultValue="current" className="w-full" onValueChange={setActiveTab}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b gap-3">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="current" className="text-xs sm:text-sm">Current</TabsTrigger>
                    <TabsTrigger value="past" className="text-xs sm:text-sm">Past</TabsTrigger>
                    <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
                  </TabsList>
                  
                  {activeTab !== 'history' && (
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search predictions..."
                        className="w-full sm:w-[250px] pl-8"
                      />
                    </div>
                  )}
                </div>
                
                <TabsContent value="current">
                  <UserActivityTable type="current" />
                </TabsContent>
                
                <TabsContent value="past">
                  <UserActivityTable type="past" />
                </TabsContent>
                
                <TabsContent value="history">
                  <UserActivityTable type="history" />
                </TabsContent>
              </Tabs>
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
