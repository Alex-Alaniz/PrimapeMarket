import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { market } from "@/constants/testData";
import { useActiveAccount, useWriteContract } from "thirdweb/react";
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

    // State for amount
    const [amount, setAmount] = useState<string>("");
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    // Contract write hook
    const { mutate: buyShares, isLoading } = useWriteContract({
        contract,
        account,
        method: "function buyShares(uint256 _marketId, uint256 _optionIndex)",
        params: [BigInt(marketId), selectedOption !== null ? BigInt(selectedOption) : BigInt(0)],
        value: amount ? parseEther(amount) : BigInt(0)
    });

    // Handle buying shares
    const handleBuy = (optionIndex: number) => {
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

        buyShares({
            contract,
            account,
            method: "function buyShares(uint256 _marketId, uint256 _optionIndex)",
            params: [BigInt(marketId), BigInt(optionIndex)],
            value: parseEther(amount)
        })
            .then(() => {
                toast({
                    title: "Shares purchased!",
                    description: `You bought ${amount} APCH of ${market.options[optionIndex]}`,
                    variant: "default"
                });
                setAmount("");
            })
            .catch((error) => {
                toast({
                    title: "Failed to buy shares",
                    description: error.message,
                    variant: "destructive"
                });
            });
    };

    return (
        <>
            <div className="market-card-buttons">
                {market.options.map((option, index) => (
                    <Button 
                        key={index}
                        className="market-buy-button w-full"
                        onClick={() => handleBuy(index)}
                        disabled={isLoading}
                        variant={selectedOption === index ? "default" : "outline"}
                        size={_compact ? "sm" : "default"}
                    >
                        {option}
                    </Button>
                ))}
            </div>

            <div className="mt-3">
                <Input
                    type="number"
                    placeholder="Amount in APCH"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-center"
                    disabled={isLoading}
                />
            </div>
        </>
    );
}