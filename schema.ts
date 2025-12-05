import { pgTable, serial, varchar, integer, date } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: varchar('username', {length: 255}).notNull(),
    firstname: varchar('firstname', {length: 255}).notNull(),
    lastname: varchar('lastname', {length: 255}).notNull(),
    email: varchar('email', {length: 255}).notNull(),
    birthday: date('birthday').notNull(),
    passwordHash: varchar('password_hash', {length: 255}).notNull()
});

export const userSats = pgTable('user_stats', {
    userID: integer('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    quizzesCompleted: integer('quizzes_completed').notNull().default(0),
    totalScore: integer('total_score').notNull().default(0)
});