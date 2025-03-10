import { useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useActiveAccount, useSendAndConfirmTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { contract } from "@/constants/contract";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import { Market } from "@/types/prediction-market";
import { FeeCalculator } from "./fee-calculator";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

interface MarketBuyInterfaceProps {
    marketId: number;
    market: Market;
    _compact?: boolean;
}

export type BuyInterfaceHandle = {
    handleBuy: (optionIndex: number) => void;
};

type TransactionError = {
    message?: string;
    [key: string]: unknown;
};

export const MarketBuyInterface = forwardRef<BuyInterfaceHandle, MarketBuyInterfaceProps>(
    ({ marketId, market, _compact = false }, ref) => {
        const account = useActiveAccount();
        const { mutateAsync: mutateTransaction } = useSendAndConfirmTransaction();
        const { toast } = useToast();

        const [isModalOpen, setIsModalOpen] = useState(false);
        const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
        const [amount, setAmount] = useState(0);
        const [isConfirming, setIsConfirming] = useState(false);
        const [error, setError] = useState<string | null>(null);

        const handleBuy = (optionIndex: number) => {
            if (!account) {
                toast({
                    title: "Not connected",
                    description: "Please connect your wallet first",
                    variant: "destructive",
                });
                return;
            }

            setSelectedOptionIndex(optionIndex);
            setIsModalOpen(true);
        };

        // Expose the handleBuy method via the ref
        useImperativeHandle(ref, () => ({
            handleBuy
        }));

        const handleCancel = () => {
            setIsModalOpen(false);
            setSelectedOptionIndex(null);
            setAmount(0);
            setError(null);
        };

        const handleConfirm = async () => {
            if (selectedOptionIndex === null || amount <= 0) {
                setError("Must select an option and enter an amount greater than 0");
                return;
            }

            setIsConfirming(true);
            try {
                const tx = await prepareContractCall({
                    contract,
                    method: "function buyShares(uint256 _marketId, uint256 _optionIndex)",
                    params: [BigInt(marketId), BigInt(selectedOptionIndex)],
                    value: BigInt(amount * 1e18) // Convert amount to wei
                });

                await mutateTransaction(tx);

                toast({
                    title: "Purchase Successful!",
                    description: `You bought ${amount} ${market.options[selectedOptionIndex]} shares`,
                    duration: 5000,
                });

                handleCancel();
            } catch (error: unknown) {
                const txError = error as TransactionError;
                console.error(txError);
                setError(txError.message || "Transaction failed");
                toast({
                    title: "Transaction Failed",
                    description: txError.message || "Failed to complete purchase",
                    variant: "destructive",
                });
            } finally {
                setIsConfirming(false);
            }
        };

        // Determine the grid layout based on number of options
        const _getGridLayout = () => {
            const optionCount = market.options.length;
            if (optionCount <= 2) return "grid-cols-2";
            if (optionCount <= 4) return "grid-cols-2";
            return "grid-cols-2 sm:grid-cols-3";
        };

        // Determine button size based on number of options
        const _getButtonSize = () => {
            const optionCount = market.options.length;
            if (optionCount <= 2) return "h-10";
            if (optionCount <= 4) return "h-9 text-sm";
            return "h-8 text-xs py-1";
        };

        return (
            <>
                {/* We don't need the buttons here anymore as they're in the MarketCard component */}
                {/* This component now only handles the buy modal logic */}

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogTitle className="text-lg font-bold">
                            Confirm Purchase
                        </DialogTitle>
                        <div className="flex flex-col gap-4">
                            {error && (
                                <div className="p-2 bg-red-100 text-red-800 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Amount ($APE)
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={amount === 0 ? "" : amount}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setAmount(value === "" ? 0 : parseFloat(value) || 0);
                                    }}
                                    placeholder="Enter amount"
                                    className="focus:bg-background-50"
                                />
                            </div>

                            <p className="text-sm text-gray-500">
                                You are buying shares in: {market.options[selectedOptionIndex!]}
                            </p>

                            {amount > 0 && (
                                <div className="border-t pt-4">
                                    <FeeCalculator amount={amount} />
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    disabled={isConfirming}
                                    className="w-24"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    disabled={isConfirming || amount <= 0}
                                    className={`w-32 ${
                                        market.options.length <= 2 
                                            ? (selectedOptionIndex === 0
                                                ? "bg-green-500 hover:bg-green-600"
                                                : "bg-red-500 hover:bg-red-600")
                                            : "bg-green-500 hover:bg-green-600"
                                    }`}
                                >
                                    {isConfirming ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Confirming...
                                        </>
                                    ) : (
                                        'Confirm Purchase'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }
);

MarketBuyInterface.displayName = "MarketBuyInterface";