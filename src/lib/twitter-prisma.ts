
import { PrismaClient as DefaultPrismaClient } from "@prisma/client";

// Try to import the Twitter-specific PrismaClient
// Import the Twitter PrismaClient type directly to ensure proper typing
import type { PrismaClient as TwitterPrismaClient } from '@prisma/twitter-client';

let PrismaClient: any;
let hasTwitterClient = false;

try {
  // Dynamic import to avoid build errors when the module doesn't exist yet
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  PrismaClient = require("@prisma/twitter-client").PrismaClient;
  hasTwitterClient = true;
} catch {
  // Fallback to regular PrismaClient if the Twitter client is not generated yet
  console.warn("Twitter client not found, using regular Prisma client as fallback");
  PrismaClient = DefaultPrismaClient;
}

// Create a new PrismaClient instance specifically for Twitter data
// Using the Twitter-specific connection URL
const twitterDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TWITTER_POSTGRES_URL || process.env.DATABASE_URL,
    },
  },
}) as TwitterPrismaClient;

// Create proxy methods for fallback operation if Twitter client isn't available
if (!hasTwitterClient) {
  // Add proxy methods to handle Twitter-specific operations
  twitterDb.twitterWhitelist = {
    findMany: async () => {
      try {
        // Use raw query to get Twitter whitelist data
        const data = await twitterDb.$queryRaw`SELECT * FROM "TwitterWhitelist"`;
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error executing findMany on TwitterWhitelist:", error);
        return [];
      }
    },
    findUnique: async ({ where }: any) => {
      try {
        // Use raw query to find a specific Twitter whitelist entry
        const data = await twitterDb.$queryRaw`
          SELECT * FROM "TwitterWhitelist" 
          WHERE "username" = ${where.username}
          LIMIT 1
        `;
        return Array.isArray(data) && data.length > 0 ? data[0] : null;
      } catch (error) {
        console.error("Error executing findUnique on TwitterWhitelist:", error);
        return null;
      }
    },
    create: async ({ data }: any) => {
      try {
        // Use raw query to create a new Twitter whitelist entry
        await twitterDb.$executeRaw`
          INSERT INTO "TwitterWhitelist" ("username", "category", "points", "is_onboarded", "added_by")
          VALUES (${data.username}, ${data.category}, ${data.points}, ${data.is_onboarded || false}, ${data.added_by || null})
        `;
        
        return { ...data, id: 0 }; // Return simulated result
      } catch (error) {
        console.error("Error executing create on TwitterWhitelist:", error);
        throw error;
      }
    },
    update: async ({ where, data }: any) => {
      try {
        // Build update query parts
        const setClauses = [];
        const values = [];
        
        if (data.is_onboarded !== undefined) {
          setClauses.push(`"is_onboarded" = ${data.is_onboarded}`);
        }
        
        if (setClauses.length === 0) {
          return { id: 0, username: where.username };
        }
        
        // Use raw query to update a Twitter whitelist entry
        await twitterDb.$executeRaw`
          UPDATE "TwitterWhitelist"
          SET ${twitterDb.$raw(setClauses.join(', '))}
          WHERE "username" = ${where.username}
        `;
        
        return { id: 0, username: where.username, ...data };
      } catch (error) {
        console.error("Error executing update on TwitterWhitelist:", error);
        throw error;
      }
    }
  };
  
  twitterDb.twitterProfile = {
    findUnique: async ({ where }: any) => {
      try {
        // Use raw query to find a specific Twitter profile
        let data;
        if (where.id) {
          data = await twitterDb.$queryRaw`
            SELECT * FROM "TwitterProfile" 
            WHERE "id" = ${where.id}
            LIMIT 1
          `;
        } else {
          data = await twitterDb.$queryRaw`
            SELECT * FROM "TwitterProfile" 
            WHERE "username" = ${where.username}
            LIMIT 1
          `;
        }
        return Array.isArray(data) && data.length > 0 ? data[0] : null;
      } catch (error) {
        console.error("Error executing findUnique on TwitterProfile:", error);
        return null;
      }
    },
    findFirst: async ({ where }: any) => {
      try {
        // Use raw query to find the first matching Twitter profile
        let query = `SELECT * FROM "TwitterProfile" LIMIT 1`;
        let params: any[] = [];
        
        if (where) {
          // Build WHERE clause manually
          const conditions = [];
          if (where.username) {
            conditions.push(`"username" = $${params.length + 1}`);
            params.push(where.username);
          }
          
          if (conditions.length) {
            query = `SELECT * FROM "TwitterProfile" WHERE ${conditions.join(' AND ')} LIMIT 1`;
          }
        }
        
        const data = await twitterDb.$queryRawUnsafe(query, ...params);
        return Array.isArray(data) && data.length > 0 ? data[0] : null;
      } catch (error) {
        console.error("Error executing findFirst on TwitterProfile:", error);
        return null;
      }
    },
    create: async ({ data }: any) => {
      try {
        // Extract the fields from data
        const fields = Object.keys(data);
        const values = Object.values(data);
        
        // Generate the field list and placeholders
        const fieldList = fields.map(f => `"${f}"`).join(', ');
        const placeholders = fields.map((_, i) => `$${i+1}`).join(', ');
        
        // Use raw query to create a new Twitter profile entry
        const valuesPlaceholders = values.map((_, i) => `$${i+1}`).join(', ');
        await twitterDb.$executeRaw`
          INSERT INTO "TwitterProfile" (${twitterDb.$raw(fieldList)})
          VALUES (${twitterDb.$raw(valuesPlaceholders)})
        `;
        
        // Execute with values
        await twitterDb.$executeRaw({
          sql: `INSERT INTO "TwitterProfile" (${fieldList}) VALUES (${valuesPlaceholders})`,
          values: values
        });
        
        return data;
      } catch (error) {
        console.error("Error executing create on TwitterProfile:", error);
        throw error;
      }
    }
  };
}

export { twitterDb };
