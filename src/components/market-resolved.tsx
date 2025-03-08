import { Button } from "./ui/button";
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";
import { contract } from "@/constants/contract";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type TransactionError = {
    message?: string;
    [key: string]: unknown;
};

interface MarketResolvedProps {
    marketId: number;
    winningOptionIndex: number;
    options: string[];
    totalShares: bigint[];
    userShares: bigint[];
    _compact?: boolean;
}

export function MarketResolved({ 
    marketId,
    winningOptionIndex,
    options,
    totalShares,
    userShares,
    _compact = false
}: MarketResolvedProps) {
    const { mutate: sendTransaction } = useSendTransaction();
    const { toast } = useToast();
    const [isClaiming, setIsClaiming] = useState(false);
    
    // Calculate potential winnings
    const winningShares = Number(userShares[winningOptionIndex]);
    const totalWinningShares = Number(totalShares[winningOptionIndex]);
    const totalLosingShares = totalShares.reduce((sum, shares, index) => 
        index !== winningOptionIndex ? sum + Number(shares) : sum, 0
    );
    
    const potentialWinnings = winningShares > 0 && totalWinningShares > 0
        ? winningShares + (winningShares * totalLosingShares) / totalWinningShares
        : 0;

    const handleClaimRewards = async () => {
        if (potentialWinnings <= 0) {
            toast({
                title: "No winnings to claim",
                description: "You don't have any winning shares in this market.",
                variant: "destructive",
            });
            return;
        }

        setIsClaiming(true);
        try {
            const transaction = await prepareContractCall({
                contract,
                method: "function claimWinnings(uint256 _marketId)",
                params: [BigInt(marketId)],
            });

            await sendTransaction(transaction);
            
            toast({
                title: "Success!",
                description: `Claimed ${potentialWinnings.toFixed(4)} APE successfully.`,
            });
        } catch (error: unknown) {
            const txError = error as TransactionError;
            console.error(txError);
            toast({
                title: "Failed to claim",
                description: txError.message || "There was an error claiming your rewards.",
                variant: "destructive",
            });
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="mb-2 bg-green-200 p-3 rounded-md text-center">
                <div className="text-xs text-green-800 font-medium mb-1">
                    Market Resolved
                </div>
                <div className="text-sm font-semibold text-green-900">
                    Winner: {options[winningOptionIndex]}
                </div>
                {potentialWinnings > 0 && (
                    <div className="mt-2 text-sm text-green-800">
                        <div>Your Winning Shares: {winningShares}</div>
                        <div className="font-medium">
                            Potential Winnings: {potentialWinnings.toFixed(4)} APE
                        </div>
                    </div>
                )}
            </div>
            {potentialWinnings > 0 && (
                <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleClaimRewards}
                    disabled={isClaiming}
                >
                    {isClaiming ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Claiming...
                        </>
                    ) : (
                        'Claim Rewards'
                    )}
                </Button>
            )}
        </div>
    );
}