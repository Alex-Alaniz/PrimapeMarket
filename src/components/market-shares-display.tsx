
import { Badge } from "./ui/badge";
import { toEther } from "thirdweb";
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
                <Badge 
                  variant="outline"
                  className={compact ? 'text-xs py-0.5' : ''}
                >
                  {market.options[index]}
                </Badge>
              </div>
              <span>{(Number(shares) / 1e18).toFixed(2)} APE ({percentage}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
