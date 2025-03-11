'use client'

import { Button } from '@/components/ui/button';
import { useActiveAccount, useReadContract, useSendAndConfirmTransaction } from 'thirdweb/react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserMarkets } from '@/hooks/useUserMarkets';
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { contract } from "@/constants/contract";
import { prepareContractCall } from "thirdweb";
import { useToast } from "./ui/use-toast";
import { format } from "date-fns";
import { toEther } from "thirdweb";


interface ActivityItem {
  id: number;
  date: string;
  question: string;
  option: string;
  optionIndex: number;
  shares: string;
  probability: string;
  status: "active" | "past" | "won" | "lost" | "claimed";
  marketId: number;
  canClaim: boolean;
}

interface UserActivityTableProps {
  type: "current" | "past" | "history";
}

export function UserActivityTable({ type }: UserActivityTableProps) {
  const account = useActiveAccount();
  const { toast } = useToast();
  const [activityData, setActivityData] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingMarketId, setClaimingMarketId] = useState<number | null>(null);

  const { mutateAsync: sendTransaction } = useSendAndConfirmTransaction();

  // Get total number of markets
  const { data: marketCount } = useReadContract({
    contract,
    method: "function marketCount() view returns (uint256)",
    params: []
  });

  // Fetch user activity data from the contract
  useEffect(() => {
    if (!account || !marketCount) {
      setIsLoading(false);
      return;
    }

    const fetchUserActivity = async () => {
      setIsLoading(true);
      const activities: ActivityItem[] = [];

      for (let i = 0; i < Number(marketCount); i++) {
        try {
          // Get market info
          const marketInfo = await contract.read.getMarketInfo([BigInt(i)]);
          const marketOptions = await contract.read.getMarketOptions([BigInt(i)]);
          const totalShares = await contract.read.getMarketTotalShares([BigInt(i)]);
          const userShares = await contract.read.getUserShares([BigInt(i), account.address]);
          const hasClaimed = await contract.read.hasClaimed([BigInt(i), account.address]);

          // Check if user has any shares in this market
          const userSharesArray = [...userShares];
          const hasParticipated = userSharesArray.some(shares => shares > BigInt(0));

          if (hasParticipated) {
            // Find which option the user chose (could be multiple)
            for (let j = 0; j < userSharesArray.length; j++) {
              if (userSharesArray[j] > BigInt(0)) {
                // Calculate probability percentage
                const totalPoolShares = [...totalShares].reduce((sum, val) => sum + val, BigInt(0));
                const optionPercentage = totalPoolShares > BigInt(0) 
                  ? Math.round(Number(totalShares[j] * BigInt(100)) / Number(totalPoolShares)) 
                  : 0;

                // Determine status
                let status: ActivityItem['status'];
                let canClaim = false;

                if (!marketInfo[2]) { // Not resolved
                  const now = new Date();
                  const endTime = new Date(Number(marketInfo[1]) * 1000);
                  status = now > endTime ? "past" : "active";
                } else {
                  // Resolved
                  if (Number(marketInfo[3]) === j) {
                    // User bet on winning option
                    status = hasClaimed ? "claimed" : "won";
                    canClaim = !hasClaimed;
                  } else {
                    status = "lost";
                  }
                }

                activities.push({
                  id: i * 100 + j, // Unique ID combining market ID and option index
                  date: format(new Date(Number(marketInfo[1]) * 1000), "yyyy-MM-dd"),
                  question: marketInfo[0],
                  option: marketOptions[j],
                  optionIndex: j,
                  shares: parseFloat(toEther(userSharesArray[j])).toFixed(2),
                  probability: `${optionPercentage}%`,
                  status,
                  marketId: i,
                  canClaim
                });
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching activity for market ${i}:`, error);
        }
      }

      setActivityData(activities);
      setIsLoading(false);
    };

    fetchUserActivity();
  }, [account, marketCount]);

  // Filter data based on tab
  const filteredData = activityData.filter((item) => {
    if (type === "current") return item.status === "active";
    if (type === "past") return item.status === "past";
    if (type === "history") return ["won", "lost", "claimed"].includes(item.status);
    return true;
  });

  // Handle claiming winnings
  const handleClaim = async (marketId: number) => {
    if (!account) return;

    setClaimingMarketId(marketId);

    try {
      const transaction = await prepareContractCall({
        contract,
        method: "function claimWinnings(uint256 _marketId)",
        params: [BigInt(marketId)]
      });

      await sendTransaction(transaction);

      toast({
        title: "Winnings Claimed!",
        description: "Your prediction winnings have been claimed successfully.",
      });

      // Update the status of the claimed market
      setActivityData(prev => prev.map(item => {
        if (item.marketId === marketId) {
          return { ...item, status: "claimed", canClaim: false };
        }
        return item;
      }));
    } catch (error) {
      console.error("Error claiming winnings:", error);
      toast({
        title: "Claim Failed",
        description: "Failed to claim your winnings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setClaimingMarketId(null);
    }
  };

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No {type} predictions found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Your Position</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.date}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{activity.question}</TableCell>
                  <TableCell>{activity.option}</TableCell>
                  <TableCell>{activity.shares} APE</TableCell>
                  <TableCell>{activity.probability}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        activity.status === "active" ? "outline" :
                        activity.status === "past" ? "secondary" :
                        activity.status === "won" ? "default" :
                        activity.status === "claimed" ? "outline" : "destructive"
                      }
                    >
                      {activity.status === "active" ? "Active" :
                       activity.status === "past" ? "Pending" :
                       activity.status === "won" ? "Won" :
                       activity.status === "claimed" ? "Claimed" : "Lost"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {activity.status === "active" && (
                      <Button size="sm" variant="ghost" onClick={() => window.open(`/market/${activity.marketId}`, '_blank')}>
                        View
                      </Button>
                    )}
                    {activity.status === "won" && activity.canClaim && (
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleClaim(activity.marketId)}
                        disabled={claimingMarketId === activity.marketId}
                      >
                        {claimingMarketId === activity.marketId ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Claim
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

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