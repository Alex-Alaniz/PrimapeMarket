import { useState, useEffect } from "react";

interface UserData {
    name: string;
}

export function useUserData(address?: string) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
    const walletToken = localStorage.getItem(`walletToken-${clientId}`);
    // const AUTH_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlZmF1bHQtcHJvZCJ9.eyJzdG9yZWRUb2tlbiI6eyJqd3RUb2tlbiI6ImV5SmhiR2NpT2lKU1V6STFOaUlzSW5SNWNDSTZJa3BYVkNJc0ltdHBaQ0k2SW1SbFptRjFiSFF0Y0hKdlpDSjkuZXlKemRXSWlPaUl4TVRRNE5ESTBNekU0TkRVNE5Ea3hOemsyTlRZaUxDSjBlWEJsSWpvaVoyOXZaMnhsSWl3aWFXUWlPaUl4TVRRNE5ESTBNekU0TkRVNE5Ea3hOemsyTlRZaUxDSmxiV0ZwYkNJNkltaGhabWw2WVdodFpXUjNZWE5sWlcxQVoyMWhhV3d1WTI5dElpd2laVzFoYVd4V1pYSnBabWxsWkNJNmRISjFaU3dpWm1GdGFXeDVUbUZ0WlNJNklsZEJVMFZGVFNJc0ltZHBkbVZ1VG1GdFpTSTZJa0ZJVFVWRUlpd2libUZ0WlNJNklrRklUVVZFSUZkQlUwVkZUU0lzSW5CcFkzUjFjbVVpT2lKb2RIUndjem92TDJ4b015NW5iMjluYkdWMWMyVnlZMjl1ZEdWdWRDNWpiMjB2WVM5QlEyYzRiMk5MVkRaMVVsUk5Wa1kyZG1wRFMyaGxZMjlSUmpKRGRqVkdUSEJ3VnpKdFlUZFdSSEp1ZDFVM1p6WlVORmhTYzNOWE1sSjNQWE01Tmkxaklpd2lhV0YwSWpveE56UXhOemcwTmpjd0xDSmxlSEFpT2pFM05ESXpPRGswTnpBc0ltbHpjeUk2SW1WdFltVmtaR1ZrTFhkaGJHeGxkQzUwYUdseVpIZGxZaTVqYjIwaWZRLlZuQnJGX1RPNkVuLW9Obm96ZmRRN1BqT1E5OXFQOWR4dk5VS0I5Y1p2ZGlHSVVZZnkxX3VRLTFfRnZJa003LXpqOWZfdmxqU2NmV1RlSWtjOTlnaE5rSDlRZGt6WWRRMzhMRkhKU0lval9fT3VBU1drTDZ6b1RSMFF3ZzVUdXlKM0RObFhKalNJSFl0RUMtYXRJS01PMHFtdWJsVzhjdXBGaU5XTXBtb1NTTkpnQ09admhOUURBTkZtUGtYQnZkVG50V1ppQS1ESl9felR4bWZIaV93Q2cxV0p0QnAyemVERVRYWGZkX0YwM1BSbmE5R29KYjZsb043SUs5ZVpORjNQeGtuZTJTUG9haTI4RWsyVG1jeUFFd0Fvb1RtMGpZZ2FwLU1iY040U1FKYnB6RVF5eEYwMkgzX2xkbU9uUjNHOWg4OF9saGdtTTJ6UXFZMzF0MmY1ZyIsImF1dGhQcm92aWRlciI6Ikdvb2dsZV92MiIsImRldmVsb3BlckNsaWVudElkIjoiNDA1YzczNGIyNjYyMGViYmJlZGY3NDlmMWNjNDM1OTQiLCJhdXRoRGV0YWlscyI6eyJlbWFpbCI6ImhhZml6YWhtZWR3YXNlZW1AZ21haWwuY29tIiwidXNlcldhbGxldElkIjoiMTRjY2U2YjMtOTNhYS00MzUyLTgyMzEtOTZjNTlhOGFhOGU0IiwiYXV0aElkZW50aWZpZXIiOiJoYWZpemFobWVkd2FzZWVtQGdtYWlsLmNvbSIsInJlY292ZXJ5U2hhcmVNYW5hZ2VtZW50IjoiQVdTX01BTkFHRUQiLCJ3YWxsZXRUeXBlIjoiZW5jbGF2ZSJ9LCJpc05ld1VzZXIiOmZhbHNlLCJzaG91bGRTdG9yZUNvb2tpZVN0cmluZyI6dHJ1ZX0sImlhdCI6MTc0MTc4NDY3MSwiZXhwIjoxNzQyMzg5NDcxLCJpc3MiOiJlbWJlZGRlZC13YWxsZXQudGhpcmR3ZWIuY29tIn0.JVrBBHscV-RXOS2Iz4SOTRLxW_wguapGiH_aVlMam4p1ufAkjHqfswfhn5NrWe0c2TgM37D1xiDtwYf73x0ayF6YhLvWkaJAIYxt5_XmWXJR2WojtT4SvyTzcL09OPpLUUoeI-G3pgHh3r1dLWfliR06tmLldxyDaG3NLOuV46Pc7p3QFYFkY6vucH7Anfs3zWIVkyExeHi224Lc4jjwIL7ddCCqL80j7Lo1_YWTkJagkrujz-jHjFHjckYtKNFTSZ0DVnxgH2TR2juRgavaEXFvJ6WL-G6PDQ5x95bAY-88pEgL1IrzuXEYlqdmEG6kBC0Wl8KVuS0FgjY75w93ig';

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
