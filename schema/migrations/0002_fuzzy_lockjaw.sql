CREATE TYPE "public"."role_enum" AS ENUM('user', 'admin');--> statement-breakpoint
ALTER TABLE "assignment" RENAME TO "assignments";--> statement-breakpoint
ALTER TABLE "assignment_to_quiz" RENAME TO "assignments_to_quizzes";--> statement-breakpoint
ALTER TABLE "assignments" DROP CONSTRAINT "assignment_class_id_classes_id_fk";
--> statement-breakpoint
ALTER TABLE "assignments" DROP CONSTRAINT "assignment_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "assignments_to_quizzes" DROP CONSTRAINT "assignment_to_quiz_assignment_id_assignment_id_fk";
--> statement-breakpoint
ALTER TABLE "assignments_to_quizzes" DROP CONSTRAINT "assignment_to_quiz_quiz_id_quizzes_id_fk";
--> statement-breakpoint
ALTER TABLE "quiz_attempts" DROP CONSTRAINT "quiz_attempts_assignment_id_assignment_id_fk";
--> statement-breakpoint
ALTER TABLE "assignments_to_quizzes" DROP CONSTRAINT "assignment_to_quiz_quiz_id_assignment_id_pk";--> statement-breakpoint
ALTER TABLE "assignments_to_quizzes" ADD CONSTRAINT "assignments_to_quizzes_quiz_id_assignment_id_pk" PRIMARY KEY("quiz_id","assignment_id");--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "role_enum" DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments_to_quizzes" ADD CONSTRAINT "assignments_to_quizzes_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments_to_quizzes" ADD CONSTRAINT "assignments_to_quizzes_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE no action ON UPDATE no action;