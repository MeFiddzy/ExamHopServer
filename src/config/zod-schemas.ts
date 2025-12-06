import * as zod from 'zod';

export const legalNameSchema = zod
        .string("Legal Name must be a string.")
        .min(3, "First name must be at least 3 characters")
        .max(25, "First name must be at least 3 characters")
        .regex(/^[^[a-zA-Z]+$/);

export const userSchema = zod.object({
    username: zod
        .string("Username must be a string.")
        .min(3, "Username must contain at least 3 characters")
        .max(25, "Username can have up to 15 characters")
        .regex(/^[a-zA-Z0-9_\-]+$/),
    legalName: zod.object({
        firstName: legalNameSchema,
        lastName: legalNameSchema,
    }),
    email: zod
        .email("Email invalid."),
    birthday: {
        day: zod
            .number("Day must be a number.")
            .min(1, "Birthday day must be valid")
            .max(31, "Birthday day must be valid"),
        month: zod
            .number("Month must be a number.")
            .min(1, "Birthday month must be valid")
            .max(12, "Birthday month must be valid"),
        year: zod
            .number("Year must be a number.")
            .min(1950, "Birthday year must be valid")
            .max(2100, "Birthday year must be valid"),
    },
    password: zod
        .string("Password must be a string.")
        .min(7, "Password must be at least 7 characters")
        .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[_\-=/\\,.<>])[a-zA-Z0-9_\-=/\\,.<>]+$/)
});