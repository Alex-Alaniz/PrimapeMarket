import useSWR from "swr";
import { useEffect, useState } from "react";

// interface UserData {
//     id: string;
//     linkedAccounts: LinkedAccount[];
//     wallets: Wallet[];
// }

// interface LinkedAccount {
//     id: string;
//     type: string;
//     details: AccountDetails;
// }

// interface AccountDetails {
//     email: string;
//     emailVerified: boolean;
//     familyName: string;
//     givenName: string;
//     name: string;
//     picture: string;
// }

// interface Wallet {
//     address: string;
//     createdAt: string;
//     type: string;
// }

const fetcher = async (url: string, token: string, clientId: string) => {
    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer embedded-wallet-token:${token}`,
            "Content-Type": "application/json",
            Accept: "*/*",
            Origin: typeof window !== "undefined" ? window.location.origin : "",
            Referer: typeof window !== "undefined" ? window.location.href : "",
            "User-Agent": navigator.userAgent,
            "x-client-id": clientId ?? "",
            "x-sdk-name": "unified-sdk",
            "x-sdk-os": "android",
            "x-sdk-platform": "browser",
            "x-sdk-version": "5.92.0",
            "x-thirdweb-client-id": clientId ?? "",
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }

    return response.json();
};

export function useUserData(address?: string) {
    const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
    const [walletToken, setWalletToken] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem(`walletToken-${clientId}`);
            setWalletToken(token);
        }
    }, [clientId]);

    const { data: userData, error } = useSWR(
        address && walletToken
            ? [`https://embedded-wallet.thirdweb.com/api/2024-05-05/accounts`, walletToken, clientId]
            : null,
        ([url, token, id]: [string, string, string]) => fetcher(url, token, id)
    );

    return {
        userData,
        loading: !userData && !error,
        error,
    };
}
