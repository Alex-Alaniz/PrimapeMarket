import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { contract } from "@/constants/contract";
import { Search, Loader2 } from "lucide-react";
import {
    useActiveAccount,
    useReadContract,
    useSendTransaction,
} from "thirdweb/react";
import { toEther } from "thirdweb/utils";
import { prepareContractCall } from "thirdweb";
import Image from "next/image";
import { useState } from "react";

type TransactionError = {
    message?: string;
    [key: string]: unknown;
};

export function ProfileMarketTable() {
    const account = useActiveAccount();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTab, setSelectedTab] = useState("active");
    const [isBuying, setIsBuying] = useState<number | null>(null);
    const { mutate: sendTransaction } = useSendTransaction();

    // Get market count
    const { data: marketCount, isLoading: isLoadingMarketCount } =
        useReadContract({
            contract,
            method: "function marketCount() view returns (uint256)",
            params: [],
        });

    // State to track which market's buy interface is expanded
    const [expandedMarketId, setExpandedMarketId] = useState<number | null>(
        null,
    );
    const [buyAmount, setBuyAmount] = useState<string>("0.1");
    const [expandedOptionIndex, setExpandedOptionIndex] = useState<
        number | null
    >(null);

    // Function to toggle buy interface for a specific market and option
    const toggleBuyInterface = (marketId: number, optionIndex: number) => {
        if (
            expandedMarketId === marketId &&
            expandedOptionIndex === optionIndex
        ) {
            setExpandedMarketId(null);
            setExpandedOptionIndex(null);
        } else {
            setExpandedMarketId(marketId);
            setExpandedOptionIndex(optionIndex);
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
            const amountInWei = BigInt(parseFloat(buyAmount) * 10 ** 18);

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
            setExpandedOptionIndex(null);
        } catch (error: unknown) {
            const txError = error as TransactionError;
            console.error(txError);
            toast({
                title: "Failed to buy shares",
                description:
                    txError.message || "There was an error buying shares.",
                variant: "destructive",
            });
        } finally {
            setIsBuying(null);
        }
    };

    const MarketRow = ({ marketId }: { marketId: number }) => {
        // Get market info
        const { data: marketInfo, isLoading: isLoadingMarketInfo } =
            useReadContract({
                contract,
                method: "function getMarketInfo(uint256 _marketId) view returns (string question, uint256 endTime, bool resolved, uint256 winningOptionIndex)",
                params: [BigInt(marketId)],
            });

        // Get market options
        const { data: marketOptions, isLoading: isLoadingMarketOptions } =
            useReadContract({
                contract,
                method: "function getMarketOptions(uint256 _marketId) view returns (string[])",
                params: [BigInt(marketId)],
            });

        // Get total shares for each option
        const { data: totalSharesData, isLoading: isLoadingTotalShares } =
            useReadContract({
                contract,
                method: "function getMarketTotalShares(uint256 _marketId) view returns (uint256[])",
                params: [BigInt(marketId)],
            });

        // Get user shares
        const { data: userShares, isLoading: isLoadingUserShares } =
            useReadContract({
                contract,
                method: "function getUserShares(uint256 _marketId, address _user) view returns (uint256[])",
                params: [BigInt(marketId), account?.address as string],
            });

        // If any data is loading, show a placeholder
        if (
            isLoadingMarketInfo ||
            isLoadingMarketOptions ||
            isLoadingTotalShares ||
            isLoadingUserShares ||
            !marketInfo
        ) {
            return null;
        }

        // Check market status
        const endTime = Number(marketInfo[1]) * 1000; // Convert to ms
        const isActive = endTime > Date.now() && !marketInfo[2];
        const isResolved = Boolean(marketInfo[2]);
        const isPending = endTime < Date.now() && !isResolved;

        // Filter based on tab
        if (
            (selectedTab === "active" && !isActive) ||
            (selectedTab === "pending" && !isPending) ||
            (selectedTab === "resolved" && !isResolved)
        ) {
            return null;
        }

        // Filter based on search
        if (
            searchQuery &&
            !marketInfo[0].toLowerCase().includes(searchQuery.toLowerCase())
        ) {
            return null;
        }

        // Calculate P&L for each option
        const calculatePnL = (optionIndex: number) => {
            if (!userShares || !totalSharesData)
                return { value: 0, percentage: 0 };

            const userShareAmount = Number(toEther(userShares[optionIndex]));

            // If market is resolved
            if (isResolved) {
                const winningOptionIndex = Number(marketInfo[3]);

                // If this is the winning option
                if (optionIndex === winningOptionIndex) {
                    const totalWinningShares = Number(
                        toEther(totalSharesData[winningOptionIndex]),
                    );
                    let losingShares = 0;

                    for (let i = 0; i < totalSharesData.length; i++) {
                        if (i !== winningOptionIndex) {
                            losingShares += Number(toEther(totalSharesData[i]));
                        }
                    }

                    const potentialWinnings =
                        totalWinningShares > 0
                            ? userShareAmount +
                              (userShareAmount * losingShares) /
                                  totalWinningShares
                            : 0;

                    return {
                        value: potentialWinnings - userShareAmount,
                        percentage:
                            userShareAmount > 0
                                ? (potentialWinnings / userShareAmount - 1) *
                                  100
                                : 0,
                    };
                } else {
                    // If this is a losing option
                    return {
                        value: -userShareAmount,
                        percentage: -100,
                    };
                }
            }
            // For active markets, show potential P&L if this option wins
            else {
                let totalShares = 0;
                const thisOptionShares = Number(
                    toEther(totalSharesData[optionIndex]),
                );

                for (let i = 0; i < totalSharesData.length; i++) {
                    totalShares += Number(toEther(totalSharesData[i]));
                }

                const otherOptionsShares = totalShares - thisOptionShares;

                const potentialWinnings =
                    thisOptionShares > 0
                        ? userShareAmount +
                          (userShareAmount * otherOptionsShares) /
                              thisOptionShares
                        : 0;

                return {
                    value: potentialWinnings - userShareAmount,
                    percentage:
                        userShareAmount > 0
                            ? (potentialWinnings / userShareAmount - 1) * 100
                            : 0,
                };
            }
        };

        // For each option in the market
        const marketRows = marketOptions
            ?.map((option, optionIndex) => {
                const userShareAmount = userShares
                    ? Number(toEther(userShares[optionIndex]))
                    : 0;
                const pnl = calculatePnL(optionIndex);

                // Only show options with user shares for this profile view
                if (userShareAmount === 0) return null;

                // Format shares to avoid exponential notation
                const formattedShares = userShareAmount.toLocaleString(
                    undefined,
                    {
                        maximumFractionDigits: 0,
                    },
                );

                return (
                    <tr
                        key={`${marketId}-${optionIndex}`}
                        className="border-b border-gray-800"
                    >
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
                                    <div className="font-medium truncate max-w-[180px]">
                                        {marketInfo[0]}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {option}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="py-3">
                            <div className="text-sm">
                                {formattedShares} shares
                            </div>
                        </td>
                        <td className="py-3">
                            <div className="text-sm">
                                {userShareAmount.toFixed(3)} APE
                            </div>
                        </td>
                        <td className="py-3">
                            <div
                                className={`text-sm ${pnl.value >= 0 ? "text-green-500" : "text-red-500"}`}
                            >
                                {pnl.value > 0 ? "+" : ""}
                                {pnl.value.toFixed(3)} APE
                            </div>
                            {pnl.percentage !== 0 && (
                                <div
                                    className={`text-xs ${pnl.percentage > 0 ? "text-green-500" : "text-red-500"}`}
                                >
                                    {pnl.percentage > 0 ? "+" : ""}
                                    {pnl.percentage.toFixed(2)}%
                                </div>
                            )}
                        </td>
                        <td className="py-3 text-right pr-4">
                            {isActive && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        toggleBuyInterface(
                                            marketId,
                                            optionIndex,
                                        )
                                    }
                                >
                                    Buy
                                </Button>
                            )}
                            {isResolved &&
                                Number(marketInfo[3]) === optionIndex &&
                                userShareAmount > 0 && (
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
            })
            .filter(Boolean);

        // If no options have user shares, don't render this market
        if (!marketRows || marketRows.length === 0) return null;

        // Buy interface (expanded when user clicks Buy)
        const buyInterfaceRow = expandedMarketId === marketId && (
            <tr className="bg-slate-900">
                <td colSpan={6} className="p-4">
                    <div className="flex flex-col gap-3">
                        <div className="text-sm font-medium">
                            Buy more shares in{" "}
                            {marketOptions?.[expandedOptionIndex || 0]}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
                                <span className="text-sm">
                                    {marketOptions?.[expandedOptionIndex || 0]}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={buyAmount}
                                        onChange={(e) =>
                                            setBuyAmount(e.target.value)
                                        }
                                        className="w-24 text-right"
                                        min="1.00"
                                        step="1.00"
                                    />
                                    <span className="text-xs">APE</span>
                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleBuyShares(
                                                marketId,
                                                expandedOptionIndex || 0,
                                            )
                                        }
                                        disabled={isBuying !== null}
                                    >
                                        {isBuying === expandedOptionIndex ? (
                                            <>
                                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />{" "}
                                                Buying
                                            </>
                                        ) : (
                                            "Buy"
                                        )}
                                    </Button>
                                </div>
                            </div>
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
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="text-xl font-bold">Your Predictions</div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search markets..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex rounded-md overflow-hidden">
                        <Button
                            variant={
                                selectedTab === "active" ? "default" : "outline"
                            }
                            className="rounded-none rounded-l-md"
                            onClick={() => setSelectedTab("active")}
                        >
                            Active
                        </Button>
                        <Button
                            variant={
                                selectedTab === "pending"
                                    ? "default"
                                    : "outline"
                            }
                            className="rounded-none"
                            onClick={() => setSelectedTab("pending")}
                        >
                            Pending
                        </Button>
                        <Button
                            variant={
                                selectedTab === "resolved"
                                    ? "default"
                                    : "outline"
                            }
                            className="rounded-none rounded-r-md"
                            onClick={() => setSelectedTab("resolved")}
                        >
                            Resolved
                        </Button>
                    </div>
                </div>
            </div>

            {isLoadingMarketCount ? (
                <div className="text-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading your predictions...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full market-profile-table">
                        <thead>
                            <tr>
                                <th>Market</th>
                                <th>Bet</th>
                                <th>Current Value</th>
                                <th>P&L</th>
                                <th className="text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from(
                                { length: Number(marketCount) || 0 },
                                (_, i) => (
                                    <MarketRow key={i} marketId={i} />
                                ),
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {!isLoadingMarketCount && (
                <div className="text-center text-sm text-muted-foreground p-4">
                    {marketCount && Number(marketCount) > 0
                        ? "These are all your active predictions."
                        : "You haven't made any predictions yet."}
                </div>
            )}
        </div>
    );
}
