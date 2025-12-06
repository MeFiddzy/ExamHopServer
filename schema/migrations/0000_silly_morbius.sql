CREATE TABLE "user_stats" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"quizzes_completed" integer DEFAULT 0 NOT NULL,
	"total_score" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"firstname" varchar(255) NOT NULL,
	"lastname" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"birthday" date NOT NULL,
	"password_hash" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;