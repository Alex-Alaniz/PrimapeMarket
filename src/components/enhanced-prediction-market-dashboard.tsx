'use client'

import { useReadContract } from 'thirdweb/react'
import { contract } from '@/constants/contract'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketCard } from './marketCard'
import { Navbar } from './navbar'
import { MarketCardSkeleton } from './market-card-skeleton'
import { Footer } from "./footer"
import { useEffect, useState } from 'react';
import Image from 'next/image';

export function EnhancedPredictionMarketDashboard() {
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const { data: marketCount, isLoading: isLoadingMarketCount } = useReadContract({
        contract,
        method: "function marketCount() view returns (uint256)",
        params: []
    });

    console.log('Market Count:', marketCount ? Number(marketCount) : 'Loading...');
    console.log('Is Loading:', isLoadingMarketCount);

    // Modified auto-scroll effect with pause functionality
    useEffect(() => {
        if (!marketCount || Number(marketCount) === 0 || isPaused) {
            console.log('Effect skipped:', { marketCount, isPaused });
            return;
        }

        const interval = setInterval(() => {
            setCurrentCardIndex((prev) => {
                const nextIndex = prev + 1 >= Number(marketCount) ? 0 : prev + 1;
                console.log('Updating card index:', nextIndex);
                return nextIndex;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [marketCount, isPaused]);

    // Show 6 skeleton cards while loading
    const skeletonCards = Array.from({ length: 6 }, (_, i) => (
        <MarketCardSkeleton key={`skeleton-${i}`} />
    ));

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow container mx-auto p-4">
                <Navbar />
                {/* Featured Hero Market */}
                <div className="mb-10 -mx-4 px-4 py-8 bg-gradient-to-br from-primary/10 via-background to-accent/5 border-y border-border/20">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl font-extrabold mb-2 flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-full bg-primary"></span>
                            Featured Market
                        </h2>
                        <p className="text-muted-foreground mb-6">Join thousands of traders predicting market outcomes</p>
                        {marketCount > 0 && (
                            <MarketCard index={0} filter="all" featured={true} />
                        )}
                    </div>
                </div>
                <div className="mb-8 relative h-[450px] overflow-visible rounded-xl">
                    <Image 
                        src={`/images/markets/${currentCardIndex + 1}.jpg`}
                        alt="Market Banner"
                        fill
                        priority
                        className="object-cover brightness-50 transition-all duration-500"
                    />
                    <div className="absolute inset-0 flex items-start justify-center pt-8">
                        <div 
                            className="w-[450px] max-w-[85%] transform transition-all duration-500 hover:scale-[1.02] z-10"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            {!isLoadingMarketCount && (
                                <div className="relative bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
                                    <div className="max-h-[420px] overflow-y-auto">
                                        <MarketCard 
                                            index={currentCardIndex} 
                                            filter="active"
                                            featured={true}
                                            compact={true}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="pending">Pending Resolution</TabsTrigger>
                        <TabsTrigger value="resolved">Resolved</TabsTrigger>
                    </TabsList>

                    {isLoadingMarketCount ? (
                        <TabsContent value="active" className="mt-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {skeletonCards}
                            </div>
                        </TabsContent>
                    ) : (
                        <>
                            <TabsContent value="active">
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {Array.from({ length: Number(marketCount) }, (_, index) => (
                                        <MarketCard 
                                            key={index} 
                                            index={index} 
                                            filter="active"
                                        />
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="pending">
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {Array.from({ length: Number(marketCount) }, (_, index) => (
                                        <MarketCard 
                                            key={index} 
                                            index={index}
                                            filter="pending"
                                        />
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="resolved">
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {Array.from({ length: Number(marketCount) }, (_, index) => (
                                        <MarketCard 
                                            key={index} 
                                            index={index}
                                            filter="resolved"
                                        />
                                    ))}
                                </div>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
            <Footer />
        </div>
    );
}