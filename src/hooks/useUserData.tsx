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
    const [prevWalletAddress, setPrevWalletAddress] = useState<string | null>(null);
    const account = useActiveAccount();

    // Check and handle thirdweb active wallet ID
    useEffect(() => {
        if (typeof window === "undefined" || !clientId) return;

        const activeWalletId = localStorage.getItem("thirdweb:active-wallet-id");
        const tokenKey = `walletToken-${clientId}`;

        if (!activeWalletId || activeWalletId !== "inApp") {
            localStorage.removeItem(tokenKey);
        }

        const token = localStorage.getItem(tokenKey);
        if (token) {
            setWalletToken(token);
        } else {
            setWalletToken(null);
        }
    }, [clientId, account?.address]);

    useEffect(() => {
        let isMounted = true;
        let isCreatingUser = false;

        const fetchUserData = async () => {
            const activeWalletAddress = account?.address;

            // Avoid re-fetching if userData is already set and wallet address is the same
            if (userData && activeWalletAddress === prevWalletAddress) {
                setLoading(false);
                return;
            }

            // If the wallet address has changed, clear user data
            if (activeWalletAddress && activeWalletAddress !== prevWalletAddress) {
                setUserData(null);
            }

            if (!walletToken || !activeWalletAddress) {
                setLoading(false);
                return;
            }
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

                // Check if user exists in DB
                const dbResponse = await fetch(`/api/userProfile?wallet_address=${activeWalletAddress}`);

                if (dbResponse.ok) {
                    const dbUser = await dbResponse.json();
                    if (isMounted) setUserData(dbUser);
                } else if (dbResponse.status === 404) {
                    if (isCreatingUser) return;
                    isCreatingUser = true;

                    // Create a new user
                    const newUser = {
                        wallet_address: activeWalletAddress,
                        username: thirdwebData?.linkedAccounts?.[0]?.details?.name || "New User",
                        email: thirdwebData?.linkedAccounts?.[0]?.details?.email || `user_${Math.floor(100000 + Math.random() * 900000)}@thirdwebmail.com`,
                        profile_img_url: thirdwebData?.linkedAccounts?.[0]?.details?.picture || thirdwebData?.linkedAccounts?.[0]?.details?.avatar || "https://thirdweb.com/logo.svg",
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
                if (isMounted) {
                    setLoading(false);
                    setPrevWalletAddress(activeWalletAddress); // Update previous wallet address
                }
            }
        };

        fetchUserData();

        return () => {
            isMounted = false;
        };
    }, [walletToken, account?.address, clientId, userData, prevWalletAddress]);

    // console.log({ userData });
    return { userData, loading, error, setUserData };
}
