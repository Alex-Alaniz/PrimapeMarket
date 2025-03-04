
import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { 
  pgTable, 
  serial, 
  varchar, 
  timestamp, 
  boolean,
  text,
  integer,
  numeric,
  primaryKey
} from 'drizzle-orm/pg-core';

// User profiles table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  walletAddress: varchar('wallet_address', { length: 42 }).notNull().unique(),
  username: varchar('username', { length: 100 }),
  profileImage: text('profile_image'),
  bio: text('bio'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  totalWinnings: numeric('total_winnings', { precision: 36, scale: 18 }).default('0').notNull(),
  totalParticipation: integer('total_participation').default(0).notNull(),
  winRate: numeric('win_rate', { precision: 5, scale: 2 }).default('0').notNull(),
  rank: integer('rank')
});

// Market participation table
export const marketParticipations = pgTable('market_participations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  marketId: integer('market_id').notNull(),
  optionIndex: integer('option_index').notNull(),
  amount: numeric('amount', { precision: 36, scale: 18 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  transactionHash: varchar('transaction_hash', { length: 66 }).notNull(),
});

// Market results table
export const marketResults = pgTable('market_results', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  marketId: integer('market_id').notNull(),
  participated: boolean('participated').notNull(),
  wonMarket: boolean('won_market'),
  amountWon: numeric('amount_won', { precision: 36, scale: 18 }),
  amountInvested: numeric('amount_invested', { precision: 36, scale: 18 }).notNull(),
  winningOptionIndex: integer('winning_option_index'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  claimed: boolean('claimed').default(false).notNull(),
  transactionHash: varchar('transaction_hash', { length: 66 }),
});

// User badges table
export const userBadges = pgTable('user_badges', {
  userId: integer('user_id').notNull().references(() => users.id),
  badgeId: integer('badge_id').notNull(),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
  displayed: boolean('displayed').default(true).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.badgeId] }),
  }
});

// Badges table
export const badges = pgTable('badges', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  criteria: text('criteria').notNull(),
});

// Create db client
export const db = drizzle(sql);
