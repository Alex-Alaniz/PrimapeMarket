-- CreateTable
CREATE TABLE "userProfile" (
    "wallet_address" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profile_img_url" TEXT,
    "display_name" TEXT,

    CONSTRAINT "userProfile_pkey" PRIMARY KEY ("wallet_address")
);

-- CreateIndex
CREATE UNIQUE INDEX "userProfile_wallet_address_key" ON "userProfile"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "userProfile_username_key" ON "userProfile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "userProfile_email_key" ON "userProfile"("email");
