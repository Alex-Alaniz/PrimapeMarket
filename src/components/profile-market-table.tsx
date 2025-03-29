
import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { contract } from '@/constants/contract';
import { useState } from 'react';
import { Button } from './ui/button';
import { Search } from 'lucide-react';
import Image from 'next/image';
import { toEther } from 'thirdweb/utils';
import { prepareContractCall } from 'thirdweb';
import { useSendTransaction } from 'thirdweb/react';
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { Input } from './ui/input';

type TransactionError = {
    message?: string;
    [key: string]: unknown;
};

export function ProfileMarketTable() {
    const account = useActiveAccount();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState('active');
    const [isBuying, setIsBuying] = useState<number | null>(null);
    const { mutate: sendTransaction } = useSendTransaction();

    // Get market count
    const { data: marketCount, isLoading: isLoadingMarketCount } = useReadContract({
        contract,
        method: "function marketCount() view returns (uint256)",
        params: []
    });

    // State to track which market's buy interface is expanded
    const [expandedMarketId, setExpandedMarketId] = useState<number | null>(null);
    const [buyAmount, setBuyAmount] = useState<string>('0.1');

    // Function to toggle buy interface for a specific market
    const toggleBuyInterface = (marketId: number) => {
        setExpandedMarketId(expandedMarketId === marketId ? null : marketId);
    };

    // Function to handle share purchase
    const handleBuyShares = async (marketId: number, optionIndex: number) => {
        if (!account) {
            toast({
                title: "Wallet not connected",
                description: "Please connect your wallet to buy shares.",
                variant: "destructive",
            });
            return;
        }

        setIsBuying(optionIndex);
        try {
            const amountInWei = BigInt(parseFloat(buyAmount) * 10**18);
            
            const transaction = await prepareContractCall({
                contract,
                method: "function buyShares(uint256 _marketId, uint256 _optionIndex)",
                params: [BigInt(marketId), BigInt(optionIndex)],
                value: amountInWei,
            });

            await sendTransaction(transaction);

            toast({
                title: "Success!",
                description: `Bought ${buyAmount} APE worth of shares.`,
            });
            
            // Close the buy interface
            setExpandedMarketId(null);
        } catch (error: unknown) {
            const txError = error as TransactionError;
            console.error(txError);
            toast({
                title: "Failed to buy shares",
                description: txError.message || "There was an error buying shares.",
                variant: "destructive",
            });
        } finally {
            setIsBuying(null);
        }
    };

    const MarketRow = ({ marketId }: { marketId: number }) => {
        // Get market info
        const { data: marketInfo, isLoading: isLoadingMarketInfo } = useReadContract({
            contract,
            method: "function getMarketInfo(uint256 _marketId) view returns (string question, uint256 endTime, bool resolved, uint256 winningOptionIndex)",
            params: [BigInt(marketId)]
        });

        // Get market options
        const { data: marketOptions } = useReadContract({
            contract,
            method: "function getMarketOptions(uint256 _marketId) view returns (string[] memory)",
            params: [BigInt(marketId)]
        });

        // Get market total shares
        const { data: totalSharesData } = useReadContract({
            contract,
            method: "function getMarketTotalShares(uint256 _marketId) view returns (uint256[] memory)",
            params: [BigInt(marketId)]
        });

        // Get user shares
        const { data: userShares } = useReadContract({
            contract,
            method: "function getUserShares(uint256 _marketId, address _user) view returns (uint256[] memory)",
            params: [BigInt(marketId), account?.address || "0x0"]
        });

        // Skip rendering if market doesn't match current tab
        if (!marketInfo) return null;
        
        const isResolved = marketInfo[2]; // resolved flag
        const isPending = !isResolved && Number(marketInfo[1]) < Date.now() / 1000; // endTime < now
        const isActive = !isResolved && !isPending;
        
        if ((selectedTab === 'active' && !isActive) || 
            (selectedTab === 'pending' && !isPending) || 
            (selectedTab === 'resolved' && !isResolved)) {
            return null;
        }

        // Filter by search query if present
        if (searchQuery && !marketInfo[0].toLowerCase().includes(searchQuery.toLowerCase())) {
            return null;
        }

        // Calculate user's potential profit/loss for each option
        const calculatePnL = (optionIndex: number) => {
            if (!userShares || !totalSharesData) return { value: 0, percentage: 0 };
            
            const userShareAmount = Number(toEther(userShares[optionIndex]));
            if (userShareAmount === 0) return { value: 0, percentage: 0 };
            
            const winningOptionIndex = isResolved ? Number(marketInfo[3]) : optionIndex;
            
            // If market is resolved and this is not the winning option
            if (isResolved && optionIndex !== winningOptionIndex) {
                return { value: -userShareAmount, percentage: -100 };
            }
            
            // For active markets or winning options in resolved markets
            const totalWinningShares = Number(toEther(totalSharesData[winningOptionIndex]));
            const totalLosingShares = totalSharesData.reduce((sum, shares, idx) => 
                idx !== winningOptionIndex ? sum + Number(toEther(shares)) : sum, 0
            );
            
            const potentialWinnings = userShareAmount + (userShareAmount * totalLosingShares) / totalWinningShares;
            const pnl = potentialWinnings - userShareAmount;
            const pnlPercentage = userShareAmount > 0 ? (pnl / userShareAmount) * 100 : 0;
            
            return { 
                value: pnl, 
                percentage: pnlPercentage
            };
        };

        // For each option in the market
        const marketRows = marketOptions?.map((option, optionIndex) => {
            const userShareAmount = userShares ? Number(toEther(userShares[optionIndex])) : 0;
            const pnl = calculatePnL(optionIndex);
            const sharePrice = totalSharesData && totalSharesData[optionIndex] > 0 
                ? Number(toEther(totalSharesData[optionIndex])) / Number(totalSharesData.reduce((a, b) => a + b, 0n)) 
                : 0;
            
            // Only show options with user shares for this profile view
            if (userShareAmount === 0) return null;
            
            return (
                <tr key={`${marketId}-${optionIndex}`} className="border-b border-gray-800">
                    <td className="py-3 pl-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 relative overflow-hidden rounded-md">
                                <Image 
                                    src={`/images/default-market.jpg`}
                                    alt={marketInfo[0]}
                                    width={32} 
                                    height={32}
                                    className="object-cover"
                                />
                            </div>
                            <div className="text-sm">
                                <div className="font-medium truncate max-w-[180px]">{marketInfo[0]}</div>
                            </div>
                        </div>
                    </td>
                    <td className="py-3">
                        <div className={`text-sm font-medium px-3 py-1 rounded-full inline-block
                            ${optionIndex === 0 ? 'bg-emerald-500/10 text-emerald-500' : 
                              optionIndex === 1 ? 'bg-red-500/10 text-red-500' :
                              optionIndex === 2 ? 'bg-blue-500/10 text-blue-500' :
                              'bg-purple-500/10 text-purple-500'}`}
                        >
                            {option}
                        </div>
                    </td>
                    <td className="py-3 text-right">
                        <div className="font-medium text-sm">{userShareAmount.toFixed(3)} APE</div>
                        <div className="text-xs text-muted-foreground">{(userShareAmount / sharePrice).toFixed(1)} shares</div>
                    </td>
                    <td className="py-3 text-right">
                        <div className="font-medium text-sm">{userShareAmount.toFixed(3)} APE</div>
                        <div className="text-xs text-muted-foreground">@{sharePrice.toFixed(2)} APE/share</div>
                    </td>
                    <td className="py-3 text-right">
                        <div className={`font-medium text-sm ${pnl.value > 0 ? 'text-green-500' : pnl.value < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {pnl.value > 0 ? '+' : ''}{pnl.value.toFixed(3)} APE
                        </div>
                        {pnl.percentage !== 0 && (
                            <div className={`text-xs ${pnl.percentage > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {pnl.percentage > 0 ? '+' : ''}{pnl.percentage.toFixed(2)}%
                            </div>
                        )}
                    </td>
                    <td className="py-3 text-right pr-4">
                        {isActive && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => toggleBuyInterface(marketId)}
                            >
                                Buy
                            </Button>
                        )}
                        {isResolved && Number(marketInfo[3]) === optionIndex && userShareAmount > 0 && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                    // Claim function would go here
                                }}
                            >
                                Claim
                            </Button>
                        )}
                    </td>
                </tr>
            );
        }).filter(Boolean);

        // If no options have user shares, don't render this market
        if (!marketRows || marketRows.length === 0) return null;

        // Buy interface (expanded when user clicks Buy)
        const buyInterfaceRow = expandedMarketId === marketId && (
            <tr className="bg-slate-900">
                <td colSpan={6} className="p-4">
                    <div className="flex flex-col gap-3">
                        <div className="text-sm font-medium">Buy shares in {marketInfo[0]}</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {marketOptions?.map((option, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
                                    <span className="text-sm">{option}</span>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={buyAmount}
                                            onChange={(e) => setBuyAmount(e.target.value)}
                                            className="w-24 text-right"
                                            min="0.01"
                                            step="0.01"
                                        />
                                        <span className="text-xs">APE</span>
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleBuyShares(marketId, idx)}
                                            disabled={isBuying !== null}
                                        >
                                            {isBuying === idx ? (
                                                <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Buying</>
                                            ) : 'Buy'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </td>
            </tr>
        );

        return (
            <>
                {marketRows}
                {buyInterfaceRow}
            </>
        );
    };

    return (
        <div className="w-full">
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <div className="flex border-b border-gray-800 w-full sm:w-auto">
                        <button 
                            className={`px-4 py-2 font-medium text-sm ${selectedTab === 'active' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
                            onClick={() => setSelectedTab('active')}
                        >
                            Current Predictions
                        </button>
                        <button 
                            className={`px-4 py-2 font-medium text-sm ${selectedTab === 'pending' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
                            onClick={() => setSelectedTab('pending')}
                        >
                            Past Predictions
                        </button>
                        <button 
                            className={`px-4 py-2 font-medium text-sm ${selectedTab === 'resolved' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
                            onClick={() => setSelectedTab('resolved')}
                        >
                            History
                        </button>
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search positions..."
                            className="w-full sm:w-[250px] pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {isLoadingMarketCount ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left text-gray-400 border-b border-gray-800">
                            <tr>
                                <th className="py-3 pl-4 font-medium">Market</th>
                                <th className="py-3 font-medium">Outcome</th>
                                <th className="py-3 font-medium text-right">Bet</th>
                                <th className="py-3 font-medium text-right">Current value</th>
                                <th className="py-3 font-medium text-right">P&L</th>
                                <th className="py-3 font-medium text-right pr-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: Number(marketCount) || 0 }, (_, index) => (
                                <MarketRow key={index} marketId={index} />
                            ))}
                        </tbody>
                    </table>
                    {Array.from({ length: Number(marketCount) || 0 }).length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            No predictions found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
