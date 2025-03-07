
'use client'

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActiveAccount } from 'thirdweb/react';
import { Leaderboard } from '@/components/leaderboard';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('szn1');
  const account = useActiveAccount();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container py-4">
        <Navbar />
        
        <div className="mt-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground mb-6">Earn $APE by winning predictions in markets.</p>
          
          <div className="rounded-lg border shadow-sm overflow-hidden">
            <Tabs defaultValue="szn1" className="w-full" onValueChange={setActiveTab}>
              <div className="flex items-center justify-between p-4 border-b">
                <TabsList>
                  <TabsTrigger value="szn1">SZN 1</TabsTrigger>
                  <TabsTrigger value="pre-szn">PRE-SZN</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="szn1" className="p-4">
                <Leaderboard season="szn1" activeUser={account?.address} />
              </TabsContent>
              
              <TabsContent value="pre-szn" className="p-4">
                <Leaderboard season="pre-szn" activeUser={account?.address} />
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
