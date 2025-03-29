"use client";
import { useActiveAccount, useActiveWalletConnectionStatus } from "thirdweb/react";
import { useEffect } from "react";

const SyncUserWallets = () => {
    const activeAccount = useActiveAccount();
    const activeWalletConnectionStatus = useActiveWalletConnectionStatus();
    // console.log("activeAccount ==>>", { activeAccount });
    // console.log("activeWalletConnectionStatus ==>>", { activeWalletConnectionStatus });
    useEffect(() => {
        if (!activeAccount?.address) return;

        fetch("/api/userWallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ walletAddress: activeAccount.address }),
        })
            .then((res) => res.json())
            .then((data) => console.log("Synced wallet:", data))
            .catch((err) => console.error("Sync error:", err));
    }, [activeAccount?.address, activeWalletConnectionStatus]);

    return null; // This component does not render anything
}

export default SyncUserWallets;
