-- CreateTable
CREATE TABLE "userProfile" (
    "wallet_address" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT,
    "profile_img_url" TEXT,
    "display_name" TEXT,

    CONSTRAINT "userProfile_pkey" PRIMARY KEY ("wallet_address")
);

-- CreateTable
CREATE TABLE "userWallets" (
    "id" SERIAL NOT NULL,
    "primary_wallet" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userWallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "walletActivity" (
    "id" SERIAL NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "market_id" INTEGER NOT NULL,
    "option_index" INTEGER,
    "shares" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "amount_spent" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "amount_claimed" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "event_type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "walletActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usersLeaderboard" (
    "primary_wallet" TEXT NOT NULL,
    "total_invested" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_claimed" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_won" INTEGER NOT NULL DEFAULT 0,
    "total_lost" INTEGER NOT NULL DEFAULT 0,
    "pnl" DECIMAL(65,30) NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "markets" (
    "market_id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "winning_option_index" INTEGER,
    "total_pool" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "markets_pkey" PRIMARY KEY ("market_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userProfile_wallet_address_key" ON "userProfile"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "userWallets_wallet_address_key" ON "userWallets"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "usersLeaderboard_primary_wallet_key" ON "usersLeaderboard"("primary_wallet");

-- AddForeignKey
ALTER TABLE "userWallets" ADD CONSTRAINT "userWallets_primary_wallet_fkey" FOREIGN KEY ("primary_wallet") REFERENCES "userProfile"("wallet_address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usersLeaderboard" ADD CONSTRAINT "usersLeaderboard_primary_wallet_fkey" FOREIGN KEY ("primary_wallet") REFERENCES "userProfile"("wallet_address") ON DELETE CASCADE ON UPDATE CASCADE;
