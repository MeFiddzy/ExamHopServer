CREATE TYPE "public"."difficulty_enum" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."view_type" AS ENUM('public', 'private', 'unlisted');--> statement-breakpoint
CREATE TABLE "assignment"
(
    "id"          serial PRIMARY KEY NOT NULL,
    "class_id"    integer            NOT NULL,
    "author_id"   integer            NOT NULL,
    "title"       text               NOT NULL,
    "due_by"      timestamp          NOT NULL,
    "created_at"  timestamp          NOT NULL,
    "description" text               NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignment_to_quiz"
(
    "assignment_id" integer NOT NULL,
    "quiz_id"       integer NOT NULL,
    CONSTRAINT "assignment_to_quiz_quiz_id_assignment_id_pk" PRIMARY KEY ("quiz_id", "assignment_id")
);
--> statement-breakpoint
CREATE TABLE "attempt_answers"
(
    "attempt_id"  integer NOT NULL,
    "question_id" integer NOT NULL,
    "answer"      jsonb   NOT NULL,
    CONSTRAINT "attempt_answers_attempt_id_question_id_pk" PRIMARY KEY ("attempt_id", "question_id")
);
--> statement-breakpoint
CREATE TABLE "classes"
(
    "id"        serial PRIMARY KEY NOT NULL,
    "name"      text               NOT NULL,
    "author_id" integer            NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments"
(
    "id"         serial PRIMARY KEY NOT NULL,
    "user_id"    integer            NOT NULL,
    "quiz_id"    integer            NOT NULL,
    "text"       text               NOT NULL,
    "created_at" timestamp          NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions"
(
    "id"      serial PRIMARY KEY NOT NULL,
    "quiz_id" integer,
    "title"   text               NOT NULL,
    "data"    jsonb              NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts"
(
    "id"            serial PRIMARY KEY NOT NULL,
    "user_id"       integer            NOT NULL,
    "quiz_id"       integer            NOT NULL,
    "started_at"    timestamp          NOT NULL,
    "finished_at"   timestamp          NOT NULL,
    "score"         integer            NOT NULL,
    "assignment_id" integer
);
--> statement-breakpoint
CREATE TABLE "quizzes"
(
    "id"          serial PRIMARY KEY NOT NULL,
    "title"       text               NOT NULL,
    "description" text               NOT NULL,
    "difficulty"  "difficulty_enum"  NOT NULL,
    "author_id"   integer            NOT NULL,
    "subject"     text               NOT NULL,
    "createdAt"   timestamp          NOT NULL,
    "view_type"   "view_type"        NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students_to_classes"
(
    "user_id"  integer NOT NULL,
    "class_id" integer NOT NULL,
    CONSTRAINT "students_to_classes_user_id_class_id_pk" PRIMARY KEY ("user_id", "class_id")
);
--> statement-breakpoint
CREATE TABLE "teachers_to_classes"
(
    "user_id"  integer NOT NULL,
    "class_id" integer NOT NULL,
    CONSTRAINT "teachers_to_classes_user_id_class_id_pk" PRIMARY KEY ("user_id", "class_id")
);
--> statement-breakpoint
CREATE TABLE "users"
(
    "id"            serial PRIMARY KEY NOT NULL,
    "username"      text               NOT NULL,
    "first_name"    text               NOT NULL,
    "last_name"     text               NOT NULL,
    "email"         text               NOT NULL,
    "birthday"      date               NOT NULL,
    "password_hash" text               NOT NULL,
    CONSTRAINT "users_username_unique" UNIQUE ("username"),
    CONSTRAINT "users_email_unique" UNIQUE ("email")
);
--> statement-breakpoint
ALTER TABLE "assignment"
    ADD CONSTRAINT "assignment_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment"
    ADD CONSTRAINT "assignment_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_to_quiz"
    ADD CONSTRAINT "assignment_to_quiz_assignment_id_assignment_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignment" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_to_quiz"
    ADD CONSTRAINT "assignment_to_quiz_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers"
    ADD CONSTRAINT "attempt_answers_attempt_id_quiz_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."quiz_attempts" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers"
    ADD CONSTRAINT "attempt_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes"
    ADD CONSTRAINT "classes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments"
    ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments"
    ADD CONSTRAINT "comments_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions"
    ADD CONSTRAINT "questions_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_quiz_id_quizzes_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_assignment_id_assignment_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignment" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quizzes"
    ADD CONSTRAINT "quizzes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students_to_classes"
    ADD CONSTRAINT "students_to_classes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students_to_classes"
    ADD CONSTRAINT "students_to_classes_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers_to_classes"
    ADD CONSTRAINT "teachers_to_classes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers_to_classes"
    ADD CONSTRAINT "teachers_to_classes_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes" ("id") ON DELETE no action ON UPDATE no action;