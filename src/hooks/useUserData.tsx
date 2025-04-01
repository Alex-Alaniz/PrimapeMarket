'use client';
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";

interface UserData {
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
                    // User not found but that's okay - we'll set null userData
                    // but this is different from an error
                    setUserData(null);
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
    }, [walletAddress]); // ✅ Re-run when walletAddress changes

    return { userData, loading, error, setUserData };
}