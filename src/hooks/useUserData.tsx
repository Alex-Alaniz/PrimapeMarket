'use client';
import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";

interface UserData {
    profile_img_url?: string;
    username?: string;
    email?: string;
    display_name?: string;
}

export function useUserData() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const account = useActiveAccount();

    useEffect(() => {
        if (!account?.address) {
            setUserData(null);
            return;
        }

        const controller = new AbortController(); // Cancel request if account changes
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);

            try {
                const dbResponse = await fetch(`/api/userProfile?wallet_address=${account.address}`, {
                    signal: controller.signal,
                });

                if (dbResponse.ok) {
                    setUserData(await dbResponse.json());
                    // } else if (dbResponse.status === 404) {
                    //     // Create user if not found
                    //     const newUser = { wallet_address: account.address };

                    //     const createUserResponse = await fetch("/api/userProfile", {
                    //         method: "POST",
                    //         headers: { "Content-Type": "application/json" },
                    //         body: JSON.stringify(newUser),
                    //         signal: controller.signal,
                    //     });

                    //     if (createUserResponse.ok) {
                    //         setUserData(await createUserResponse.json());
                    //     } else {
                    //         throw new Error("Failed to create user");
                    //     }
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

        return () => controller.abort(); // Cleanup on unmount or account change
    }, [account]); // ✅ Only re-run when `account` changes

    return { userData, loading, error, setUserData };
}
