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