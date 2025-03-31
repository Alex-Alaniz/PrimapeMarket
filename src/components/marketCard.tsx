import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";

import { useRef } from "react";
import type { BuyInterfaceHandle } from "./market-buy-interface";

import { useActiveAccount, useReadContract } from "thirdweb/react";
import { contract } from "@/constants/contract";
import { MarketTime } from "./market-time";
import { MarketCardSkeleton } from "./market-card-skeleton";
import { _MarketProgress as _MarketProgress } from "./market-progress";
import { MarketResolved as _MarketResolved } from "./market-resolved";
import { _MarketPending as _MarketPending } from "./market-pending";
import { MarketBuyInterface } from "./market-buy-interface";
// import { MarketSharesDisplay } from "./market-shares-display"; //Removed
import { Market, MarketFilter, MARKET_CATEGORIES } from "@/types/prediction-market";
import { Button } from "./ui/button";
import { toEther } from "thirdweb"; //Added
import { Badge } from "@/components/ui/badge";
import Image from "next/image";


interface MarketCardProps {
    index: number;
    filter: MarketFilter;
    category?: string;
    featured?: boolean;
    compact?: boolean;
}

export function MarketCard({ index, filter, category = 'all', featured = false, compact: _compact = false }: MarketCardProps) {
    const account = useActiveAccount();
    const buyInterfaceRef = useRef<BuyInterfaceHandle>(null);

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

        // Category filter
        const marketCategory = MARKET_CATEGORIES[index] || 'all';
        const categoryMatch = category === 'all' || marketCategory === category;

        if (!categoryMatch) return false;

        // Status filter
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
        <Card key={index} className="flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg h-full border border-border/40 hover:border-primary/30">
            {isLoadingMarketInfo ? (
                <MarketCardSkeleton />
            ) : (
                <>
                    <div className="relative">
                        <Image
                            src={market?.image || '/images/default-market.jpg'}
                            alt={market?.question || "Market"}
                            width={400}
                            height={100}
                            className="w-full h-24 object-cover"
                            priority={featured}
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        />
                        {/* Probability badge */}
                        <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 text-xs font-bold text-white">
                            {probabilityPercentage}%
                        </div>
                    </div>

                    <CardHeader className="p-3 pb-1.5">
                        <div className="flex items-start">
                            <div className="flex-1">
                                {market && (
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        <MarketTime endTime={market.endTime} />
                                    </div>
                                )}
                                <CardTitle className="text-sm font-medium line-clamp-2 mt-1">
                                    {market?.question}
                                </CardTitle>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="px-3 py-1 flex-grow">
                        {market && market.options && market.totalSharesPerOption && (
                            <div className="mb-2">
                                {/* Unified card size for all option counts */}
                                <div className={`${market.options.length > 4 ? 'max-h-[110px]' : 'h-[110px]'} overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent`}>
                                    {market.options.map((option, idx) => {
                                        // Calculate probability percentage for each option
                                        const totalPool = market.totalSharesPerOption.reduce((sum, shares) => sum + shares, BigInt(0));
                                        const percentage = totalPool === BigInt(0) ? 0 :
                                            Math.round(Number(market.totalSharesPerOption[idx] * BigInt(100)) / Number(totalPool));

                                        return (
                                            <div key={idx} className="flex items-center justify-between py-1 group">
                                                <div className="flex-1 min-w-0">
                                                    <span className="truncate text-sm block">{option}</span>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className="text-sm text-muted-foreground font-medium">{percentage}%</span>
                                                    {!market.resolved && !isExpired && account && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className={`h-7 px-2.5 text-xs font-medium opacity-80 group-hover:opacity-100 ${market.options.length <= 2 ? (idx === 0 ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white") : "bg-green-500 hover:bg-green-600 text-white"}`}
                                                            onClick={() => buyInterfaceRef.current?.handleBuy(idx)}
                                                        >
                                                            Buy
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Add padding space at bottom for markets with few options */}
                                    {market.options.length < 3 && <div className="h-2"></div>}
                                </div>
                            </div>
                        )}

                        {/* Hidden component for handling buys */}
                        <MarketBuyInterface
                            marketId={index}
                            market={market!}
                            _compact={true}
                            ref={buyInterfaceRef}
                        />
                    </CardContent>

                    {account && (
                        <CardFooter className="p-3 pt-1 border-t border-border/30">
                            {market && (
                                <div className="flex flex-col gap-1 mt-2">
                                    <div className="w-full text-sm text-muted-foreground">
                                        Your shares:
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {market.options.map((option, index) => {
                                                // Add null check for userShares
                                                const shares = userShares && userShares[index] ? userShares[index] : BigInt(0);
                                                const sharesInEther = Number(toEther(shares)).toFixed(2);
                                                return (
                                                    <Badge
                                                        key={index}
                                                        variant={Number(sharesInEther) > 0 ? "default" : "secondary"}
                                                        className="text-xs py-0.5"
                                                    >
                                                        {option}: {sharesInEther}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardFooter>
                    )}
                </>
            )}
        </Card>
    );
}