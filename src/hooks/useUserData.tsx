import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
interface UserData {
    profile_img_url?: string;
    username?: string;
    email?: string;
    display_name?: string;
}
const fetcher = async (url: string, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    return response.json();
};

export function useUserData() {
    const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
    const [walletToken, setWalletToken] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const account = useActiveAccount();

    // Ensure token is set before making API calls
    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem(`walletToken-${clientId}`);
            if (token) setWalletToken(token);
        }
    }, [clientId]);

    useEffect(() => {
        let isMounted = true; // To avoid setting state after unmount
        let isCreatingUser = false; // Flag to prevent duplicate user creation

        const fetchUserData = async () => {
            if (!walletToken || !account?.address) return;
            setLoading(true);

            try {
                // Fetch user data from Thirdweb
                const thirdwebData = await fetcher(
                    "https://embedded-wallet.thirdweb.com/api/2024-05-05/accounts",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer embedded-wallet-token:${walletToken}`,
                            "Content-Type": "application/json",
                            "x-client-id": clientId || "",
                        },
                    }
                );

                const activeWalletAddress = account.address;

                // Check if user exists in DB
                const dbResponse = await fetch(`/api/userProfile?wallet_address=${activeWalletAddress}`);

                if (dbResponse.ok) {
                    const dbUser = await dbResponse.json();
                    if (isMounted) setUserData(dbUser);
                } else if (dbResponse.status === 404) {
                    if (isCreatingUser) return; // Prevent duplicate user creation
                    isCreatingUser = true; // Set flag before making request

                    // User not found, create a new one
                    const newUser = {
                        wallet_address: activeWalletAddress,
                        username: thirdwebData?.linkedAccounts?.[0]?.details?.name || "New User",
                        email: thirdwebData?.linkedAccounts?.[0]?.details?.email || "",
                        profile_img_url: thirdwebData?.linkedAccounts?.[0]?.details?.picture || "",
                    };

                    const createUserResponse = await fetch("/api/userProfile", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newUser),
                    });

                    if (createUserResponse.ok) {
                        const createdUser = await createUserResponse.json();
                        if (isMounted) setUserData(createdUser);
                    } else {
                        throw new Error("Failed to create user");
                    }
                } else {
                    throw new Error("Failed to fetch user data");
                }
            } catch (err) {
                if (isMounted) setError(err as Error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchUserData();

        return () => {
            isMounted = false; // Cleanup on unmount
        };
    }, [walletToken, account?.address, clientId]);

    console.log({ userData });
    return { userData, loading, error, setUserData };
}
