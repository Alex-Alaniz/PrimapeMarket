import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { contract } from "@/constants/contract";
import { MarketProgress } from "./market-progress";
import { MarketTime } from "./market-time";
import { MarketCardSkeleton } from "./market-card-skeleton";
import { MarketResolved } from "./market-resolved";
import { MarketPending } from "./market-pending";
import { MarketBuyInterface } from "./market-buy-interface";
import { MarketSharesDisplay } from "./market-shares-display";
import { Market, MarketFilter } from "@/types/prediction-market";
import Image from "next/image";

interface MarketCardProps {
    index: number;
    filter: MarketFilter;
    featured?: boolean;
    compact?: boolean;
}

export function MarketCard({ index, filter, featured = false, compact = false }: MarketCardProps) {
    const account = useActiveAccount();

    // Get market info
    const { data: marketInfo, isLoading: isLoadingMarketInfo } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string question, uint256 endTime, bool resolved, uint256 winningOptionIndex)",
        params: [BigInt(index)]
    });

    // Get market options
    const { data: marketOptions } = useReadContract({
        contract,
        method: "function getMarketOptions(uint256 _marketId) view returns (string[] memory)",
        params: [BigInt(index)]
    });

    // Get market total shares
    const { data: totalSharesData } = useReadContract({
        contract,
        method: "function getMarketTotalShares(uint256 _marketId) view returns (uint256[] memory)",
        params: [BigInt(index)]
    });

    // Get user shares only if account exists
    const { data: userShares } = useReadContract({
        contract,
        method: "function getUserShares(uint256 _marketId, address _user) view returns (uint256[] memory)",
        params: [BigInt(index), account?.address || "0x0"]
    });

    // Parse market data with proper total shares handling
    const market: Market | undefined = marketInfo && marketOptions ? {
        question: marketInfo[0],
        endTime: marketInfo[1],
        resolved: marketInfo[2],
        winningOptionIndex: Number(marketInfo[3]),
        options: [...marketOptions],
        totalSharesPerOption: totalSharesData ? [...totalSharesData] : Array(marketOptions.length).fill(BigInt(0)),
        image: `/images/markets/${index + 1}.jpg` // Assuming the image path is based on the index
    } : undefined;

    // Check if market is expired
    const isExpired = market ? new Date(Number(market.endTime) * 1000) < new Date() : false;

    // Calculate probability percentage for the first option (if available)
    const calculateProbabilityPercentage = () => {
        if (!market || !market.totalSharesPerOption || market.totalSharesPerOption.length === 0) return 0;
        
        const totalPool = market.totalSharesPerOption.reduce((sum, shares) => sum + shares, BigInt(0));
        if (totalPool === BigInt(0)) return 0;
        
        const firstOptionShares = market.totalSharesPerOption[0];
        return Math.round(Number(firstOptionShares * BigInt(100)) / Number(totalPool));
    };

    // Filter logic
    const shouldShow = () => {
        if (!market) return false;
        
        switch (filter) {
            case 'active':
                return !market.resolved;
            case 'pending':
                return isExpired && !market.resolved;
            case 'resolved':
                return market.resolved;
            default:
                return true;
        }
    };

    if (!shouldShow()) {
        return null;
    }
    
    // Probability percentage for first option 
    const probabilityPercentage = calculateProbabilityPercentage();

    return (
        <Card key={index} className={`flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg h-full ${featured ? 'border-0 shadow-md' : compact ? 'border border-border/40 hover:border-primary/30' : 'border border-border/40 hover:border-primary/30'}`}>
            {isLoadingMarketInfo ? (
                <MarketCardSkeleton />
            ) : (
                <>
                    <div className="relative">
                        <Image 
                            src={market?.image || '/images/default-market.jpg'}
                            alt={market?.question || "Market"}
                            width={400}
                            height={200}
                            className="w-full h-32 object-cover"
                        />
                        {/* Probability badge - Polymarket style */}
                        <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 text-xs font-bold text-white">
                            {probabilityPercentage}%
                        </div>
                    </div>
                    
                    <CardHeader className={`${compact ? 'p-3 pb-2' : 'p-4 pb-3'}`}>
                        <div className="flex items-start gap-2">
                            <div className="flex-1">
                                {market && (
                                    <div className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground flex items-center gap-1`}>
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        <MarketTime endTime={market.endTime} />
                                    </div>
                                )}
                                <CardTitle className={`${compact ? 'text-sm' : 'text-base'} font-medium line-clamp-2 mt-1`}>
                                    {market?.question}
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className={`${compact ? 'px-3 py-1' : 'px-4 py-2'} flex-grow`}>
                        {market && market.options && market.totalSharesPerOption && (
                            <div className="mb-3">
                                <MarketProgress 
                                    options={market.options}
                                    totalShares={market.totalSharesPerOption}
                                    _compact={true}
                                />
                            </div>
                        )}
                        
                        {market?.resolved ? (
                            <MarketResolved 
                                marketId={index}
                                winningOptionIndex={market.winningOptionIndex}
                                options={market.options}
                                totalShares={[...market.totalSharesPerOption]}
                                userShares={userShares ? [...userShares] : Array(market.options.length).fill(BigInt(0))}
                                _compact={true}
                            />
                        ) : isExpired ? (
                            <MarketPending _compact={true} />
                        ) : (
                            <MarketBuyInterface 
                                marketId={index}
                                market={market!}
                                _compact={true}
                            />
                        )}
                    </CardContent>
                    
                    {account && (
                        <CardFooter className={`${compact ? 'p-3 pt-1' : 'p-4 pt-2'} border-t border-border/30`}>
                            {market && (
                                <MarketSharesDisplay 
                                    market={market}
                                    userShares={userShares ? [...userShares] : Array(market.options.length).fill(BigInt(0))}
                                    compact={true}
                                />
                            )}
                        </CardFooter>
                    )}
                </>
            )}
        </Card>
    );
}