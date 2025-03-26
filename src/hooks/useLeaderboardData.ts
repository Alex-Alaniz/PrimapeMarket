"use client";
import { useState, useEffect } from "react";

interface UserData {
  rank: number;
  address: string;
  totalWagered: bigint;
  realizedPnL: bigint;
  volume: bigint;
  currentTally: bigint;
  isHighlighted?: boolean;
}

// Transform API response into the expected format
interface ApiUser {
  primary_wallet: string;
  total_invested: string;
  pnl: string;
  total_claimed: string;
  total_won: string;
  total_lost: string;
}

export function useLeaderboardData() {
  const [data, setData] = useState<UserData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      console.log("Fetching leaderboard data...");

      try {
        const response = await fetch("/api/userLeaderboard");
        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }

        const result = await response.json();
        console.log("Raw API response:", result);

        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("Invalid API response format");
        }

        const leaderboardData: UserData[] = result.data.map(
          (user: ApiUser, index: number) => ({
            rank: index + 1,
            address: user.primary_wallet,
            totalWagered: BigInt(
              Math.floor(parseFloat(user.total_invested) * 1e18)
            ),
            realizedPnL: BigInt(Math.floor(parseFloat(user.pnl) * 1e18)),
            volume: BigInt(Math.floor(parseFloat(user.total_claimed) * 1e18)),
            currentTally: BigInt(
              Math.floor(
                (parseFloat(user.total_won) - parseFloat(user.total_lost)) *
                  1e18
              )
            ),
          })
        );

        console.log("Processed leaderboard data:", leaderboardData);
        setData(leaderboardData);
      } catch (err) {
        console.error("Error fetching leaderboard data:", err);
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log("Returning from hook:", { data, isLoading, error });
  return { data, isLoading, error };
}
