'use client'

import { useState, useEffect } from 'react';
import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { toEther } from 'thirdweb';
import { contract } from '@/constants/contract';

export function useUserBalance() {
  const account = useActiveAccount();
  const [error, setError] = useState<string | null>(null);

  // Add the following functions to fetch data from the contract
  const { data: portfolioData, isLoading: isLoadingPortfolio, error: portfolioError } = useReadContract({
    contract,
    method: "function getTotalCommittedFunds() view returns (uint256)",
    params: []
  });

  const { data: userSharesData, isLoading: isLoadingShares, error: sharesError } = useReadContract({
    contract, 
    method: "function getUserShares(uint256 _marketId, address _user) view returns (uint256[] memory)",
    params: [BigInt(0), account?.address || "0x0000000000000000000000000000000000000000"]
  });

  // Handle errors
  useEffect(() => {
    if (portfolioError) {
      console.error("Portfolio error:", portfolioError);
      setError("Failed to load portfolio data");
    }
    if (sharesError) {
      console.error("Shares error:", sharesError);
      setError("Failed to load shares data");
    }
  }, [portfolioError, sharesError]);

  const loading = isLoadingPortfolio || isLoadingShares;

  // Format data
  const portfolioValue = portfolioData ? Number(portfolioData) / 1e18 : 0;
  const sharesValue = userSharesData ? userSharesData.reduce((acc, val) => acc + Number(val), 0) / 1e18 : 0;

  // Calculate PnL (dummy calculation)
  const pnl = sharesValue > 0 ? `+${(sharesValue * 0.1).toFixed(2)}` : "0.00";

  return {
    balance: 0, // This will come from the AccountBalance component
    portfolio: portfolioValue.toFixed(2),
    pnl,
    loading,
    error
  };
}