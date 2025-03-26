import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUser } from "thirdweb/wallets";

const secretKey = process.env.THIRDWEB_SECRET_KEY;
if (!secretKey) {
  throw new Error("THIRDWEB_SECRET_KEY is not defined");
}

async function testDBConnection() {
  try {
    await db.$connect();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error);
    throw new Error("Database connection error");
  }
}

export async function POST(req: Request) {
  try {
    await testDBConnection();

    const { walletAddress } = await req.json();
    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required." },
        { status: 400 }
      );
    }

    // Fetch user details from Thirdweb using the active wallet address
    const userData = await getUser({
      client: {
        clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
        secretKey: secretKey,
      },
      walletAddress, // Use wallet from frontend
    });

    if (!userData) {
      return NextResponse.json(
        { error: "User not found on Thirdweb." },
        { status: 404 }
      );
    }

    const { walletAddress: primary_wallet, email, profiles } = userData;
    const externally_linked_wallets: `0x${string}`[] = profiles.map(
      (profile) => profile.details.address as `0x${string}`
    );

    // Step 1: Check if the primary wallet exists in userProfile or userWallets
    let user = await db.userProfile.findUnique({
      where: { wallet_address: primary_wallet },
    });

    if (!user) {
      const existingWallet = await db.userWallets.findFirst({
        where: { wallet_address: primary_wallet },
      });
      if (existingWallet) {
        user = await db.userProfile.findUnique({
          where: { wallet_address: existingWallet.primary_wallet },
        });
      }
    }

    // Step 2: If no user exists, create a new userProfile
    if (!user) {
      user = await db.userProfile.create({
        data: {
          wallet_address: primary_wallet,
          email,
        },
      });
    }

    // Step 3: Check if any externally linked wallet is already linked with another primary wallet
    // Ensure externally linked wallets do not contain undefined or null values
    const validWallets = externally_linked_wallets.filter(
      (wallet) => wallet !== undefined && wallet !== null
    );

    if (validWallets.length > 0) {
      const conflictingWallets = await db.userWallets.findMany({
        where: {
          wallet_address: { in: validWallets },
          NOT: { primary_wallet: user.wallet_address },
        },
      });

      if (conflictingWallets.length > 0) {
        return NextResponse.json(
          {
            error:
              "One or more externally linked wallets are already associated with a different primary wallet address.",
          },
          { status: 409 }
        );
      }
    }

    // Step 4: Sync externally linked wallets
    const existingLinkedWallets = await db.userWallets.findMany({
      where: { primary_wallet: user.wallet_address },
      select: { wallet_address: true },
    });

    const existingWalletSet = new Set(
      existingLinkedWallets.map((w) => w.wallet_address)
    );
    const newWallets = externally_linked_wallets.filter(
      (wallet) => wallet && !existingWalletSet.has(wallet)
    );

    // Step 5: Add new externally linked wallets
    if (newWallets.length > 0) {
      await db.userWallets.createMany({
        data: newWallets.map((wallet) => ({
          primary_wallet: user.wallet_address,
          wallet_address: wallet,
        })),
      });
    }

    // Step 6: Remove disconnected wallets
    const walletsToRemove = existingLinkedWallets.filter(
      (w) =>
        !externally_linked_wallets.includes(w.wallet_address as `0x${string}`)
    );
    if (walletsToRemove.length > 0) {
      await db.userWallets.deleteMany({
        where: {
          primary_wallet: user.wallet_address,
          wallet_address: { in: walletsToRemove.map((w) => w.wallet_address) },
        },
      });
    }

    return NextResponse.json(
      { message: "User wallets synced successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling user wallets:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
