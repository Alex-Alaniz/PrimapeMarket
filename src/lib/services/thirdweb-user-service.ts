
import { client } from "@/app/client";
import { createLinkRequest, getLinkHistory, getLinkStatus, getUserProfiles } from "thirdweb/wallets";
import { LinkParams } from "thirdweb/wallets/interfaces/linkParams";

/**
 * Get user profiles linked to a wallet address
 */
export async function getWalletProfiles(walletAddress: string) {
  try {
    const profiles = await getUserProfiles({
      client,
      address: walletAddress,
    });
    
    return profiles;
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    throw error;
  }
}

/**
 * Create a link between a wallet and a profile (e.g., email, social)
 */
export async function linkProfile(walletAddress: string, linkParams: LinkParams) {
  try {
    const linkRequest = await createLinkRequest({
      client,
      address: walletAddress,
      linkParams,
    });
    
    return linkRequest;
  } catch (error) {
    console.error("Error creating link request:", error);
    throw error;
  }
}

/**
 * Check status of a link request
 */
export async function checkLinkStatus(walletAddress: string, linkRequestId: string) {
  try {
    const status = await getLinkStatus({
      client,
      address: walletAddress,
      linkRequestId,
    });
    
    return status;
  } catch (error) {
    console.error("Error checking link status:", error);
    throw error;
  }
}

/**
 * Get all link history for a wallet
 */
export async function getLinkHistoryForWallet(walletAddress: string) {
  try {
    const history = await getLinkHistory({
      client,
      address: walletAddress,
    });
    
    return history;
  } catch (error) {
    console.error("Error fetching link history:", error);
    throw error;
  }
}
