import { Progress } from "@/components/ui/progress";
import { toEther } from "thirdweb";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface MarketProgressProps {
    options: string[];
    totalShares: bigint[];
    _compact?: boolean;
}

export function MarketProgress({ options, totalShares, _compact = false }: MarketProgressProps) {
    const [processedShares, setProcessedShares] = useState<bigint[]>([]);

    useEffect(() => {
        if (!totalShares) {
            setProcessedShares(options.map(() => BigInt(0)));
            return;
        }

        const shares = totalShares.map((share: bigint | string | number) => {
            try {
                if (typeof share === 'bigint') return share;
                if (typeof share === 'string') return BigInt(share);
                if (typeof share === 'number') return BigInt(share);
                return BigInt(0);
            } catch {
                console.warn('Invalid share value:', share);
                return BigInt(0);
            }
        });
        
        setProcessedShares(shares);
    }, [totalShares, options]);

    // Calculate total sum from processed shares
    const totalSum = processedShares.reduce((sum, share) => sum + share, BigInt(0));

    return (
        <div className="space-y-3">
            {options.map((option, index) => {
                const currentShares = processedShares[index] || BigInt(0);
                const percentage = totalSum > BigInt(0)
                    ? Number((currentShares * BigInt(10000) / totalSum)) / 100
                    : 0;
                const shareAmount = Number(toEther(currentShares));

                return (
                    <div key={index} className="transition-opacity duration-300">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">
                                    {option}: {shareAmount.toFixed(2)}
                                </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {percentage.toFixed(1)}%
                            </span>
                        </div>
                        <Progress 
                            value={percentage} 
                            className={cn(
                                "h-3",
                                "bg-black/10 [&>div]:bg-black"
                            )}
                        />
                    </div>
                );
            })}
        </div>
    );
}