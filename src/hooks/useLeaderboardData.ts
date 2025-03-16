import { useState, useEffect } from "react";

interface LeaderboardUser {
  rank: number;
  userId: number;
  displayName: string;
  address: string;
  totalInvested: bigint;
  totalClaimed: bigint;
  totalParticipated: number;
  totalWon: number;
  totalLost: number;
  pnl: bigint;
  isHighlighted?: boolean;
}

interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardUser[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function useLeaderboardData(limit = 100, offset = 0) {
  const [data, setData] = useState<LeaderboardUser[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<{
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch data from the API
        const response = await fetch(`/api/leaderboard?limit=${limit}&offset=${offset}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result: LeaderboardResponse = await response.json();
        
        if (!result.success) {
          throw new Error('Failed to fetch leaderboard data');
        }
        
        setData(result.leaderboard);
        setPagination(result.pagination);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        
        // Fallback to mock data if API fails
        const mockData: LeaderboardUser[] = [
          {
            rank: 1,
            userId: 1,
            displayName: "Crypto Whale",
            address: "0x7bF1C1B5b58C01920060A4ED9132c378630e4aE2",
            totalInvested: BigInt(50 * 1e18),
            totalClaimed: BigInt(62 * 1e18),
            totalParticipated: 15,
            totalWon: 10,
            totalLost: 5,
            pnl: BigInt(12 * 1e18),
            isHighlighted: true
          },
          {
            rank: 2,
            userId: 2,
            displayName: "Crypto Whale 2",
            address: "0x4C7B8591C50a41633Db81fdEe8D2D91ab3F16557",
            totalInvested: BigInt(45 * 1e18),
            totalClaimed: BigInt(53 * 1e18),
            totalParticipated: 12,
            totalWon: 8,
            totalLost: 4,
            pnl: BigInt(8 * 1e18)
          },
          {
            rank: 3,
            userId: 3,
            displayName: "Crypto Whale 3",
            address: "0x3817957420A2B2AEF21de47e32021A4bE7aCd473",
            totalInvested: BigInt(40 * 1e18),
            totalClaimed: BigInt(35 * 1e18),
            totalParticipated: 10,
            totalWon: 5,
            totalLost: 5,
            pnl: BigInt(-5 * 1e18)
          },
          {
            rank: 4,
            userId: 4,
            displayName: "Crypto Whale 4",
            address: "0x281B1539A0a635EB10673E5fcE23E572E78097Cc",
            totalInvested: BigInt(35 * 1e18),
            totalClaimed: BigInt(38 * 1e18),
            totalParticipated: 9,
            totalWon: 5,
            totalLost: 4,
            pnl: BigInt(3 * 1e18)
          },
          {
            rank: 5,
            userId: 5,
            displayName: "Crypto Whale 5",
            address: "0x9E2A3eB3C56C8F33BC1413E60fC9f8a423398e55",
            totalInvested: BigInt(30 * 1e18),
            totalClaimed: BigInt(28 * 1e18),
            totalParticipated: 8,
            totalWon: 4,
            totalLost: 4,
            pnl: BigInt(-2 * 1e18)
          },
          {
            rank: 6,
            userId: 6,
            displayName: "Crypto Whale 6",
            address: "0x3D73D5A9120e27fb9e445Ce6A9f7a86d1B9A15eB",
            totalInvested: BigInt(25 * 1e18),
            totalClaimed: BigInt(26.5 * 1e18),
            totalParticipated: 7,
            totalWon: 4,
            totalLost: 3,
            pnl: BigInt(1.5 * 1e18)
          },
          {
            rank: 7,
            userId: 7,
            displayName: "Crypto Whale 7",
            address: "0x8F9E2bfa16F7F51459A7C7bD4E4e43D3A29e0a04",
            totalInvested: BigInt(20 * 1e18),
            totalClaimed: BigInt(19 * 1e18),
            totalParticipated: 6,
            totalWon: 3,
            totalLost: 3,
            pnl: BigInt(-1 * 1e18)
          },
          {
            rank: 8,
            userId: 8,
            displayName: "Crypto Whale 8",
            address: "0xB3f5E20db0167D4A5B5C5DcA4c150f12a6D4C1a2",
            totalInvested: BigInt(15 * 1e18),
            totalClaimed: BigInt(15.5 * 1e18),
            totalParticipated: 5,
            totalWon: 3,
            totalLost: 2,
            pnl: BigInt(0.5 * 1e18)
          },
          {
            rank: 9,
            userId: 9,
            displayName: "Crypto Whale 9",
            address: "0xf8D1677C8A5F191601e91BaC5eA2D6b6B25F2C07",
            totalInvested: BigInt(10 * 1e18),
            totalClaimed: BigInt(9.7 * 1e18),
            totalParticipated: 4,
            totalWon: 2,
            totalLost: 2,
            pnl: BigInt(-0.3 * 1e18)
          },
          {
            rank: 10,
            userId: 10,
            displayName: "Crypto Whale 10",
            address: "0x1234567890123456789012345678901234567890",
            totalInvested: BigInt(5 * 1e18),
            totalClaimed: BigInt(5.2 * 1e18),
            totalParticipated: 3,
            totalWon: 1,
            totalLost: 2,
            pnl: BigInt(0.2 * 1e18)
          },
          {
            rank: 11,
            userId: 11,
            displayName: "Crypto Whale 11",
            address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
            totalInvested: BigInt(4 * 1e18),
            totalClaimed: BigInt(4.1 * 1e18),
            totalParticipated: 2,
            totalWon: 1,
            totalLost: 1,
            pnl: BigInt(0.1 * 1e18)
          },
          {
            rank: 12,
            userId: 12,
            displayName: "Crypto Whale 12",
            address: "0x9876543210987654321098765432109876543210",
            totalInvested: BigInt(3 * 1e18),
            totalClaimed: BigInt(2.9 * 1e18),
            totalParticipated: 2,
            totalWon: 1,
            totalLost: 1,
            pnl: BigInt(-0.1 * 1e18)
          },
        ];
        
        setData(mockData);
        setPagination({
          total: mockData.length,
          limit,
          offset,
          hasMore: false
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [limit, offset]);
  
  return { data, isLoading, error, pagination };
}
