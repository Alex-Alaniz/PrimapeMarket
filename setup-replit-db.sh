
#!/bin/bash

echo "Setting up Replit PostgreSQL database..."

# First, create a database
echo "Creating database..."
psql "$DATABASE_URL" -c "SELECT 1;" || {
  echo "Error connecting to database. Make sure you've created a PostgreSQL database in Replit."
  echo "Go to 'Database' in the Tools section and click 'Create a database'."
  exit 1
}

# Execute the database setup script
echo "Running setup script..."
npx tsx src/scripts/setup-replit-db.ts

echo "Setup completed!"
