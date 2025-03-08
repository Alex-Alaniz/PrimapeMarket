// Using prefix _ to indicate these imports are intentionally unused
import { Progress as _Progress } from "@/components/ui/progress";
import { toEther as _toEther } from "thirdweb/utils";
import { cn as _cn } from "@/lib/utils";
import { useEffect as _useEffect, useState as _useState } from "react";

interface MarketProgressProps {
    options: string[];
    totalShares: bigint[];
    _compact?: boolean;
}

// Renamed back to uppercase as React components should start with uppercase letter
export function MarketProgress({ options, totalShares, _compact = false }: MarketProgressProps) {
    const totalPool = totalShares.reduce((sum, shares) => sum + shares, BigInt(0));

    // Get color based on option index - Polymarket inspired
    const getOptionColor = (index: number) => {
        const colors = [
            'bg-emerald-500', // Yes/Green
            'bg-red-500',     // No/Red
            'bg-blue-500',    // Option 3
            'bg-purple-500',  // Option 4
            'bg-amber-500'    // Option 5
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="space-y-2">
            {options.map((option, index) => {
                // Calculate percentage
                let percentage = 0;
                if (totalPool > BigInt(0)) {
                    percentage = Math.round(Number(totalShares[index] * BigInt(100)) / Number(totalPool));
                }

                return (
                    <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${getOptionColor(index)}`}></div>
                                <span className={`${_compact ? 'text-xs' : 'text-sm'} font-medium`}>{option}</span>
                            </div>
                            <span className={`${_compact ? 'text-xs' : 'text-sm'} font-medium`}>{percentage}%</span>
                        </div>
                        <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className={`h-full ${getOptionColor(index)}`}
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}