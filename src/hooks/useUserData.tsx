
'use client';
import { useEffect, useState, useCallback } from "react";
import { useActiveAccount } from "thirdweb/react";

interface UserData {
    wallet_address?: string;
    profile_img_url?: string;
    username?: string;
    email?: string;
    display_name?: string;
}

export function useUserData(address?: string) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const account = useActiveAccount();

    // Use provided address or account address
    const walletAddress = address || account?.address;

    // Function to create a user profile
    const createUserProfile = useCallback(async (wallet: string) => {
        try {
            // Check if user already exists first
            const checkResponse = await fetch(`/api/user?address=${wallet}`);
            if (checkResponse.ok) {
                // User exists, return the data
                return await checkResponse.json();
            }

            // Create a new user profile if not found
            const createResponse = await fetch(`/api/userProfile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wallet_address: wallet
                }),
            });

            if (createResponse.ok) {
                const newUser = await createResponse.json();
                return newUser;
            }
            return null;
        } catch (err) {
            console.error("Error creating user profile:", err);
            return null;
        }
    }, []);

    useEffect(() => {
        if (!walletAddress) {
            setUserData(null);
            return;
        }

        const controller = new AbortController(); // Cancel request if address changes
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);

            try {
                const dbResponse = await fetch(`/api/user?address=${walletAddress}`, {
                    signal: controller.signal,
                });

                if (dbResponse.ok) {
                    const data = await dbResponse.json();
                    setUserData(data);
                } else if (dbResponse.status === 404) {
                    // User not found, let's create a profile automatically
                    const newUser = await createUserProfile(walletAddress);
                    if (newUser) {
                        setUserData(newUser);
                    } else {
                        setUserData(null);
                    }
                } else {
                    throw new Error("Failed to fetch user data");
                }
            } catch (err) {
                if ((err as Error).name !== "AbortError") {
                    setError(err instanceof Error ? err.message : "Unknown error");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();

        return () => controller.abort(); // Cleanup on unmount or address change
    }, [walletAddress, createUserProfile]); // Re-run when walletAddress changes

    return { userData, loading, error, setUserData };
}
