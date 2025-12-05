import * as zod from 'zod';

export const userSchema = zod.object({
    username: zod
        .string()
        .min(3, "Username must contain at least 3 characters")
        .max(15, "Username can have up to 15 characters")
        .regex(/^[a-zA-Z0-9_\-]+$/),
    email: zod
        .string()
        .email(), // TODO: Find undeprecated
    birthdayDay: zod
        .number()
        .min(1, "Birthday day must be valid")
        .max(31, "Birthday day must be valid"),
    birthdayMonth: zod
        .number()
        .min(1, "Birthday month must be valid")
        .max(12, "Birthday month must be valid"),
    birthdayYear: zod
        .number()
        .min(1950, "Birthday year must be valid")
        .max(2100, "Birthday year must be valid"),
    password: zod
        .string()
        .min(7, "Password must be at least 7 characters")
        .max(20, "Password must have less than 20 characters")
        .regex(/^[a-zA-Z0-9_\-=-\\/,.<>]+$/)
});