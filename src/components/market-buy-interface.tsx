
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useActiveAccount, useSendAndConfirmTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { contract } from "@/constants/contract";
import { Market } from "@/types/prediction-market";
import { parseEther } from "thirdweb/utils";
import { useToast } from "./ui/use-toast";

interface MarketBuyInterfaceProps {
    marketId: number;
    market: Market;
    _compact?: boolean;
}

export function MarketBuyInterface({ marketId, market, _compact = false }: MarketBuyInterfaceProps) {
    const account = useActiveAccount();
    const { toast } = useToast();
    const { mutateAsync: sendTransaction, isLoading } = useSendAndConfirmTransaction();

    // State for amount
    const [amount, setAmount] = useState<string>("");
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    // Handle buying shares
    const handleBuy = async (optionIndex: number) => {
        if (!account) {
            toast({
                title: "Wallet not connected",
                description: "Please connect your wallet to buy shares",
                variant: "destructive"
            });
            return;
        }

        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            toast({
                title: "Invalid amount",
                description: "Please enter a valid amount",
                variant: "destructive"
            });
            return;
        }

        setSelectedOption(optionIndex);
        
        try {
            const transaction = prepareContractCall({
                contract,
                method: "function buyShares(uint256 _marketId, uint256 _optionIndex)",
                params: [BigInt(marketId), BigInt(optionIndex)],
                value: parseEther(amount)
            });
            
            await sendTransaction({ transaction, account });
            
            toast({
                title: "Purchase successful",
                description: `You purchased shares in the "${market.options[optionIndex]}" option`,
                variant: "default"
            });
            
            setAmount("");
        } catch (error) {
            console.error("Transaction error:", error);
            toast({
                title: "Transaction failed",
                description: "There was an error processing your transaction",
                variant: "destructive"
            });
        }
    };

    return (
        <>
            <div className="market-card-buttons"> {/* Changed this line */}
                {market.options.map((option, index) => (
                    <Button 
                        key={index}
                        className="market-buy-button w-full" {/* Added class here */}
                        onClick={() => handleBuy(index)}
                        variant="outline"
                        disabled={isLoading}
                    >
                        {isLoading && selectedOption === index ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">⟳</span> Processing...
                            </span>
                        ) : (
                            option
                        )}
                    </Button>
                ))}
            </div>
            
            <div className="mt-2">
                <Input
                    type="number"
                    placeholder="Amount (APE)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full"
                    disabled={isLoading}
                />
            </div>
        </>
    );
}
