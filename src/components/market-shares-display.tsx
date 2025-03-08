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
import { Market } from "@/types/prediction-market";

interface MarketSharesDisplayProps {
  market: Market;
  userShares: bigint[];
  compact?: boolean;
}

export function MarketSharesDisplay({ market, userShares, compact = false }: MarketSharesDisplayProps) {
  // Calculate total user shares
  const totalUserShares = userShares.reduce((sum, shares) => sum + shares, BigInt(0));
  
  return (
    <div className={`${compact ? 'space-y-1' : 'space-y-2'}`}>
      <div className="flex justify-between items-center">
        <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium`}>Your Positions</span>
        <span className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
          {(Number(totalUserShares) / 1e18).toFixed(2)} APE
        </span>
      </div>
      
      <div className="space-y-1">
        {userShares.map((shares, index) => {
          if (shares <= BigInt(0)) return null;
          
          // Get percentage of user's total position
          const percentage = totalUserShares > BigInt(0)
            ? Number((shares * BigInt(100)) / totalUserShares)
            : 0;
          
          return (
            <div key={index} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5">
                <span className="truncate max-w-[150px]">{market.options[index]}</span>
              </div>
              <span>{(Number(shares) / 1e18).toFixed(2)} APE ({percentage}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
