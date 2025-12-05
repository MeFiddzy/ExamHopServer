CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"firstname" varchar(255) NOT NULL,
	"lastname" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"birthday_d" integer NOT NULL,
	"birthday_m" integer NOT NULL,
	"birthday_y" integer NOT NULL,
	"password_hash" varchar(255) NOT NULL
);
