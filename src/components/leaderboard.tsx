
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveAccount } from "thirdweb/react";
import { useToast } from "./ui/use-toast";
import Image from "next/image";

export function Leaderboard() {
  const account = useActiveAccount();
  const { toast } = useToast();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch leaderboard data
  useEffect(() => {
    fetchLeaderboard();
  }, []);
  
  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/leaderboard?limit=20');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      
      const data = await response.json();
      setLeaderboard(data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading leaderboard...</p>
        ) : leaderboard.length === 0 ? (
          <p>No users on the leaderboard yet.</p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 text-sm font-medium text-gray-500 border-b pb-2">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">User</div>
              <div className="col-span-3 text-right">Win Rate</div>
              <div className="col-span-3 text-right">Winnings</div>
            </div>
            
            {leaderboard.map((user) => (
              <div 
                key={user.id} 
                className={`grid grid-cols-12 py-3 border-b last:border-0 ${
                  account && user.walletAddress === account.address ? 'bg-blue-50' : ''
                }`}
              >
                <div className="col-span-1 font-medium">#{user.rank}</div>
                <div className="col-span-5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden relative bg-gray-100">
                    {user.profileImage ? (
                      <Image 
                        src={user.profileImage} 
                        alt={user.username || 'User'} 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <span className="text-xs">User</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium truncate">{user.username || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500 truncate">{`${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}`}</p>
                  </div>
                </div>
                <div className="col-span-3 text-right self-center">
                  {user.winRate}%
                </div>
                <div className="col-span-3 text-right self-center font-medium">
                  {Number(user.totalWinnings).toFixed(4)} APE
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
