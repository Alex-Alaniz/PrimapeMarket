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

    // Modified auto-scroll effect with pause functionality
    useEffect(() => {
        if (!marketCount || isPaused) return;
        
        const interval = setInterval(() => {
            setCurrentCardIndex((prev) => 
                prev + 1 >= Number(marketCount) ? 0 : prev + 1
            );
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
                <div className="mb-4 relative h-[400px]">
                    <Image 
                        src={`/images/markets/${currentCardIndex + 1}.jpg`}
                        alt="Market Banner"
                        fill
                        priority
                        className="object-cover rounded-lg transition-all duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                            className="w-[400px] transform transition-all duration-500 hover:scale-105 z-10"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                        >
                            {!isLoadingMarketCount && (
                                <div className="relative">
                                    <MarketCard 
                                        index={currentCardIndex} 
                                        filter="active"
                                    />
                                    <div className="absolute w-full overflow-visible" style={{ top: '100%' }}>
                                        <div className="pt-4">
                                            {/* Market card's expanded content will render here */}
                                        </div>
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
