CREATE TABLE "predictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" text,
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
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"wallet_address" text,
	"display_name" text,
	"reputation_score" integer DEFAULT 0,
	"accuracy" numeric(5, 2) DEFAULT '0',
	"total_predictions" integer DEFAULT 0,
	"correct_predictions" integer DEFAULT 0,
	"streak" integer DEFAULT 0,
	"rank" integer,
	"avatar_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"summary" text,
	"cover_emoji" text,
	"date" text,
	"prediction_count" integer DEFAULT 0,
	"consensus_option" text,
	"controversy_score" integer DEFAULT 0,
	"status" text DEFAULT 'active',
	"resolved_outcome" text,
	"panels" jsonb DEFAULT '[]'::jsonb,
	"cliffhanger" text,
	"prediction_options" jsonb DEFAULT '[]'::jsonb,
	"historical_evidence" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;