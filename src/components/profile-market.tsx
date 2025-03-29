import { useReadContract } from 'thirdweb/react'
import { contract } from '@/constants/contract'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketCard } from './marketCard'
// import Image from 'next/image'
// import { Button } from './ui/button'
// import { ChevronRight, TrendingUp, Zap, Globe, Award, Briefcase } from 'lucide-react'
import { useEffect, useState } from 'react'

export const ProfileMarket = () => {
    // const [activeCategory, setActiveCategory] = useState('all')
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
    // Create skeleton cards for loading state
    const skeletonCards = Array(3).fill(0).map((_, index) => (
        <div key={`skeleton-${index}`} className="h-[300px] rounded-lg bg-muted animate-pulse"></div>
    ))
    return (
        <>
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
                                        category={"all"}
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
                                        category={"all"}
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
                                        category={"all"}
                                        compact={true}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </>
    )
}
// export default ProfileMarket