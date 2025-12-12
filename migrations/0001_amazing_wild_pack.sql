CREATE TABLE "user_stats"
(
    "user_id"           integer           NOT NULL,
    "quizzes_completed" integer DEFAULT 0 NOT NULL,
    "total_score"       integer DEFAULT 0 NOT NULL
);
