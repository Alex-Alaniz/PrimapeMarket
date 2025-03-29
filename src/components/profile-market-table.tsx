
import { useState } from 'react';
import { useActiveAccount, useReadContract, useSendTransaction } from 'thirdweb/react';
import { contract } from '@/constants/contract';
import { prepareContractCall, toEther } from 'thirdweb';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [buyAmount, setBuyAmount] = useState<string>('0.1');

    // Function to toggle buy interface for a specific market
    const toggleBuyInterface = (marketId: number) => {
        if (expandedMarketId === marketId) {
            setExpandedMarketId(null);
            setSelectedOption(null);
        } else {
            setExpandedMarketId(marketId);
            setSelectedOption(null);
        }
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
            setSelectedOption(null);
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

    // Function to format share numbers
    const formatShares = (sharesInWei: bigint): string => {
        const sharesAsNumber = Number(toEther(sharesInWei));
        return sharesAsNumber.toFixed(2);
    };

    // Calculate P&L
    const calculatePnL = (marketId: number, optionIndex: number, userShares: bigint[], totalShares: bigint[]) => {
        // P&L is potential winnings if the market resolves in user's favor
        const userSharesValue = Number(toEther(userShares[optionIndex]));
        
        if (userSharesValue === 0) {
            return { value: 0, percentage: 0 };
        }

        // Calculate total shares in market
        const totalSharesValue = totalShares.reduce((acc, shares) => acc + Number(toEther(shares)), 0);
        
        // Calculate P&L
        // If user wins, they get their share plus a portion of losing shares
        const winningShares = Number(toEther(totalShares[optionIndex]));
        const losingShares = totalSharesValue - winningShares;
        
        // If there are no winners, return 0
        if (winningShares === 0) {
            return { value: 0, percentage: 0 };
        }
        
        // Calculate potential winnings
        const potentialWinnings = userSharesValue + (userSharesValue / winningShares) * losingShares;
        const pnlValue = potentialWinnings - userSharesValue;
        const pnlPercentage = (pnlValue / userSharesValue) * 100;
        
        return { value: pnlValue, percentage: pnlPercentage };
    };

    const MarketRow = ({ marketId }: { marketId: number }) => {
        // Get market info
        const { data: marketInfo, isLoading: isLoadingMarketInfo } = useReadContract({
            contract,
            method: "function getMarketInfo(uint256 _marketId) view returns (string question, uint256 endTime, bool resolved, uint256 winningOptionIndex)",
            params: [BigInt(marketId)]
        });

        // Get market options
        const { data: marketOptions, isLoading: isLoadingMarketOptions } = useReadContract({
            contract,
            method: "function getMarketOptions(uint256 _marketId) view returns (string[])",
            params: [BigInt(marketId)]
        });

        // Get total shares per option
        const { data: totalSharesData, isLoading: isLoadingTotalShares } = useReadContract({
            contract,
            method: "function getMarketTotalShares(uint256 _marketId) view returns (uint256[])",
            params: [BigInt(marketId)]
        });

        // Get user shares per option
        const { data: userShares, isLoading: isLoadingUserShares } = useReadContract({
            contract,
            method: "function getUserShares(uint256 _marketId, address _user) view returns (uint256[])",
            params: [BigInt(marketId), account]
        });

        if (isLoadingMarketInfo || isLoadingMarketOptions || isLoadingTotalShares || isLoadingUserShares || !account) {
            return (
                <tr>
                    <td colSpan={6} className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            <span>Loading market data...</span>
                        </div>
                    </td>
                </tr>
            );
        }

        if (!marketInfo || !marketOptions || !totalSharesData || !userShares) {
            return null;
        }

        const now = Math.floor(Date.now() / 1000);
        const isActive = now < Number(marketInfo[1]) && !marketInfo[2];
        const isPending = now > Number(marketInfo[1]) && !marketInfo[2];
        const isResolved = marketInfo[2];

        // Match tab selection with market state
        if (
            (selectedTab === 'active' && !isActive) ||
            (selectedTab === 'pending' && !isPending) ||
            (selectedTab === 'resolved' && !isResolved)
        ) {
            return null;
        }

        // For each option in the market
        const marketRows = marketOptions?.map((option, optionIndex) => {
            const userShareAmount = Number(toEther(userShares[optionIndex]));
            
            // Only show options with user shares for this profile view
            if (userShareAmount === 0) return null;

            // Calculate P&L for this option
            const pnl = calculatePnL(marketId, optionIndex, userShares, totalSharesData);

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
                        <div className={`outcome-chip ${
                            option.toLowerCase().includes('yes') ? 'outcome-yes' : 
                            option.toLowerCase().includes('no') ? 'outcome-no' : 
                            'outcome-other'
                        }`}>
                            {option}
                        </div>
                    </td>
                    <td className="py-3">
                        <div className="text-sm font-medium">
                            {userShareAmount.toFixed(3)} APE
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {formatShares(userShares[optionIndex])} shares
                        </div>
                    </td>
                    <td className="py-3">
                        <div className="text-sm font-medium">
                            {userShareAmount.toFixed(3)} APE
                        </div>
                    </td>
                    <td className="py-3">
                        <div className={`text-sm font-medium ${pnl.value > 0 ? 'text-emerald-500' : pnl.value < 0 ? 'text-red-500' : ''}`}>
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
                                onClick={() => {
                                    toggleBuyInterface(marketId);
                                    setSelectedOption(optionIndex);
                                }}
                            >
                                Buy
                            </Button>
                        )}
                        {isResolved && Number(marketInfo[3]) === optionIndex && userShareAmount > 0 && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                    // Claim function
                                    handleClaimWinnings(marketId);
                                }}
                            >
                                Claim
                            </Button>
                        )}
                    </td>
                </tr>
            );
        }).filter(Boolean);

        // Buy interface (expanded when user clicks Buy)
        const buyInterfaceRow = expandedMarketId === marketId && (
            <tr className="bg-slate-900">
                <td colSpan={6} className="p-4">
                    <div className="flex flex-col gap-3">
                        <div className="text-sm font-medium">Buy more shares in {marketInfo[0]}</div>
                        
                        {/* Only show the selected option */}
                        {selectedOption !== null && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
                                <span className="text-sm">{marketOptions[selectedOption]}</span>
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
                                        onClick={() => handleBuyShares(marketId, selectedOption)}
                                        disabled={isBuying !== null}
                                    >
                                        {isBuying === selectedOption ? (
                                            <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Buying</>
                                        ) : 'Buy'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </td>
            </tr>
        );

        // If no options have user shares, don't render this market
        if (!marketRows || marketRows.length === 0) return null;
        
        return (
            <>
                {marketRows}
                {buyInterfaceRow}
            </>
        );
    };

    // Function to handle claiming winnings
    const handleClaimWinnings = async (marketId: number) => {
        if (!account) {
            toast({
                title: "Wallet not connected",
                description: "Please connect your wallet to claim winnings.",
                variant: "destructive",
            });
            return;
        }

        try {
            const transaction = await prepareContractCall({
                contract,
                method: "function claimWinnings(uint256 _marketId)",
                params: [BigInt(marketId)],
            });

            await sendTransaction(transaction);

            toast({
                title: "Success!",
                description: "Claimed your winnings successfully.",
            });
        } catch (error: unknown) {
            const txError = error as TransactionError;
            console.error(txError);
            toast({
                title: "Failed to claim winnings",
                description: txError.message || "There was an error claiming your winnings.",
                variant: "destructive",
            });
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <Input
                    placeholder="Search markets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="active">Current Predictions</TabsTrigger>
                    <TabsTrigger value="pending">Past Predictions</TabsTrigger>
                    <TabsTrigger value="resolved">History</TabsTrigger>
                </TabsList>

                {['active', 'pending', 'resolved'].map((tab) => (
                    <TabsContent key={tab} value={tab}>
                        <div className="rounded-md overflow-hidden">
                            <table className="w-full market-profile-table">
                                <thead>
                                    <tr>
                                        <th>Market</th>
                                        <th>Outcome</th>
                                        <th>Bet</th>
                                        <th>Current value</th>
                                        <th>P&L</th>
                                        <th className="text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingMarketCount ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                                <div className="mt-2">Loading markets...</div>
                                            </td>
                                        </tr>
                                    ) : marketCount && Number(marketCount) > 0 ? (
                                        Array.from({ length: Number(marketCount) }, (_, i) => (
                                            <MarketRow key={i} marketId={i} />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-8">
                                                No markets found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </>
    );
}
