import * as zod from 'zod';

export const legalNameSchema = zod
        .string("Legal Name must be a string.")
        .min(3, "First name must be at least 3 characters")
        .max(25, "First name must be at least 3 characters")
        .regex(/^\p{L}+$/u, "Legal name can only contain letters.");

export const userSchema = zod.object({
    username: zod
        .string("Username must be a string.")
        .min(3, "Username must contain at least 3 characters")
        .max(25, "Username can have up to 15 characters")
        .regex(/^[a-zA-Z0-9_\-]+$/, "Username can only contain letters, numbers, numbers and the special characters '_' and '-'."),
    legalName: zod.object({
        firstName: legalNameSchema,
        lastName: legalNameSchema,
    }),
    email: zod
        .email("Email invalid."),
    birthday: zod.object({
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
    }),
    password: zod
        .string("Password must be a string.")
        .min(7, "Password must be at least 7 characters")
        .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_\-=/\\,.<>])[A-Za-z0-9!@#$%^&*()_\-=/\\,.<>]{8,}$/,
            "Password contain one lowercase letter, one uppercase letter, one number and one of the special characters '_', '-', '=', '\\'. '/', ',', '.', '<', '>'.")
});