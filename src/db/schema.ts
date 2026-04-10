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

// 2. Stories Table — field names match the Story type in src/lib/types.ts
export const stories = pgTable('stories', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  summary: text('summary'),
  category: text('category').notNull(),
  imageUrl: text('image_url'),
  date: text('date'),
  status: text('status', { enum: ['active', 'resolved'] }).default('active'),
  crisisLevel: integer('crisis_level'),
  coverEmoji: text('cover_emoji'),
  articleBody: jsonb('article_body').default([]),            // string[]
  historicalContext: text('historical_context'),
  historicalEvidence: jsonb('historical_evidence'),          // HistoricalEvidence
  references: jsonb('references').default([]),               // Reference[]
  roles: jsonb('roles').default([]),                         // Role[]
  panels: jsonb('panels').default([]),                       // Scene[]
  predictionOptions: jsonb('prediction_options').default([]), // Directive[]
  cliffhanger: text('cliffhanger'),
  resolvedTimeline: jsonb('resolved_timeline'),              // SimulationPhase[]
  resolvedOutcome: text('resolved_outcome'),
  txHash: text('tx_hash'),
  // Aggregate metadata
  predictionCount: integer('prediction_count').default(0),
  consensusOption: text('consensus_option'),
  controversyScore: integer('controversy_score').default(0),
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
