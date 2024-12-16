import { useReadContract } from "thirdweb/react";
import { contract } from "@/constants/contract";

interface FeeCalculatorProps {
    amount: number;
}

export function FeeCalculator({ amount }: FeeCalculatorProps) {
    const { data: feeBps } = useReadContract({
        contract,
        method: "function feeBps() view returns (uint256)",
        params: []
    });

    if (!feeBps || amount <= 0) return null;

    const feePercentage = Number(feeBps) / 100;
    const feeAmount = (amount * Number(feeBps)) / 10000;
    const netAmount = amount - feeAmount;

    return (
        <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
                <span>Amount:</span>
                <span>{amount} APE</span>
            </div>
            <div className="flex justify-between text-amber-600">
                <span>Fee ({feePercentage}%):</span>
                <span>-{feeAmount.toFixed(4)} APE</span>
            </div>
            <div className="flex justify-between font-medium">
                <span>Net Amount:</span>
                <span>{netAmount.toFixed(4)} APE</span>
            </div>
        </div>
    );
} 