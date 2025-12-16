import {
    pgTable,
    serial,
    integer,
    date,
    jsonb,
    text,
    pgEnum,
    timestamp,
    primaryKey
} from 'drizzle-orm/pg-core';

export const difficultyEnum = pgEnum('difficulty_enum', [
    'easy',
    'medium',
    'hard'
]);

export const viewTypeEnum = pgEnum('view_type', [
    'public',
    'private',
    'unlisted'
]);

export const roleEnum = pgEnum('role_enum', ['user', 'admin']);

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: text('username').notNull().unique(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull().unique(),
    birthday: date('birthday', {
        mode: 'string'
    }).notNull(),
    passwordHash: text('password_hash').notNull(),
    role: roleEnum('role').default('user').notNull()
});

export const quizzes = pgTable('quizzes', {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    difficulty: difficultyEnum('difficulty').notNull(),
    authorId: integer('author_id')
        .notNull()
        .references(() => users.id),
    subject: text('subject').notNull(),
    createdAt: timestamp('created_at').notNull(),
    viewType: viewTypeEnum('view_type').notNull()
});

export const questions = pgTable('questions', {
    id: serial('id').primaryKey(),
    quizId: integer('quiz_id').references(() => quizzes.id),
    title: text('title').notNull(),
    data: jsonb('data').notNull()
});

export const comments = pgTable('comments', {
    id: serial('id').primaryKey().notNull(),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id),
    quizId: integer('quiz_id')
        .notNull()
        .references(() => quizzes.id),
    text: text('text').notNull(),
    createdAt: timestamp('created_at').notNull()
});

export const classes = pgTable('classes', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    authorId: integer('author_id')
        .notNull()
        .references(() => users.id)
});

export const studentsToClasses = pgTable(
    'students_to_classes',
    {
        userId: integer('user_id')
            .notNull()
            .references(() => users.id),
        classId: integer('class_id')
            .notNull()
            .references(() => classes.id)
    },
    (table) => [
        primaryKey({
            columns: [table.userId, table.classId]
        })
    ]
);

export const teachersToClasses = pgTable(
    'teachers_to_classes',
    {
        userId: integer('user_id')
            .notNull()
            .references(() => users.id),
        classId: integer('class_id')
            .notNull()
            .references(() => classes.id)
    },
    (table) => [
        primaryKey({
            columns: [table.userId, table.classId]
        })
    ]
);

export const assignments = pgTable('assignments', {
    id: serial('id').notNull().primaryKey(),
    classId: integer('class_id')
        .notNull()
        .references(() => classes.id),
    authorId: integer('author_id')
        .notNull()
        .references(() => users.id),
    title: text('title').notNull(),
    dueBy: timestamp('due_by').notNull(),
    createdAt: timestamp('created_at').notNull(),
    description: text('description').notNull()
});

export const assignmentsToQuizzes = pgTable(
    'assignments_to_quizzes',
    {
        assignmentId: integer('assignment_id')
            .notNull()
            .references(() => assignments.id),
        quizId: integer('quiz_id')
            .notNull()
            .references(() => quizzes.id)
    },
    (table) => [
        primaryKey({
            columns: [table.quizId, table.assignmentId]
        })
    ]
);

export const quizAttempts = pgTable('quiz_attempts', {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id),
    quizId: integer('quiz_id')
        .notNull()
        .references(() => quizzes.id),
    startedAt: timestamp('started_at').notNull(),
    finishedAt: timestamp('finished_at').notNull(),
    score: integer('score').notNull(),
    assignmentId: integer('assignment_id').references(() => assignments.id)
});

export const attemptAnswers = pgTable(
    'attempt_answers',
    {
        attemptId: integer('attempt_id')
            .notNull()
            .references(() => quizAttempts.id),
        questionId: integer('question_id')
            .notNull()
            .references(() => questions.id),
        answer: jsonb('answer').notNull()
    },
    (table) => [
        primaryKey({
            columns: [table.attemptId, table.questionId]
        })
    ]
);
