
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
"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Medal } from "lucide-react";

interface LeaderboardEntry {
  user_id: number;
  display_name: string;
  primary_wallet: string;
  markets_participated: number;
  winnings: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      const response = await fetch('/api/leaderboard');
      
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      } else {
        const error = await response.json();
        setError(error.message || "Failed to fetch leaderboard data");
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  }

  function formatWallet(wallet: string): string {
    if (!wallet) return "";
    return `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 4)}`;
  }

  function getRankIcon(rank: number) {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="font-bold">{rank}</span>;
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Primape Markets Leaderboard
          </CardTitle>
          <CardDescription>Top performers in prediction markets</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No data available yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead className="text-right">Markets Joined</TableHead>
                  <TableHead className="text-right">Total Winnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.user_id} className={entry.rank <= 3 ? "bg-primary/5" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex justify-center items-center">
                        {getRankIcon(entry.rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{entry.display_name}</div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{formatWallet(entry.primary_wallet)}</code>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{entry.markets_participated}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {entry.winnings > 0 ? (
                        <span className="text-green-600">
                          +{entry.winnings.toLocaleString()} APE
                        </span>
                      ) : entry.winnings < 0 ? (
                        <span className="text-red-500">
                          {entry.winnings.toLocaleString()} APE
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0 APE</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
