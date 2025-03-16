import { useState, useEffect } from 'react';
import { Market } from '@/lib/db-models';

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface MarketsResponse {
  markets: Market[];
  pagination: Pagination;
}

export function useMarkets(
  status: 'all' | 'active' | 'resolved' = 'all',
  limit: number = 10,
  offset: number = 0
) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit,
    offset,
    hasMore: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMarkets = async () => {
      setIsLoading(true);

      try {
        // Fetch markets data from the API
        const response = await fetch(
          `/api/markets?status=${status}&limit=${limit}&offset=${offset}`
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result: MarketsResponse = await response.json();

        setMarkets(result.markets);
        setPagination(result.pagination);
      } catch (error: Error | unknown) {
        setError(error instanceof Error ? error : new Error('An unknown error occurred'));
        console.error('Error fetching markets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
  }, [status, limit, offset]);

  const loadMore = () => {
    if (pagination.hasMore) {
      return {
        status,
        limit,
        offset: offset + limit
      };
    }
    return null;
  };

  return { markets, pagination, isLoading, error, loadMore };
}

export function useMarket(marketId: string) {
  const [market, setMarket] = useState<Market | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]); //This line needs to be updated to a more specific type.
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMarket = async () => {
      if (!marketId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Fetch market data from the API
        const response = await fetch(`/api/markets/${marketId}`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const result = await response.json();

        setMarket(result.market);
        setPredictions(result.predictions || []);
      } catch (error: Error | unknown) {
        setError(error instanceof Error ? error : new Error('An unknown error occurred'));
        console.error('Error fetching market:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarket();
  }, [marketId]);

  return { market, predictions, isLoading, error };
}