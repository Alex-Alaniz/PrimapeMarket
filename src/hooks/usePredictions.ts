import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { Prediction } from '@/lib/db-models';

interface PredictionWithExtras extends Prediction {
  username?: string | null;
  wallet_address?: string;
  market_title?: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

interface PredictionsResponse {
  predictions: PredictionWithExtras[];
  pagination: Pagination;
}

export function usePredictions(
  marketId?: string,
  limit: number = 10,
  offset: number = 0
) {
  const [predictions, setPredictions] = useState<PredictionWithExtras[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit,
    offset,
    hasMore: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const account = useActiveAccount();

  useEffect(() => {
    const fetchPredictions = async () => {
      setIsLoading(true);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (account) {
          params.append('wallet', account.address);
        }
        if (marketId) {
          params.append('market', marketId);
        }
        params.append('limit', limit.toString());
        params.append('offset', offset.toString());
        
        // Fetch predictions data from the API
        const response = await fetch(`/api/predictions?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result: PredictionsResponse = await response.json();
        
        setPredictions(result.predictions);
        setPagination(result.pagination);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        console.error('Error fetching predictions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPredictions();
  }, [account, marketId, limit, offset]);
  
  const submitPrediction = async (
    predictionData: {
      market_id: string;
      position: boolean;
      amount: number;
      prediction_id: string;
      transaction_hash: string;
    }
  ) => {
    if (!account) {
      throw new Error('No wallet connected');
    }
    
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: account.address,
          ...predictionData
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Refresh predictions
      setPredictions(prev => [result.prediction, ...prev]);
      setPagination(prev => ({
        ...prev,
        total: prev.total + 1
      }));
      
      return result.prediction;
    } catch (err) {
      console.error('Error submitting prediction:', err);
      throw err;
    }
  };
  
  const loadMore = () => {
    if (pagination.hasMore) {
      return {
        marketId,
        limit,
        offset: offset + limit
      };
    }
    return null;
  };
  
  return { predictions, pagination, isLoading, error, submitPrediction, loadMore };
} 