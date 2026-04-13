-- CREATE SCHEMA IF NOT EXISTS "plot_news_app"; -- Already ran this manually

CREATE TABLE IF NOT EXISTS "plot_news_app"."profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"wallet_address" text UNIQUE,
	"display_name" text,
	"reputation_score" integer DEFAULT 0,
	"accuracy" numeric(5, 2) DEFAULT '0',
	"total_predictions" integer DEFAULT 0,
	"correct_predictions" integer DEFAULT 0,
	"streak" integer DEFAULT 0,
	"rank" integer,
	"avatar_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "plot_news_app"."news" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"image_url" text,
	"date" text,
	"category" text NOT NULL,
	"source_url" text,
	"crisis_level" integer,
	"cover_emoji" text,
	"cliffhanger" text,
	"article_body" jsonb DEFAULT '[]'::jsonb,
	"historical_context" text,
	"historical_evidence" jsonb,
	"refs" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "plot_news_app"."stories" (
	"id" text PRIMARY KEY NOT NULL REFERENCES "plot_news_app"."news"("id") ON DELETE cascade,
	"status" text DEFAULT 'active',
	"roles" jsonb DEFAULT '[]'::jsonb,
	"panels" jsonb DEFAULT '[]'::jsonb,
	"prediction_options" jsonb DEFAULT '[]'::jsonb,
	"resolved_timeline" jsonb,
	"resolved_outcome" text,
	"tx_hash" text,
	"simulations" jsonb DEFAULT '{}'::jsonb,
	"prediction_count" integer DEFAULT 0,
	"consensus_option" text,
	"controversy_score" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "plot_news_app"."analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" text NOT NULL,
	"option_id" text,
	"prediction_id" text,
	"is_custom" boolean DEFAULT false,
	"factors" text[] DEFAULT '{}',
	"evidence" jsonb DEFAULT '[]'::jsonb,
	"reasoning" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "plot_news_app"."predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" text REFERENCES "plot_news_app"."stories"("id") ON DELETE cascade,
	"user_address" text NOT NULL,
	"option_id" text NOT NULL,
	"option_label" text NOT NULL,
	"confidence" integer NOT NULL,
	"justification" text,
	"timestamp" bigint,
	"tx_hash" text,
	"resolved" boolean DEFAULT false,
	"correct" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
