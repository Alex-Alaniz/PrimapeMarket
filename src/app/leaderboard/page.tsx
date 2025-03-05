
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LeaderboardEntry {
  primary_wallet: string;
  display_name: string;
  total_invested: number;
  total_claimed: number;
  total_participated: number;
  total_won: number;
  total_lost: number;
  pnl: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        if (Array.isArray(data)) {
          setLeaderboard(data);
        } else {
          console.error("Leaderboard data is not an array:", data);
          setLeaderboard([]);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Primape Markets Leaderboard</h1>
      
      {loading ? (
        <div className="text-center py-8">Loading leaderboard data...</div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8">No leaderboard data available yet.</div>
      ) : (
        <div className="grid gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Top Traders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Rank</th>
                      <th className="text-left py-3 px-2">Trader</th>
                      <th className="text-right py-3 px-2">PnL</th>
                      <th className="text-right py-3 px-2">Markets</th>
                      <th className="text-right py-3 px-2">Win/Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => (
                      <tr key={entry.primary_wallet} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 font-medium">{index + 1}</td>
                        <td className="py-3 px-2">
                          <div className="font-medium">{entry.display_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {entry.primary_wallet.substring(0, 6)}...{entry.primary_wallet.substring(38)}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right font-medium">
                          <span className={entry.pnl >= 0 ? "text-green-500" : "text-red-500"}>
                            {entry.pnl >= 0 ? "+" : ""}{(entry.pnl / 1e18).toFixed(4)} APE
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">{entry.total_participated}</td>
                        <td className="py-3 px-2 text-right">{entry.total_won}/{entry.total_lost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
