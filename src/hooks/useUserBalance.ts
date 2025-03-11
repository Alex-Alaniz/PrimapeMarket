import { useState, useEffect } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { contract } from "@/constants/contract";
import { toEther } from "thirdweb";

export interface UserPerformanceData {
  totalWins: number;
  totalParticipations: number;
  winPercentage: number;
  totalStaked: string;
  portfolio: string;
  pnl: string;
  highestStake: string;
  mostSuccessfulCategory: string;
  activePredictions: number;
  resolvedPredictions: number;
}

export function useUserBalance() {
  const account = useActiveAccount();
  const [userPerformance, setUserPerformance] = useState<UserPerformanceData>({
    totalWins: 0,
    totalParticipations: 0,
    winPercentage: 0,
    totalStaked: "0",
    portfolio: "0",
    pnl: "0",
    highestStake: "0",
    mostSuccessfulCategory: "Crypto",
    activePredictions: 0,
    resolvedPredictions: 0
  });

  // Get market count to iterate through all markets
  const { data: marketCount } = useReadContract({
    contract,
    method: "function marketCount() view returns (uint256)",
    params: []
  });

  useEffect(() => {
    if (!account || !marketCount) return;

    const fetchUserMarketData = async () => {
      let totalWins = 0;
      let totalParticipations = 0;
      let totalStakedValue = BigInt(0);
      let highestStakeValue = BigInt(0);
      let pnlValue = BigInt(0);
      let active = 0;
      let resolved = 0;

      // Categories for tracking performance by category
      const categoryPerformance = {
        Crypto: { wins: 0, participations: 0 },
        Politics: { wins: 0, participations: 0 },
        Sports: { wins: 0, participations: 0 },
        Business: { wins: 0, participations: 0 },
      };

      // Iterate through all markets to gather user data
      for (let i = 0; i < Number(marketCount); i++) {
        try {
          // Get market info
          const marketInfo = await contract.read.getMarketInfo([BigInt(i)]);
          const userShares = await contract.read.getUserShares([BigInt(i), account.address]);

          // Check if user has participated in this market
          const hasParticipated = userShares.some(shares => shares > BigInt(0));

          if (hasParticipated) {
            totalParticipations++;

            // Determine market category (simplified - in a real app, fetch from contract or database)
            const marketCategory = i % 4 === 0 ? "Crypto" : 
                                   i % 4 === 1 ? "Politics" : 
                                   i % 4 === 2 ? "Sports" : "Business";

            categoryPerformance[marketCategory].participations++;

            // Calculate total staked
            const totalStakedInMarket = userShares.reduce((sum, shares) => sum + shares, BigInt(0));
            totalStakedValue += totalStakedInMarket;

            // Track highest stake
            if (totalStakedInMarket > highestStakeValue) {
              highestStakeValue = totalStakedInMarket;
            }

            // Check if market is resolved
            if (marketInfo[2]) { // marketInfo[2] is the 'resolved' boolean
              resolved++;

              // Check if user won (had shares in winning option)
              const winningOptionIndex = Number(marketInfo[3]);
              if (winningOptionIndex < userShares.length && userShares[winningOptionIndex] > BigInt(0)) {
                totalWins++;
                categoryPerformance[marketCategory].wins++;

                // Simple PNL calculation (in a real app, calculate based on actual returns)
                pnlValue += totalStakedInMarket;
              } else {
                // Lost stake
                pnlValue -= totalStakedInMarket;
              }
            } else {
              active++;
            }
          }
        } catch (error) {
          console.error(`Error fetching data for market ${i}:`, error);
        }
      }

      // Calculate win percentage
      const winPercentage = totalParticipations > 0 
        ? Math.round((totalWins / totalParticipations) * 100) 
        : 0;

      // Determine most successful category
      let mostSuccessfulCategory = "None";
      let highestWinRate = 0;

      Object.entries(categoryPerformance).forEach(([category, data]) => {
        const winRate = data.participations > 0 ? data.wins / data.participations : 0;
        if (winRate > highestWinRate) {
          highestWinRate = winRate;
          mostSuccessfulCategory = category;
        }
      });

      // Format values for display
      const totalStakedFormatted = parseFloat(toEther(totalStakedValue)).toFixed(2);

      // For demo purposes, we'll just use a simple calculation
      // In a real app, you'd calculate the actual portfolio value based on market outcomes
      const portfolioValue = parseFloat(totalStakedFormatted) * (1 + (winPercentage / 100));
      const portfolioFormatted = portfolioValue.toFixed(2);

      // Format PNL with + or - sign
      const pnlFormatted = pnlValue > BigInt(0) 
        ? `+${parseFloat(toEther(pnlValue)).toFixed(2)}` 
        : parseFloat(toEther(pnlValue)).toFixed(2);

      setUserPerformance({
        totalWins,
        totalParticipations,
        winPercentage,
        totalStaked: totalStakedFormatted,
        portfolio: portfolioFormatted,
        pnl: pnlFormatted,
        highestStake: parseFloat(toEther(highestStakeValue)).toFixed(2),
        mostSuccessfulCategory,
        activePredictions: active,
        resolvedPredictions: resolved
      });
    };

    fetchUserMarketData();
  }, [account, marketCount]);

  return { 
    ...userPerformance,
    portfolio: userPerformance.portfolio + " APE",
    pnl: userPerformance.pnl + " APE"
  };
}