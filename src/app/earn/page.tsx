'use client';

import { useState, useEffect } from 'react';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveAccount } from "thirdweb/react";

export default function EarnPage() {
  const activeAccount = useActiveAccount();
  const [isLoading, setIsLoading] = useState(false);

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
              <p className="text-sm text-muted-foreground mt-2">
                <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">Coming Soon!</span> Our engage-to-earn program is under development. Check back soon!
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

          <Tabs defaultValue="info" className="mt-8">
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

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}