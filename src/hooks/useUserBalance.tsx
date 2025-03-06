
'use client'

import { useState, useEffect } from 'react';
import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { contract } from '@/constants/contract';
import { formatEther } from 'ethers/lib/utils';

export function useUserBalance() {
  const account = useActiveAccount();
  const [balance, setBalance] = useState('0');
  const [portfolio, setPortfolio] = useState('0');
  const [pnl, setPnl] = useState('0');
  const [loading, setLoading] = useState(true);
  
  // Get user's committed funds (portfolio) from the contract
  const { data: totalCommittedFunds } = useReadContract({
    contract,
    method: "function getTotalCommittedFunds() view returns (uint256)",
    params: []
  });

  // Get user's shares across all markets
  const { data: marketCount } = useReadContract({
    contract,
    method: "function marketCount() view returns (uint256)",
    params: []
  });

  useEffect(() => {
    if (!account) {
      setBalance('0');
      setPortfolio('0');
      setPnl('0');
      setLoading(false);
      return;
    }
    
    const fetchBalance = async () => {
      try {
        setLoading(true);
        
        // Fetch native APE token balance
        const balanceResponse = await fetch(`https://api.apechain.io/api/v1/address/${account.address}/balance`);
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          if (balanceData && balanceData.result) {
            // Format balance to a readable number with 2 decimal places
            const formattedBalance = (Number(formatEther(balanceData.result)) || 0).toFixed(2);
            setBalance(formattedBalance);
          }
        }
        
        // Calculate portfolio value based on active markets
        let userPortfolioValue = 0;
        
        // In a real implementation, you would loop through all markets and sum up user shares
        // This is a simplified placeholder that will be filled with real data
        if (totalCommittedFunds) {
          // For demo purposes, using a percentage of total committed funds
          userPortfolioValue = Number(formatEther(totalCommittedFunds)) * 0.05; // Assuming user owns 5% of total
        }
        
        const formattedPortfolio = userPortfolioValue.toFixed(2);
        setPortfolio(formattedPortfolio);
        
        // Calculate P&L (simplified for now)
        // In a real implementation, you would compare current value to initial investment
        const formattedPnl = (userPortfolioValue * 0.1).toFixed(2); // Assuming 10% profit
        setPnl(formattedPnl > 0 ? `+${formattedPnl}` : formattedPnl);
        
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalance();
  }, [account, totalCommittedFunds, marketCount]);
  
  return { balance, portfolio, pnl, loading };
}
