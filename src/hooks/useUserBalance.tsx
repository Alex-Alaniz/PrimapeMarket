'use client'

import { useState, useEffect } from 'react';
import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { toEther } from 'thirdweb';
import { contract } from '@/constants/contract';

export function useUserBalance() {
  const account = useActiveAccount();
  const [portfolio, setPortfolio] = useState('0');
  const [pnl, setPnl] = useState('0');
  const [loading, setLoading] = useState(true);

  // Read total committed funds from contract
  const { data: totalCommittedFunds } = useReadContract({
    contract,
    method: "function getTotalCommittedFunds() view returns (uint256)",
    params: []
  });

  // Get user shares from contract
  const { data: userShares, isLoading: sharesLoading } = useReadContract({
    contract,
    method: "function getUserShares(uint256 _marketId, address _user) view returns (uint256[] memory)",
    params: [BigInt(0), account?.address || "0x0"], // Using first market as an example
    enabled: !!account
  });

  useEffect(() => {
    if (!account) {
      setPortfolio('0');
      setPnl('0');
      setLoading(false);
      return;
    }

    const calculatePortfolio = async () => {
      try {
        setLoading(true);

        // Calculate portfolio value based on user shares in markets
        let userPortfolioValue = 0;

        if (totalCommittedFunds) {
          if (userShares && userShares.length > 0) {
            // In a real implementation, you would sum up all shares across all markets
            const totalUserShares = userShares.reduce(
              (sum, share) => sum + Number(toEther(share)), 
              0
            );
            userPortfolioValue = totalUserShares;
          } else {
            // Fallback calculation
            userPortfolioValue = Number(toEther(totalCommittedFunds)) * 0.05;
          }
        }

        const formattedPortfolio = userPortfolioValue.toFixed(2);
        setPortfolio(formattedPortfolio);

        // Calculate P&L (simplified for now)
        // In a real implementation, this would be based on historical data
        const pnlValue = userPortfolioValue * 0.1; // 10% profit for demo
        const formattedPnl = pnlValue > 0 ? `+${pnlValue.toFixed(2)}` : pnlValue.toFixed(2);
        setPnl(formattedPnl);

        setLoading(false);
      } catch (error) {
        console.error('Error calculating portfolio:', error);
        setLoading(false);
      }
    };

    calculatePortfolio();
  }, [account, totalCommittedFunds, userShares, sharesLoading]);

  return { portfolio, pnl, loading };
}