export interface Market {
    question: string;
    endTime: bigint;
    resolved: boolean;
    winningOptionIndex: number;
    options: string[];
    totalSharesPerOption: bigint[];
    image: string;
    mediaType?: 'image' | 'gif';
}

export interface UserShares {
    balances: bigint[];
}

export interface MarketInfo {
    question: string;
    endTime: bigint;
    resolved: boolean;
    winningOptionIndex: number;
}

export type MarketFilter = 'all' | 'active' | 'pending' | 'resolved'; 

export type MarketCategory = 'all' | 'politics' | 'crypto' | 'sports' | 'business';

// Add market category mapping
export const MARKET_CATEGORIES: Record<number, MarketCategory> = {
  0: 'crypto', // Default market is crypto as you mentioned
  1: 'sports',
  2: 'crypto',
  3: 'crypto',
  // Add more markets with their categories as you create them
  // The key is the marketId (corresponds to the index in the blockchain)
  // The value must be one of the MarketCategory types ('all', 'politics', 'crypto', 'sports', 'business')
};