import { Badge } from "./ui/badge";
import { toEther } from "thirdweb";
import { Market } from "@/types/prediction-market";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface MarketSharesDisplayProps {
    market: Market;
    userShares: bigint[];
    compact?: boolean;
}

export function MarketSharesDisplay({
    market,
    userShares,
    compact = false
}: MarketSharesDisplayProps) {
    // Only show options where user has shares
    const optionsWithShares = market.options.map((option, index) => {
        const shares = userShares && userShares[index] ? userShares[index] : BigInt(0);
        const sharesInEther = Number(toEther(shares)).toFixed(2);
        return { option, shares, sharesInEther, index };
    }).filter(item => Number(item.sharesInEther) > 0);

    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to next share every 5 seconds
    useEffect(() => {
        if (optionsWithShares.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % optionsWithShares.length);
        }, 5000);
        
        return () => clearInterval(interval);
    }, [optionsWithShares.length]);

    // If no shares, return null
    if (optionsWithShares.length === 0) return null;

    const handlePrev = () => {
        setCurrentIndex(prev => 
            prev === 0 ? optionsWithShares.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex(prev => 
            (prev + 1) % optionsWithShares.length
        );
    };

    return (
        <div className="flex flex-col">
            <div className="w-full text-sm text-muted-foreground mb-1">
                Your shares:
            </div>
            <div className="flex items-center">
                {optionsWithShares.length > 1 && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 p-0" 
                        onClick={handlePrev}
                    >
                        <ChevronLeft className="h-3 w-3" />
                    </Button>
                )}
                
                <div 
                    ref={containerRef} 
                    className="flex overflow-x-hidden scroll-smooth flex-1"
                >
                    {optionsWithShares.map((item, idx) => (
                        <div 
                            key={item.index} 
                            className={`flex-shrink-0 transition-transform duration-300 w-full ${
                                idx === currentIndex ? 'block' : 'hidden'
                            }`}
                        >
                            <Badge 
                                variant="default"
                                className={compact ? 'text-xs py-0.5' : ''}
                            >
                                {item.option}: {item.sharesInEther}
                            </Badge>
                        </div>
                    ))}
                </div>
                
                {optionsWithShares.length > 1 && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 p-0" 
                        onClick={handleNext}
                    >
                        <ChevronRight className="h-3 w-3" />
                    </Button>
                )}
                
                {optionsWithShares.length > 1 && (
                    <div className="flex gap-1 ml-1">
                        {optionsWithShares.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`h-1 w-1 rounded-full ${
                                    idx === currentIndex ? 'bg-primary' : 'bg-muted'
                                }`}
                                onClick={() => setCurrentIndex(idx)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
