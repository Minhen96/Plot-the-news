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
  id: uuid('id').primaryKey(),
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

// 2. News Table — editorial content (title, article body, historical context)
export const news = pgTable('news', {
  id: text('id').primaryKey(),                         // slug-based, e.g. "strait-of-hormuz"
  title: text('title').notNull(),
  summary: text('summary'),
  imageUrl: text('image_url'),
  date: text('date'),
  category: text('category').notNull(),
  sourceUrl: text('source_url'),                       // original GNews URL, used for deduplication
  crisisLevel: integer('crisis_level'),
  coverEmoji: text('cover_emoji'),
  cliffhanger: text('cliffhanger'),
  articleBody: jsonb('article_body').default([]),       // string[]
  historicalContext: text('historical_context'),
  historicalEvidence: jsonb('historical_evidence'),     // HistoricalEvidence
  refs: jsonb('refs').default([]),                      // Reference[]
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Stories Table — game content only (1:1 with news, shares same id)
export const stories = pgTable('stories', {
  id: text('id').primaryKey().references(() => news.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['active', 'resolved'] }).default('active'),
  roles: jsonb('roles').default([]),                    // Role[]
  panels: jsonb('panels').default([]),                  // Scene[]
  predictionOptions: jsonb('prediction_options').default([]), // Directive[]
  resolvedTimeline: jsonb('resolved_timeline'),         // SimulationPhase[]
  resolvedOutcome: text('resolved_outcome'),
  txHash: text('tx_hash'),
  simulations: jsonb('simulations').default({}),        // { "optionId_roleId": SimulationPhase[] }
  predictionCount: integer('prediction_count').default(0),
  consensusOption: text('consensus_option'),
  controversyScore: integer('controversy_score').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Predictions Table
export const predictions = pgTable('predictions', {
  id: uuid('id').defaultRandom().primaryKey(),
  storyId: text('story_id').references(() => stories.id, { onDelete: 'cascade' }),
  userAddress: text('user_address').notNull(),
  optionId: text('option_id').notNull(),
  optionLabel: text('option_label').notNull(),
  confidence: integer('confidence').notNull(),
  justification: text('justification'),
  timestamp: bigint('timestamp', { mode: 'number' }),
  txHash: text('tx_hash'),
  resolved: boolean('resolved').default(false),
  correct: boolean('correct'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
