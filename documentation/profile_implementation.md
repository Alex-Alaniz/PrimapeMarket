## Overview

The profile system enables users to manage their identity, track predictions, and view activity history on Primape Markets. It supports linking multiple wallets and emails to a single profile and allows for editing the display name.

## Authentication with Thirdweb

User authentication is seamlessly integrated with a wallet-based login system using Thirdweb’s `ConnectButton`. This ensures secure access and smooth interactions with the platform.

`import { ConnectButton } from "@thirdweb-dev/react"; <ConnectButton client={client} />`

### Retrieve user profile data:

Users can easily access their profile data, ensuring a personalized user experience.

`import { useUser } from "@thirdweb-dev/react"; const { user, isLoggedIn } = useUser();`

## Database Schema

The database schema is designed to maintain user information effectively, with tables to manage users, their emails, wallets, and activity history.

### Users Table:

*   **user_id**: Auto-incrementing primary key (SERIAL).
*   **primary_wallet**: Unique wallet address (VARCHAR(42), NOT NULL, UNIQUE).
*   **display_name**: User’s display name (VARCHAR(50), NOT NULL).
*   **created_at**: Timestamp of user creation (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP).

### User Emails Table:

*   **user_id**: Foreign key to users(user_id).
*   **email**: Unique email address (VARCHAR(255), NOT NULL, UNIQUE).
*   **verified**: Boolean indicating email verification (DEFAULT FALSE).

### User Wallets Table:

*   **user_id**: Foreign key to users(user_id).
*   **wallet_address**: Unique wallet address (VARCHAR(42), NOT NULL, UNIQUE).

### Wallet Activity Table:

*   **id**: Auto-incrementing primary key (SERIAL).
*   **wallet_address**: Wallet address involved (VARCHAR(42), NOT NULL).
*   **market_id**: Foreign key to markets(market_id).
*   **option_index**: Option index (BIGINT, NOT NULL).
*   **shares**: Shares purchased (BIGINT, NOT NULL).
*   **amount_spent**: Amount spent (BIGINT, NOT NULL).
*   **amount_claimed**: Amount claimed (BIGINT, DEFAULT 0).
*   **event_type**: ‘buy’ or ‘claim’ (VARCHAR(20), CHECK (event_type IN ('buy', 'claim'))).
*   **timestamp**: Activity timestamp (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP).

### Indices for Optimization

`CREATE INDEX idx_wallet_activity_wallet ON wallet_activity(wallet_address); CREATE INDEX idx_wallet_activity_market ON wallet_activity(market_id);`

## Profile Features

### Linking Identities:

Users can link additional wallets or emails to their profile using Thirdweb’s `linkProfile` functionality, enhancing the flexibility and integration of their digital presence.

`async function linkNewIdentity(newIdentity) { await client.auth.linkProfile({ identity: newIdentity }); }`

### Editing Display Name:

The system supports updates to the user's display name via an intuitive frontend form and backend API.

`async function updateProfileName(newName) { await fetch("/api/update-profile", { method: "POST", body: JSON.stringify({ userId, profileName: newName }), }); }`

`app.post("/api/update-profile", async (req, res) => { const { userId, profileName } = req.body; await db.query("UPDATE users SET display_name = $1 WHERE user_id = $2", [profileName, userId]); res.status(200).send("Profile updated"); });`

### Activity Tracking:

User activities such as buying shares or claiming winnings are tracked through on-chain event listeners and stored in the wallet_activity table, providing detailed insights and reports on user transactions.

`contract.on("SharesPurchased", async (buyer, marketId, optionIndex, shares, amount) => { await db.query("INSERT INTO wallet_activity ...", [buyer, marketId, optionIndex, shares, amount, 'buy']); }); contract.on("Claimed", async (claimant, marketId, amount) => { await db.query("UPDATE wallet_activity SET amount_claimed = $1 ...", [amount, claimant, marketId]); });`

### Display activity on the profile page by querying:

`SELECT * FROM wallet_activity WHERE wallet_address = ANY($1) ORDER BY timestamp DESC;`

## Database Setup Instructions for Replit

### Set Up PostgreSQL Database:

*   Ensure PostgreSQL is installed and running.
*   Create a new database: `primape_market_db`.
*   Execute the SQL script to create the tables and indices as defined above.

### Update Database Connection:

*   Check for a configuration file (e.g., .env). If none exists, create one with:

`DB_HOST=localhost DB_PORT=5432 DB_NAME=primape_market_db DB_USER=postgres DB_PASSWORD=your_password_here`

### Verify the Setup:

*   Confirm table creation by querying:

`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

This guide outlines the foundational elements needed to implement a comprehensive and robust profile management system for Primape Markets. It provides users with control over their identity and activities while maintaining security through decentralized authentication mechanisms.
