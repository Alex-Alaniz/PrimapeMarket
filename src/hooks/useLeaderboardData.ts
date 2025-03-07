
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

export function useLeaderboardData() {
  const [data, setData] = useState<UserData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, you would fetch actual data from an API
        // For now, we'll use mock data
        const mockData: UserData[] = [
          {
            rank: 1,
            address: "0x7bF1C1B5b58C01920060A4ED9132c378630e4aE2",
            totalWagered: BigInt(50 * 1e18),
            realizedPnL: BigInt(12 * 1e18),
            volume: BigInt(150 * 1e18),
            currentTally: BigInt(62 * 1e18),
            isHighlighted: true
          },
          {
            rank: 2,
            address: "0x4C7B8591C50a41633Db81fdEe8D2D91ab3F16557",
            totalWagered: BigInt(45 * 1e18),
            realizedPnL: BigInt(8 * 1e18),
            volume: BigInt(120 * 1e18),
            currentTally: BigInt(53 * 1e18)
          },
          {
            rank: 3,
            address: "0x3817957420A2B2AEF21de47e32021A4bE7aCd473",
            totalWagered: BigInt(40 * 1e18),
            realizedPnL: BigInt(-5 * 1e18),
            volume: BigInt(100 * 1e18),
            currentTally: BigInt(35 * 1e18)
          },
          {
            rank: 4,
            address: "0x281B1539A0a635EB10673E5fcE23E572E78097Cc",
            totalWagered: BigInt(35 * 1e18),
            realizedPnL: BigInt(3 * 1e18),
            volume: BigInt(90 * 1e18),
            currentTally: BigInt(38 * 1e18)
          },
          {
            rank: 5,
            address: "0x9E2A3eB3C56C8F33BC1413E60fC9f8a423398e55",
            totalWagered: BigInt(30 * 1e18),
            realizedPnL: BigInt(-2 * 1e18),
            volume: BigInt(80 * 1e18),
            currentTally: BigInt(28 * 1e18)
          },
          {
            rank: 6,
            address: "0x3D73D5A9120e27fb9e445Ce6A9f7a86d1B9A15eB",
            totalWagered: BigInt(25 * 1e18),
            realizedPnL: BigInt(1.5 * 1e18),
            volume: BigInt(70 * 1e18),
            currentTally: BigInt(26.5 * 1e18)
          },
          {
            rank: 7,
            address: "0x8F9E2bfa16F7F51459A7C7bD4E4e43D3A29e0a04",
            totalWagered: BigInt(20 * 1e18),
            realizedPnL: BigInt(-1 * 1e18),
            volume: BigInt(60 * 1e18),
            currentTally: BigInt(19 * 1e18)
          },
          {
            rank: 8,
            address: "0xB3f5E20db0167D4A5B5C5DcA4c150f12a6D4C1a2",
            totalWagered: BigInt(15 * 1e18),
            realizedPnL: BigInt(0.5 * 1e18),
            volume: BigInt(50 * 1e18),
            currentTally: BigInt(15.5 * 1e18)
          },
          {
            rank: 9,
            address: "0xf8D1677C8A5F191601e91BaC5eA2D6b6B25F2C07",
            totalWagered: BigInt(10 * 1e18),
            realizedPnL: BigInt(-0.3 * 1e18),
            volume: BigInt(40 * 1e18),
            currentTally: BigInt(9.7 * 1e18)
          },
          {
            rank: 10,
            address: "0x1234567890123456789012345678901234567890",
            totalWagered: BigInt(5 * 1e18),
            realizedPnL: BigInt(0.2 * 1e18),
            volume: BigInt(30 * 1e18),
            currentTally: BigInt(5.2 * 1e18)
          },
          {
            rank: 11,
            address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
            totalWagered: BigInt(4 * 1e18),
            realizedPnL: BigInt(0.1 * 1e18),
            volume: BigInt(25 * 1e18),
            currentTally: BigInt(4.1 * 1e18)
          },
          {
            rank: 12,
            address: "0x9876543210987654321098765432109876543210",
            totalWagered: BigInt(3 * 1e18),
            realizedPnL: BigInt(-0.1 * 1e18),
            volume: BigInt(20 * 1e18),
            currentTally: BigInt(2.9 * 1e18)
          },
        ];
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setData(mockData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return { data, isLoading, error };
}
