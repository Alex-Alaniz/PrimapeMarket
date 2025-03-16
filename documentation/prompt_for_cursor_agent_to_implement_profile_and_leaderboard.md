## Task Description

You have full access to my Replit codebase for PrimapeMarket, a prediction market platform on ApeChain. The repository contains both the smart contract (already deployed) and front-end code. I need you to set up a PostgreSQL database to store off-chain data for user profiles, activity history, and leaderboard metrics, using thirdweb auth for wallet-based authentication. Please execute the following steps directly in the Replit environment:

### Set Up PostgreSQL Database

1.  **Verify Installation**: Ensure PostgreSQL is installed and running in the Replit environment. If not, install it.
2.  **Create Database**: Create a new database named `primape_market_db`.
3.  **Connect & Execute SQL**: Connect to `primape_market_db` and execute the SQL script provided below to create the necessary tables and indices.

`-- Users Table: Stores user profiles with a primary wallet and display name CREATE TABLE users ( user_id SERIAL PRIMARY KEY, primary_wallet VARCHAR(42) UNIQUE NOT NULL, -- E.g., "0x..." display_name VARCHAR(50) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ); -- User Emails Table: Allows multiple emails per user CREATE TABLE user_emails ( user_id INT REFERENCES users(user_id) ON DELETE CASCADE, email VARCHAR(255) UNIQUE NOT NULL, verified BOOLEAN DEFAULT FALSE, PRIMARY KEY (user_id, email) ); -- User Wallets Table: Allows linking multiple wallets to a user profile CREATE TABLE user_wallets ( user_id INT REFERENCES users(user_id) ON DELETE CASCADE, wallet_address VARCHAR(42) UNIQUE NOT NULL, PRIMARY KEY (user_id, wallet_address) ); -- Markets Table: Stores market data from the smart contract CREATE TABLE markets ( market_id BIGINT PRIMARY KEY, question TEXT NOT NULL, end_time TIMESTAMP NOT NULL, resolved BOOLEAN DEFAULT FALSE, winning_option_index BIGINT, total_pool BIGINT DEFAULT 0 ); -- Wallet Activity Table: Tracks user activities like buying shares and claiming winnings CREATE TABLE wallet_activity ( id SERIAL PRIMARY KEY, wallet_address VARCHAR(42) NOT NULL, market_id BIGINT REFERENCES markets(market_id) ON DELETE CASCADE, option_index BIGINT NOT NULL, shares BIGINT NOT NULL, amount_spent BIGINT NOT NULL, -- Amount spent on shares amount_claimed BIGINT DEFAULT 0, -- Amount claimed after resolution event_type VARCHAR(20) CHECK (event_type IN ('buy', 'claim')) NOT NULL, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ); -- Users Leaderboard Table: Aggregates user performance metrics for the leaderboard CREATE TABLE users_leaderboard ( user_id INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE, total_invested BIGINT DEFAULT 0, total_claimed BIGINT DEFAULT 0, total_participated INT DEFAULT 0, total_won INT DEFAULT 0, total_lost INT DEFAULT 0, pnl BIGINT GENERATED ALWAYS AS (total_claimed - total_invested) STORED ); -- Indices for performance optimization CREATE INDEX idx_wallet_activity_wallet ON wallet_activity(wallet_address); CREATE INDEX idx_wallet_activity_market ON wallet_activity(market_id); CREATE INDEX idx_leaderboard_pnl ON users_leaderboard(pnl DESC); CREATE INDEX idx_leaderboard_won ON users_leaderboard(total_won DESC);`

### Update Database Connection Settings

1.  **Locate Configuration**: Check the codebase for a database configuration file (e.g., .env, config.js, or similar).
2.  **Update Details**: If such a file exists, update it with the connection details for `primape_market_db` (e.g., database name, host, port, user, password). Use default Replit PostgreSQL credentials if none are specified.
3.  **Create .env File**: If no configuration file exists, create a .env file in the root directory with the following (adjust values as needed):

`DB_HOST=localhost DB_PORT=5432 DB_NAME=primape_market_db DB_USER=postgres DB_PASSWORD=your_password_here`

1.  **Connect Frontend/Backend**: Ensure the front-end or backend code can connect to this database using these settings.

### Verify the Setup

1.  **Validate Creation**: After executing the SQL script, confirm that all tables and indices were created successfully by running this query:

`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`

1.  **Check Output**: Ensure that the output lists all six tables: users, user_emails, user_wallets, markets, wallet_activity, and users_leaderboard.

### Provide Confirmation

Once completed, output a message in the Replit console or as a comment in the codebase confirming:

"PostgreSQL database `primape_market_db` and schema created successfully."

### Additional Context

*   The smart contract on ApeChain emits events like MarketCreated, SharesPurchased, MarketResolved, and Claimed. These will be indexed into this database later via a Node.js backend service.

*   The front-end uses thirdweb auth for wallet-based login and will interact with this database through future API endpoints.

*   The schema supports:

    *   User profiles with editable display names and linked wallets/emails.
    *   Activity tracking for current and past predictions.
    *   A leaderboard based on profitability (PnL), participation, wins, and losses.

Please execute these steps now and confirm when finished.
