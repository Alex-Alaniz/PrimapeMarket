
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { useRef } from "react";
import type { BuyInterfaceHandle } from "./market-buy-interface";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { contract } from "@/constants/contract";
import { MarketProgress } from "./market-progress";
import { MarketTime } from "./market-time";
import { MarketCardSkeleton } from "./market-card-skeleton";
import { MarketResolved } from "./market-resolved";
import { MarketPending } from "./market-pending";
import { MarketBuyInterface } from "./market-buy-interface";
import { MarketSharesDisplay } from "./market-shares-display";
import { Market, MarketFilter, MARKET_CATEGORIES } from "@/types/prediction-market";
import Image from "next/image";
import { Button } from "./ui/button";

interface MarketCardProps {
    index: number;
    filter?: MarketFilter;
    category?: string;
    compact?: boolean;
}

export function MarketCard({ index, filter = "all", category = "all", compact = false }: MarketCardProps) {
    const account = useActiveAccount();
    // Create a ref to access the buy interface
    const buyInterfaceRef = useRef<BuyInterfaceHandle>(null);

    // Query market info
    const { data: marketInfo, isLoading: isLoadingMarketInfo } = useReadContract({
        contract,
        method: "function getMarketInfo(uint256 _marketId) view returns (string, uint256, bool, uint256)",
        params: [BigInt(index)]
    });

    // Query market options
    const { data: options, isLoading: isLoadingOptions } = useReadContract({
        contract,
        method: "function getMarketOptions(uint256 _marketId) view returns (string[])",
        params: [BigInt(index)]
    });

    // Query total shares
    const { data: totalShares, isLoading: isLoadingTotalShares } = useReadContract({
        contract,
        method: "function getMarketTotalShares(uint256 _marketId) view returns (uint256[])",
        params: [BigInt(index)]
    });

    // Query user shares if account exists
    const { data: userShares, isLoading: isLoadingUserShares } = useReadContract({
        contract,
        method: "function getUserShares(uint256 _marketId, address _user) view returns (uint256[])",
        params: account ? [BigInt(index), account.address] : undefined,
        enabled: !!account
    });

    // Market image dictionary (these would be dynamically determined in a real app)
    const getMarketImage = (marketId: number) => {
        const images = [
            "/images/markets/crypto1.jpg",
            "/images/markets/politics1.jpg",
            "/images/markets/crypto2.jpg",
            "/images/markets/sports1.jpg",
            "/images/markets/politics2.jpg",
            "/images/markets/eth.jpg",
            "/images/markets/apecoin.jpg",
            "/images/markets/election.jpg",
            "/images/markets/olympics.jpg",
            "/images/markets/bitcoin.jpg",
        ];
        return images[marketId % images.length];
    };

    // Combined loading state
    const isLoading = isLoadingMarketInfo || isLoadingOptions || isLoadingTotalShares;

    // Handle buy button click - passes to the BuyInterface
    const handleBuyClick = (optionIndex: number) => {
        if (buyInterfaceRef.current) {
            buyInterfaceRef.current.handleBuy(optionIndex);
        }
    };

    if (isLoading) {
        return <MarketCardSkeleton compact={compact} />;
    }

    if (!marketInfo || !options || !totalShares) {
        return null;
    }

    // Construct market object from contract data
    const market: Market = {
        question: marketInfo[0],
        endTime: marketInfo[1],
        resolved: marketInfo[2],
        winningOptionIndex: Number(marketInfo[3]),
        options: options,
        totalSharesPerOption: totalShares,
        image: getMarketImage(index),
        mediaType: 'image'
    };

    // Handle filter logic
    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    const isPending = !market.resolved && market.endTime < currentTime;
    const isActive = !market.resolved && market.endTime > currentTime;
    const isResolved = market.resolved;

    if (filter === "pending" && !isPending) return null;
    if (filter === "active" && !isActive) return null;
    if (filter === "resolved" && !isResolved) return null;

    // Handle category filter
    const marketCategory = MARKET_CATEGORIES[index] || 'crypto';
    if (category !== 'all' && category !== marketCategory) return null;

    // Get total shares
    const getTotalShares = () => {
        let total = BigInt(0);
        for (const shares of market.totalSharesPerOption) {
            total += shares;
        }
        return total;
    };

    return (
        <Card className={`overflow-hidden transition-all duration-200 h-full ${compact ? 'hover:shadow-md' : ''}`}>
            {!compact && (
                <div className="relative aspect-video overflow-hidden">
                    <Image 
                        src={market.image} 
                        alt={market.question}
                        fill
                        className="object-cover transition-transform duration-200 hover:scale-105"
                    />
                </div>
            )}
            
            <CardHeader className={compact ? 'p-3' : 'p-4'}>
                <CardTitle className={`${compact ? 'text-base' : 'text-xl'} line-clamp-2`}>
                    {market.question}
                </CardTitle>
            </CardHeader>
            
            <CardContent className={`space-y-3 ${compact ? 'p-3 pt-0' : 'px-4 pb-4 pt-0'}`}>
                {/* Market Time Display */}
                <MarketTime 
                    endTime={market.endTime} 
                    resolved={market.resolved} 
                    compact={compact} 
                />

                {/* Market Progress Bars */}
                <MarketProgress 
                    market={market} 
                    compact={compact}
                />

                {/* Conditional Components Based on Market State */}
                {isResolved && (
                    <MarketResolved
                        market={market}
                        compact={compact}
                    />
                )}

                {isPending && (
                    <MarketPending
                        market={market}
                        compact={compact}
                    />
                )}

                {/* User Shares Display if they have invested */}
                {account && userShares && userShares.some(share => share > BigInt(0)) && (
                    <MarketSharesDisplay
                        options={market.options}
                        shares={userShares}
                        compact={compact}
                    />
                )}
            </CardContent>

            <CardFooter className={`${compact ? 'p-3 pt-0' : 'px-4 pb-4'} space-y-2 flex flex-col`}>
                {/* Buy Interface for Active Markets */}
                {isActive && (
                    <div className="w-full">
                        {compact ? (
                            // Simplified buttons for compact view
                            <div className="grid grid-cols-2 gap-2">
                                {market.options.slice(0, 2).map((option, idx) => (
                                    <Button 
                                        key={idx}
                                        className="w-full"
                                        variant={idx === 0 ? "default" : "destructive"}
                                        onClick={() => handleBuyClick(idx)}
                                        disabled={!account}
                                    >
                                        Buy
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            // Full buy interface for regular view
                            <MarketBuyInterface
                                ref={buyInterfaceRef}
                                marketId={index}
                                market={market}
                            />
                        )}
                    </div>
                )}

                {/* Market Pool Information */}
                <div className="text-xs text-muted-foreground flex justify-between items-center w-full mt-2">
                    <span>Pool: {(Number(getTotalShares()) / 1e18).toFixed(2)} APE</span>
                    <span className="capitalize">#{index} - {marketCategory}</span>
                </div>
            </CardFooter>
        </Card>
    );
}
