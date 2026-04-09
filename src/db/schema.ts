import { 
  pgTable, 
  text, 
  integer, 
  decimal, 
  timestamp, 
  boolean, 
  bigint, 
  uuid, 
  jsonb 
} from 'drizzle-orm/pg-core';

// 1. Profiles Table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // Usually matching auth.users id
  walletAddress: text('wallet_address').unique(),
  displayName: text('display_name'),
  reputationScore: integer('reputation_score').default(0),
  accuracy: decimal('accuracy', { precision: 5, scale: 2 }).default('0'),
  totalPredictions: integer('total_predictions').default(0),
  correctPredictions: integer('correct_predictions').default(0),
  streak: integer('streak').default(0),
  rank: integer('rank'),
  avatarUrl: text('avatar_url'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Stories Table
export const stories = pgTable('stories', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  summary: text('summary'),
  coverEmoji: text('cover_emoji'),
  date: text('date'),
  predictionCount: integer('prediction_count').default(0),
  consensusOption: text('consensus_option'),
  controversyScore: integer('controversy_score').default(0),
  status: text('status', { enum: ['active', 'resolved'] }).default('active'),
  resolvedOutcome: text('resolved_outcome'),
  panels: jsonb('panels').default([]),
  cliffhanger: text('cliffhanger'),
  predictionOptions: jsonb('prediction_options').default([]),
  historicalEvidence: jsonb('historical_evidence').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Predictions Table
export const predictions = pgTable('predictions', {
  id: uuid('id').defaultRandom().primaryKey(),
  storyId: text('story_id').references(() => stories.id, { onDelete: 'cascade' }),
  userAddress: text('user_address').notNull(),
  optionId: text('option_id').notNull(),
  optionLabel: text('option_label').notNull(),
  confidence: integer('confidence').notNull(), // 1-5
  justification: text('justification'),
  timestamp: bigint('timestamp', { mode: 'number' }),
  txHash: text('tx_hash'),
  resolved: boolean('resolved').default(false),
  correct: boolean('correct'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
