CREATE TABLE "account" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text,
	"full_name" text,
	"avatar_url" text,
	"role" text DEFAULT 'USER'
);
