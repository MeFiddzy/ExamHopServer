ALTER TABLE "user_stats"
    ADD PRIMARY KEY ("user_id");--> statement-breakpoint
ALTER TABLE "users"
    ADD COLUMN "birthday" date NOT NULL;--> statement-breakpoint
ALTER TABLE "user_stats"
    ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "birthday_d";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "birthday_m";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "birthday_y";