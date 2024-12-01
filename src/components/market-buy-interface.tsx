import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useRef, useEffect } from "react";
import { useActiveAccount, useSendAndConfirmTransaction } from "thirdweb/react";
import { prepareContractCall, readContract, toWei } from "thirdweb";
import { contract, tokenContract } from "@/constants/contract";
import { approve } from "thirdweb/extensions/erc20";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast"

// Types for the component props
interface MarketBuyInterfaceProps {
    marketId: number;
    market: {
        optionA: string;
        optionB: string;
        question: string;
    };
}

// Type aliases for better readability
type BuyingStep = 'initial' | 'allowance' | 'confirm';
type Option = 'A' | 'B' | null;

export function MarketBuyInterface({ marketId, market }: MarketBuyInterfaceProps) {
    // Blockchain interactions
    const account = useActiveAccount();
    const { mutateAsync: mutateTransaction } = useSendAndConfirmTransaction();
    const { toast } = useToast()

    // UI state management
    const [isBuying, setIsBuying] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [containerHeight, setContainerHeight] = useState('auto');
    const contentRef = useRef<HTMLDivElement>(null);

    // Transaction state
    const [selectedOption, setSelectedOption] = useState<Option>(null);
    const [amount, setAmount] = useState(0);
    const [buyingStep, setBuyingStep] = useState<BuyingStep>('initial');
    const [isApproving, setIsApproving] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    // Add to state variables
    const [error, setError] = useState<string | null>(null);

    // Update container height when content changes
    useEffect(() => {
        if (contentRef.current) {
            setTimeout(() => {
                setContainerHeight(`${contentRef.current?.offsetHeight || 0}px`);
            }, 0);
        }
    }, [isBuying, buyingStep, isVisible, error]);

    // Handlers for user interactions
    const handleBuy = (option: 'A' | 'B') => {
        setIsVisible(false);
        setTimeout(() => {
            setIsBuying(true);
            setSelectedOption(option);
            setIsVisible(true);
        }, 200); // Match transition duration
    };

    const handleCancel = () => {
        setIsVisible(false);
        setTimeout(() => {
            setIsBuying(false);
            setBuyingStep('initial');
            setSelectedOption(null);
            setAmount(0);
            setError(null);
            setIsVisible(true);
        }, 200);
    };

    // Check if user needs to approve token spending
    const checkApproval = async () => {
        if (amount <= 0) {
            setError("Amount must be greater than 0");
            return;
        }
        setError(null);

        try {
            const userAllowance = await readContract({
                contract: tokenContract,
                method: "function allowance(address owner, address spender) view returns (uint256)",
                params: [account?.address as string, contract.address]
            });

            setBuyingStep(userAllowance < BigInt(toWei(amount.toString())) ? 'allowance' : 'confirm');
        } catch (error) {
            console.error(error);
        }
    };

    // Add this debug function at the top of your component
    const debugContractAddresses = async () => {
        console.log("Contract Addresses:", {
            predictionContract: contract.address,
            tokenContract: tokenContract.address,
            bettingTokenFromContract: await readContract({
                contract,
                method: "function bettingToken() view returns (address)",
                params: []
            })
        });
    };

    // Modify handleSetApproval to use this check
    const handleSetApproval = async () => {
        setIsApproving(true);
        try {
            // Verify contract setup
            const contractInfo = await debugContractAddresses();
            const bettingToken = await readContract({
                contract,
                method: "function bettingToken() view returns (address)",
                params: []
            });

            // Validate token addresses match
            if (bettingToken.toLowerCase() !== tokenContract.address.toLowerCase()) {
                throw new Error(`Token mismatch: Contract expects ${bettingToken}, but using ${tokenContract.address}`);
            }

            const amountInTokenDecimals = await convertToTokenDecimals(amount);
            
            console.log("Approval Details:", {
                tokenBeingApproved: tokenContract.address,
                spenderAddress: contract.address,
                amount: amountInTokenDecimals
            });

            // Prepare and send approval transaction
            const tx = await prepareContractCall({
                contract: tokenContract,
                method: "function approve(address spender, uint256 amount) returns (bool)",
                params: [contract.address, BigInt(amountInTokenDecimals)]
            });

            // Wait for transaction to be confirmed
            const result = await mutateTransaction(tx);
            console.log("Approval transaction confirmed:", result);
            
            // Add a small delay to allow the blockchain to update
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Verify allowance after approval
            const newAllowance = await readContract({
                contract: tokenContract,
                method: "function allowance(address owner, address spender) view returns (uint256)",
                params: [account?.address as string, contract.address]
            });
            
            console.log("Allowance verification:", {
                owner: account?.address,
                spender: contract.address,
                allowance: newAllowance.toString()
            });

            if (BigInt(newAllowance) < BigInt(amountInTokenDecimals)) {
                throw new Error("Approval failed: Allowance not set correctly");
            }

            setBuyingStep('confirm');
            
            toast({
                title: "Approval Successful",
                description: "You can now proceed with the purchase.",
                duration: 5000,
            });
        } catch (error: any) {
            console.error("Approval error:", error);
            toast({
                title: "Approval Failed",
                description: error?.message || "Failed to approve token spending. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsApproving(false);
        }
    };

    // Handle share purchase transaction
    const handleConfirm = async () => {
        if (!selectedOption || amount <= 0) {
            setError("Must select an option and enter an amount greater than 0");
            return;
        }

        setIsConfirming(true);
        try {
            const amountInWei = toWei(amount.toString());
            
            // Final allowance check
            const finalCheck = await readContract({
                contract: tokenContract,
                method: "function allowance(address owner, address spender) view returns (uint256)",
                params: [account?.address as string, contract.address]
            });
            
            console.log("Final pre-purchase checks:", {
                requiredAmount: amountInWei.toString(),
                currentAllowance: finalCheck.toString(),
                marketId,
                isOptionA: selectedOption === 'A',
                userAddress: account?.address,
                marketContract: contract.address,
                tokenContract: tokenContract.address
            });

            if (finalCheck < BigInt(amountInWei)) {
                throw new Error(`Insufficient allowance. Required: ${amountInWei}, Got: ${finalCheck}`);
            }

            // Proceed with purchase
            const tx = await prepareContractCall({
                contract,
                method: "function buyShares(uint256 _marketId, bool _isOptionA, uint256 _amount)",
                params: [BigInt(marketId), selectedOption === 'A', BigInt(amountInWei)]
            });

            const result = await mutateTransaction(tx);
            console.log("Purchase complete:", result);

            toast({
                title: "Purchase Successful!",
                description: `You bought ${amount} ${selectedOption === 'A' ? market.optionA : market.optionB} shares`,
                duration: 5000,
            });
            
            handleCancel();
        } catch (error: any) {
            console.error("Purchase error details:", {
                error: error?.message || error,
                tokenContract: tokenContract.address,
                marketContract: contract.address,
                chainId: contract.chain.id,
                account: account?.address
            });
            toast({
                title: "Purchase Failed",
                description: error?.message || "There was an error processing your purchase. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsConfirming(false);
        }
    };

    const convertToTokenDecimals = async (amount: number) => {
        try {
            const decimals = await readContract({
                contract: tokenContract,
                method: "function decimals() view returns (uint8)",
                params: []
            });
            console.log("Token decimals:", decimals);
            
            // Convert to string first to avoid floating point issues
            const amountString = amount.toString();
            const multiplier = BigInt(10) ** BigInt(decimals);
            const amountInTokenDecimals = BigInt(amountString) * multiplier;
            
            console.log("Amount conversion:", {
                originalAmount: amount,
                multiplier: multiplier.toString(),
                finalAmount: amountInTokenDecimals.toString()
            });
            
            return amountInTokenDecimals.toString();
        } catch (error) {
            console.error("Error getting token decimals:", error);
            return toWei(amount.toString());
        }
    };

    // Render the component
    return (
        <div 
            className="relative transition-[height] duration-200 ease-in-out overflow-hidden" 
            style={{ height: containerHeight }}
        >
            <div 
                ref={contentRef}
                className={cn(
                    "w-full transition-all duration-200 ease-in-out",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
            >
                {!isBuying ? (
                    // Initial option selection buttons
                    <div className="flex justify-between gap-4 mb-4">
                        <Button 
                            className="flex-1" 
                            onClick={() => handleBuy('A')}
                            aria-label={`Vote ${market.optionA} for "${market.question}"`}
                            disabled={!account}
                        >
                            {market.optionA}
                        </Button>
                        <Button 
                            className="flex-1"
                            onClick={() => handleBuy('B')}
                            aria-label={`Vote ${market.optionB} for "${market.question}"`}
                            disabled={!account}
                        >
                            {market.optionB}
                        </Button>
                    </div>
                ) : (
                    // Buy interface with different steps
                    <div className="flex flex-col mb-4">
                        {buyingStep === 'allowance' ? (
                            // Approval step
                            <div className="flex flex-col border-2 border-gray-200 rounded-lg p-4">
                                <h2 className="text-lg font-bold mb-4">Approval Needed</h2>
                                <p className="mb-4">You need to approve the transaction before proceeding.</p>
                                <div className="flex justify-end">
                                    <Button 
                                        onClick={handleSetApproval} 
                                        className="mb-2"
                                        disabled={isApproving}
                                    >
                                        {isApproving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Approving...
                                            </>
                                        ) : (
                                            'Set Approval'
                                        )}
                                    </Button>
                                    <Button 
                                        onClick={handleCancel} 
                                        className="ml-2" 
                                        variant="outline"
                                        disabled={isApproving}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : buyingStep === 'confirm' ? (
                            // Confirmation step
                            <div className="flex flex-col border-2 border-gray-200 rounded-lg p-4">
                                <h2 className="text-lg font-bold mb-4">Confirm Transaction</h2>
                                <p className="mb-4">
                                    You are about to buy <span className="font-bold">
                                        {amount} {selectedOption === 'A' ? market.optionA : market.optionB}
                                    </span> share(s).
                                </p>
                                <div className="flex justify-end">
                                    <Button 
                                        onClick={handleConfirm} 
                                        className="mb-2"
                                        disabled={isConfirming}
                                    >
                                        {isConfirming ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Confirming...
                                            </>
                                        ) : (
                                            'Confirm'
                                        )}
                                    </Button>
                                    <Button 
                                        onClick={handleCancel} 
                                        className="ml-2" 
                                        variant="outline"
                                        disabled={isConfirming}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // Amount input step
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">
                                    {`1 ${selectedOption === 'A' ? market.optionA : market.optionB} = 1 JungleJuice`}
                                </span>
                                <div className="flex flex-col gap-1 mb-4">
                                    <div className="flex items-center gap-2 overflow-visible">
                                        <div className="flex-grow relative">
                                            <Input
                                                type="number"
                                                min="0"
                                                step="1"
                                                placeholder="Enter amount"
                                                value={amount}
                                                onChange={(e) => {
                                                    const value = Math.max(0, Number(e.target.value));
                                                    setAmount(value);
                                                    setError(null);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === '-' || e.key === 'e') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                className={cn(
                                                    "w-full",
                                                    error && "border-red-500 focus-visible:ring-red-500"
                                                )}
                                            />
                                        </div>
                                        <span className="font-bold whitespace-nowrap">
                                            {selectedOption === 'A' ? market.optionA : market.optionB}
                                        </span>
                                    </div>
                                    <div className="min-h-[20px]">
                                        {error && (
                                            <span className="text-sm text-red-500">
                                                {error}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <Button onClick={checkApproval} className="flex-1">
                                        Confirm
                                    </Button>
                                    <Button onClick={handleCancel} variant="outline" className="flex-1">
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
