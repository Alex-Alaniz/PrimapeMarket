import { useState, useEffect } from 'react';

interface LeaderboardUser {
  id: number;
  wallet_address: string;
  username: string | null;
  avatar_url: string | null;
  total_predictions: number;
  correct_predictions: number;
  total_volume: number;
  total_earnings: number;
  rank: number | null;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  pagination: Pagination;
}

export function useLeaderboard(
  sortBy: 'earnings' | 'predictions' | 'correct' = 'earnings',
  limit: number = 10,
  offset: number = 0
) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit,
    offset,
    hasMore: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      
      try {
        // Fetch leaderboard data from the API
        const response = await fetch(
          `/api/leaderboard?sort=${sortBy}&limit=${limit}&offset=${offset}`
        );
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result: LeaderboardResponse = await response.json();
        
        setLeaderboard(result.leaderboard);
        setPagination(result.pagination);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        console.error('Error fetching leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [sortBy, limit, offset]);
  
  const loadMore = () => {
    if (pagination.hasMore) {
      return {
        sortBy,
        limit,
        offset: offset + limit
      };
    }
    return null;
  };
  
  return { leaderboard, pagination, isLoading, error, loadMore };
} 