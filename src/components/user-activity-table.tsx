'use client'

import { Button } from '@/components/ui/button';
import { useActiveAccount } from 'thirdweb/react';
import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserMarkets } from '@/hooks/useUserMarkets';

interface UserActivityTableProps {
  type: 'current' | 'past' | 'history';
}

// This is example data - replace with actual data from your contract
const _mockData = [
  {
    id: 1,
    market: 'Will ETH surpass $10k in 2025?',
    outcome: 'Yes',
    bet: '1.2 APE',
    currentValue: '1.5 APE',
    pnl: '+0.3 APE',
    pnlPercentage: '+25%',
    shares: '10.52 shares @0.12 APE',
    valuePerShare: '@0.14 APE/share',
  },
  {
    id: 2,
    market: 'Will ApeChain exceed 100k transactions per day in Q1 2025?',
    outcome: 'No',
    bet: '0.8 APE',
    currentValue: '0.5 APE',
    pnl: '-0.3 APE',
    pnlPercentage: '-37.5%',
    shares: '8.33 shares @0.10 APE',
    valuePerShare: '@0.06 APE/share',
  },
  {
    id: 3,
    market: 'Will $APE reach $50 by the end of 2025?',
    outcome: 'Yes',
    bet: '2.0 APE',
    currentValue: '2.2 APE',
    pnl: '+0.2 APE',
    pnlPercentage: '+10%',
    shares: '20.0 shares @0.10 APE',
    valuePerShare: '@0.11 APE/share',
  },
];

export function UserActivityTable({ type }: UserActivityTableProps) {
  const account = useActiveAccount();
  const { markets, loading } = useUserMarkets(type);

  if (!account) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Connect your wallet to view your predictions</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 grid grid-cols-12 text-sm font-medium text-muted-foreground border-b">
        <div className="col-span-5">Market</div>
        <div className="col-span-1">Outcome</div>
        <div className="col-span-2 text-right">Bet</div>
        <div className="col-span-2 text-right">Current value</div>
        <div className="col-span-1 text-right">PNL</div>
        <div className="col-span-1 text-right">Action</div>
      </div>

      {markets.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No predictions found</p>
        </div>
      ) : (
        <div>
          {markets.map((item) => (
            <div 
              key={item.id} 
              className="p-4 grid grid-cols-12 text-sm border-b hover:bg-muted/50 transition-colors"
            >
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                  🔮
                </div>
                <span className="font-medium">{item.question}</span>
              </div>

              <div className="col-span-1">
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  item.outcome === 'Yes' ? "bg-green-100 text-green-800" : 
                  item.outcome === 'No' ? "bg-red-100 text-red-800" : 
                  "bg-blue-100 text-blue-800"
                )}>
                  {item.outcome}
                </span>
              </div>

              <div className="col-span-2 text-right">
                <div>{item.betAmount} APE</div>
                <div className="text-xs text-muted-foreground">
                  {item.shares} shares @{parseFloat(item.betAmount) / parseFloat(item.shares)} APE
                </div>
              </div>

              <div className="col-span-2 text-right">
                <div>{item.currentValue} APE</div>
                <div className="text-xs text-muted-foreground">
                  @{item.valuePerShare} APE/share
                </div>
              </div>

              <div className="col-span-1 text-right">
                <div className={cn(
                  "font-medium",
                  item.pnl.startsWith('+') ? "text-green-600" : "text-red-600"
                )}>
                  {item.pnl} APE
                </div>
                <div className={cn(
                  "text-xs",
                  item.pnlPercentage.startsWith('+') ? "text-green-600" : "text-red-600"
                )}>
                  {item.pnlPercentage}%
                </div>
              </div>

              <div className="col-span-1 text-right">
                {type === 'current' && !item.resolved && (
                  <Button size="sm" variant="outline">
                    Sell
                  </Button>
                )}
                {item.resolved && !item.claimed && (
                  <Button size="sm" variant="outline">
                    Claim
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}