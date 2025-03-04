
import { NextRequest } from "next/server";
import { client } from "@/app/client";
import { auth } from "thirdweb/auth";

// ThirdWeb auth utility
const thirdwebAuth = auth({
  client: client,
  domain: process.env.THIRDWEB_AUTH_DOMAIN || "primape-prediction.apechain.io"
});

export async function getUser() {
  try {
    const user = await thirdwebAuth.user();
    if (!user) return null;
    
    return {
      walletAddress: user.address,
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export { thirdwebAuth };
