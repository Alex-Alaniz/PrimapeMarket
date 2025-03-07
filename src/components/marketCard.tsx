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

    return (
        <Card key={index} className={`flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg ${featured ? 'border-0 shadow-md' : 'border border-border/40 hover:border-primary/30'}`}>
            {isLoadingMarketInfo ? (
                <MarketCardSkeleton />
            ) : (
                <>
                    <CardHeader className={`relative flex flex-col gap-2 ${compact ? 'p-4 pb-2' : 'p-5'} ${featured ? 'bg-gradient-to-br from-primary/10 to-accent/5' : ''}`}>
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                {market && (
                                    <div className={`${compact ? 'text-sm' : ''} flex items-center gap-2`}>
                                        <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                        <MarketTime endTime={market.endTime} />
                                    </div>
                                )}
                                <CardTitle className={`mt-2 ${compact ? 'text-xl' : 'text-2xl'} font-bold text-foreground`}>
                                    {market?.question}
                                </CardTitle>
                            </div>
                            <Image 
                                src={market?.image || '/images/default-market.jpg'}
                                alt={market?.question || "Market"}
                                width={compact ? 70 : 90}
                                height={compact ? 70 : 90}
                                className="rounded-lg object-cover shadow-md ring-1 ring-white/10"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className={compact ? 'px-4 py-2' : ''}>
                        {market && market.options && market.totalSharesPerOption && (
                            <div className="mb-4">
                                <MarketProgress 
                                    options={market.options}
                                    totalShares={market.totalSharesPerOption}
                                    _compact={compact}
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
                                _compact={compact}
                            />
                        ) : isExpired ? (
                            <MarketPending _compact={compact} />
                        ) : (
                            <MarketBuyInterface 
                                marketId={index}
                                market={market!}
                                _compact={compact}
                            />
                        )}
                    </CardContent>
                    <CardFooter className={compact ? 'p-4 pt-2' : ''}>
                        {market && account && (
                            <MarketSharesDisplay 
                                market={market}
                                userShares={userShares ? [...userShares] : Array(market.options.length).fill(BigInt(0))}
                                compact={compact}
                            />
                        )}
                    </CardFooter>
                </>
            )}
        </Card>
    );
}