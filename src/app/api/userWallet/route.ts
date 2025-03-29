/**
 * API Endpoint: /api/userWallet
 * Method: POST
 * Description:
 *   - Syncs a user's wallet with the database.
 *   - Checks for conflicts where externally linked wallets are already mapped to another primary wallet.
 *   - Ensures a wallet is not linked to multiple users.
 *   - Adds missing wallet addresses to userProfile and userWallets.
 *   - Handles cases where no user data is returned from Thirdweb.
 *
 * Request Body:
 *   - walletAddress (string, required): The wallet address to sync.
 *
 * Responses:
 *   - 200: Success messages for different cases.
 *   - 400: Wallet address missing in request.
 *   - 500: Internal server error.
 */

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

    // Fetch user details from Thirdweb
    const userData = await getUser({
      client: {
        clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
        secretKey: secretKey,
      },
      walletAddress,
    });

    if (!userData) {
      // Check if wallet exists in userProfile
      const existingUser = await db.userProfile.findUnique({
        where: { wallet_address: walletAddress },
      });

      if (existingUser) {
        // Also check in the userWallets table
        const existingUserWallet = await db.userWallets.findUnique({
          where: {
            primary_wallet: walletAddress,
            wallet_address: walletAddress,
          },
        });

        if (existingUserWallet) {
          return NextResponse.json(
            {
              message:
                "User decentralized wallet already exists just added into userWallets.",
            },
            { status: 200 }
          );
        }

        // Map the wallet correctly if not already mapped
        await db.userWallets.create({
          data: {
            primary_wallet: walletAddress,
            wallet_address: walletAddress,
          },
        });

        return NextResponse.json(
          { message: "User decentralized wallet already exists." },
          { status: 200 }
        );
      }

      // Create entry in userProfile with no additional info
      await db.userProfile.create({
        data: { wallet_address: walletAddress },
      });

      // Map this wallet in userWallets
      // await db.userWallets.create({
      //   data: {
      //     primary_wallet: walletAddress,
      //     wallet_address: walletAddress,
      //   },
      // });
      await db.userWallets.upsert({
        where: { wallet_address: walletAddress },
        update: {},
        create: {
          primary_wallet: walletAddress,
          wallet_address: walletAddress,
        },
      });

      return NextResponse.json(
        { message: "New decentralized wallet added successfully." },
        { status: 200 }
      );
    }

    const { walletAddress: primary_wallet, email, profiles } = userData;
    const externally_linked_wallets: `0x${string}`[] = profiles.map(
      (profile) => profile.details.address as `0x${string}`
    );

    // Ensure primary wallet exists in userProfile
    let user = await db.userProfile.findUnique({
      where: { wallet_address: primary_wallet },
    });

    if (!user) {
      user = await db.userProfile.create({
        data: {
          wallet_address: primary_wallet,
          email,
        },
      });
    }

    // Ensure primary wallet exists in userWallets
    const primaryWalletEntry = await db.userWallets.findUnique({
      where: { wallet_address: primary_wallet },
    });

    if (!primaryWalletEntry) {
      await db.userWallets.create({
        data: {
          primary_wallet,
          wallet_address: primary_wallet,
        },
      });
    }

    // Sync externally linked wallets mapped to primary wallet
    const validWallets = externally_linked_wallets.filter(Boolean);

    // Step 1: Remove conflicts - if any externally linked wallet is already linked to another primary wallet, remove it
    if (validWallets.length > 0) {
      await db.userWallets.deleteMany({
        where: {
          wallet_address: { in: validWallets },
          NOT: { primary_wallet },
        },
      });
    }

    // Step 2: Remove externally linked wallets from userProfile if they exist
    await db.userProfile.deleteMany({
      where: { wallet_address: { in: validWallets } },
    });

    // Step 3: Remove externally linked wallets from userWallets if they exist
    await db.userWallets.deleteMany({
      where: { wallet_address: { in: validWallets } },
    });

    // Step 4: Fetch existing linked wallets
    const existingLinkedWallets = await db.userWallets.findMany({
      where: { primary_wallet },
      select: { wallet_address: true },
    });

    const existingWalletSet = new Set(
      existingLinkedWallets.map((w) => w.wallet_address)
    );
    const newWallets = validWallets.filter(
      (wallet) => !existingWalletSet.has(wallet)
    );

    // Step 5: Add new externally linked wallets
    if (newWallets.length > 0) {
      await db.userWallets.createMany({
        data: newWallets.map((wallet) => ({
          primary_wallet,
          wallet_address: wallet,
        })),
      });
    }

    // Step 6: Remove disconnected wallets (excluding primary wallet)
    const walletsToRemove = existingLinkedWallets.filter(
      (w) =>
        !validWallets.includes(w.wallet_address as `0x${string}`) &&
        w.wallet_address !== primary_wallet
    );

    if (walletsToRemove.length > 0) {
      await db.userWallets.deleteMany({
        where: {
          primary_wallet,
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
      // { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
