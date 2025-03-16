import fs from 'fs';
import path from 'path';
import { query } from '../lib/db';

async function setupReplitDatabase() {
  try {
    console.log('Setting up database schema in Replit PostgreSQL...');

    // Read the create-tables.sql file
    const createTablesSQL = fs.readFileSync(
      path.join(process.cwd(), 'create-tables.sql'), 
      'utf8'
    );

    // Execute the entire schema creation script
    try {
      await query(createTablesSQL);
      console.log('Successfully created database schema');
    } catch (err) {
      console.error('Error executing schema creation:', err);
    }

    // Verify tables were created
    try {
      const tablesResult = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
      `);
      console.log('Tables in database:', tablesResult.rows);
    } catch (err) {
      console.error('Error checking tables:', err);
    }

    // Insert test data if the file exists
    if (fs.existsSync(path.join(process.cwd(), 'insert-test-data.sql'))) {
      try {
        const insertDataSQL = fs.readFileSync(
          path.join(process.cwd(), 'insert-test-data.sql'), 
          'utf8'
        );

        // Execute the test data insertion script
        await query(insertDataSQL);
        console.log('Successfully inserted test data');
      } catch (err) {
        console.error('Error inserting test data:', err);
      }
    }

    console.log('Database setup process completed');

  } catch (err) {
    console.error('Error setting up database:', err);
  }
}

setupReplitDatabase()
  .then(() => console.log('Database setup script finished'))
  .catch(err => console.error('Fatal error in database setup:', err));