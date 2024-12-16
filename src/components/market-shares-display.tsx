import { Badge } from "./ui/badge";
import { toEther } from "thirdweb";
import { Market } from "@/types/prediction-market";

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
    return (
        <div className={`flex flex-col ${compact ? 'gap-1' : 'gap-2'}`}>
            <div className="w-full text-sm text-muted-foreground">
                Your shares:
                <div className="flex flex-wrap gap-2 mt-1">
                    {market.options.map((option, index) => {
                        const shares = userShares[index] || BigInt(0);
                        const sharesInEther = Number(toEther(shares)).toFixed(2);
                        return (
                            <Badge 
                                key={index} 
                                variant={Number(sharesInEther) > 0 ? "default" : "secondary"}
                                className={compact ? 'text-xs py-0.5' : ''}
                            >
                                {option}: {sharesInEther}
                            </Badge>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
