import { useState, useEffect } from "react";

interface UserData {
    name: string;
}

export function useUserData(address?: string) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
    const walletToken = localStorage.getItem(`walletToken-${clientId}`);

    useEffect(() => {
        if (!address) return;

        const fetchUserData = async () => {
            try {
                const response = await fetch(`https://embedded-wallet.thirdweb.com/api/2024-05-05/accounts`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer embedded-wallet-token:${walletToken}`,
                        "Content-Type": "application/json",
                        "Accept": "*/*",
                        "Origin": "http://localhost:3000",
                        "Referer": "http://localhost:3000/",
                        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36",
                        "x-client-id": "405c734b26620ebbbedf749f1cc43594",
                        "x-sdk-name": "unified-sdk",
                        "x-sdk-os": "android",
                        "x-sdk-platform": "browser",
                        "x-sdk-version": "5.92.0",
                        "x-thirdweb-client-id": "405c734b26620ebbbedf749f1cc43594",
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch user data: ${response.statusText}`);
                }

                const data = await response.json();
                console.log("Account Details ==> ", data);
                setUserData(data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [address]);

    return { userData, loading };
}
