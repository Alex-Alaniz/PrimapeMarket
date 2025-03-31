'use client'

import { useReadContract } from 'thirdweb/react'
import { contract } from '@/constants/contract'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketCard } from './marketCard'
import { Navbar } from './navbar'
import { Footer } from "./footer"
import { useEffect, useState } from 'react'
// import Image from 'next/image' // Import removed due to unused variable
import { Button } from './ui/button'
import { ChevronRight, TrendingUp, Zap, Globe, Award, Briefcase } from 'lucide-react'
// import Link from 'next/link'

// Market category types
const CATEGORIES = [
  { id: 'all', label: 'All', icon: <Globe className="h-4 w-4" /> },
  { id: 'politics', label: 'Politics', icon: <Award className="h-4 w-4" /> },
  { id: 'crypto', label: 'Crypto', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'sports', label: 'Sports', icon: <Zap className="h-4 w-4" /> },
  { id: 'business', label: 'Business', icon: <Briefcase className="h-4 w-4" /> }
]

export function EnhancedPredictionMarketDashboard() {
    const [activeCategory, setActiveCategory] = useState('all')
    const [_currentCardIndex, setCurrentCardIndex] = useState(0)
    const [isPaused, _setIsPaused] = useState(false)

    const { data: marketCount, isLoading: isLoadingMarketCount } = useReadContract({
        contract,
        method: "function marketCount() view returns (uint256)",
        params: []
    })

    // Modified auto-scroll effect with pause functionality
    useEffect(() => {
        if (!marketCount || Number(marketCount) === 0 || isPaused) {
            return
        }

        const interval = setInterval(() => {
            setCurrentCardIndex((prev) => {
                const nextIndex = prev + 1 >= Number(marketCount) ? 0 : prev + 1
                return nextIndex
            })
        }, 3000)

        return () => clearInterval(interval)
    }, [marketCount, isPaused])

    // Create skeleton cards for loading state
    const skeletonCards = Array(3).fill(0).map((_, index) => (
        <div key={`skeleton-${index}`} className="h-[300px] rounded-lg bg-muted animate-pulse"></div>
    ))

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow container mx-auto p-4">
                <Navbar />

                {/* Category Navigation - Polymarket style */}
                <div className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide no-scrollbar">
                    {CATEGORIES.map((category) => (
                        <Button 
                            key={category.id}
                            variant={activeCategory === category.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveCategory(category.id)}
                            className="flex items-center gap-1 whitespace-nowrap"
                        >
                            {category.icon}
                            <span>{category.label}</span>
                        </Button>
                    ))}
                </div>

                {/* Featured Markets Section Removed */}

                {/* Trending Markets Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Trending Markets</h2>
                    <Button variant="ghost" size="sm" className="gap-1">
                        <span>View All</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Market Cards in Compact Layout - Polymarket style */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-8">
                    {isLoadingMarketCount ? (
                        skeletonCards
                    ) : (
                        Array.from({ length: Math.min(Number(marketCount) || 0, 8) }, (_, index) => (
                            <MarketCard 
                                key={index} 
                                index={index} 
                                filter="active" 
                                category={activeCategory}
                                compact={true}
                                featured={index === 0}
                            />
                        ))
                    )}
                </div>

                {/* Market Categories Tabs - Polymarket style */}
                <Tabs defaultValue="active" className="w-full mb-8">
                    <TabsList className="w-full flex mb-4 p-1 bg-muted/50 overflow-x-auto no-scrollbar">
                        <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
                        <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
                        <TabsTrigger value="resolved" className="flex-1">Resolved</TabsTrigger>
                    </TabsList>

                    {isLoadingMarketCount ? (
                        <TabsContent value="active" className="mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {skeletonCards}
                            </div>
                        </TabsContent>
                    ) : (
                        <>
                            <TabsContent value="active">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {Array.from({ length: Number(marketCount) || 0 }, (_, index) => (
                                        <MarketCard 
                                            key={index} 
                                            index={index} 
                                            filter="active" 
                                            category={activeCategory}
                                            compact={true}
                                        />
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="pending">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {Array.from({ length: Number(marketCount) || 0 }, (_, index) => (
                                        <MarketCard 
                                            key={index} 
                                            index={index} 
                                            filter="pending" 
                                            category={activeCategory}
                                            compact={true}
                                        />
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="resolved">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {Array.from({ length: Number(marketCount) || 0 }, (_, index) => (
                                        <MarketCard 
                                            key={index} 
                                            index={index} 
                                            filter="resolved" 
                                            category={activeCategory}
                                            compact={true}
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