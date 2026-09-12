CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" varchar(2000),
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
