'use client'

import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useActiveAccount, useSendAndConfirmTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { contract } from "@/constants/contract";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";

export function CreateMarket() {
    const account = useActiveAccount();
    const { mutateAsync: mutateTransaction } = useSendAndConfirmTransaction();
    const { toast } = useToast();

    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']); // Minimum 2 options
    const [duration, setDuration] = useState('86400'); // 24 hours in seconds
    const [isCreating, setIsCreating] = useState(false);

    const addOption = () => {
        setOptions([...options, '']);
    };

    const removeOption = (index: number) => {
        if (options.length <= 2) return; // Maintain minimum 2 options
        setOptions(options.filter((_, i) => i !== index));
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleCreate = async () => {
        if (!account) return;
        
        // Validation
        if (!question.trim()) {
            toast({
                title: "Error",
                description: "Question is required",
                variant: "destructive",
            });
            return;
        }

        if (options.some(opt => !opt.trim())) {
            toast({
                title: "Error",
                description: "All options must be filled",
                variant: "destructive",
            });
            return;
        }

        setIsCreating(true);
        try {
            const tx = await prepareContractCall({
                contract,
                method: "function createMarket(string question, string[] options, uint256 duration) returns (uint256)",
                params: [question, options, BigInt(duration)]
            });

            await mutateTransaction(tx);
            
            toast({
                title: "Success",
                description: "Market created successfully",
            });

            // Reset form
            setQuestion('');
            setOptions(['', '']);
            setDuration('86400');
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to create market",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-4 p-4 border rounded-lg">
            <h2 className="text-lg font-bold">Create New Market</h2>
            
            <div className="space-y-2">
                <Input
                    placeholder="Enter market question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />
                
                <div className="space-y-2">
                    {options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => updateOption(index, e.target.value)}
                            />
                            {options.length > 2 && (
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeOption(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                <Button
                    variant="outline"
                    onClick={addOption}
                    className="w-full"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                </Button>

                <Input
                    type="number"
                    placeholder="Duration in seconds"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                />

                <Button
                    onClick={handleCreate}
                    disabled={isCreating || !account}
                    className="w-full"
                >
                    {isCreating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        'Create Market'
                    )}
                </Button>
            </div>
        </div>
    );
} 