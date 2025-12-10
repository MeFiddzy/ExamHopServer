import * as zod from 'zod';

const legalNameSchema = zod
        .string("Legal Name must be a string.")
        .min(3, "First name must be at least 3 characters")
        .max(25, "First name must be at least 3 characters")
        .regex(/^\p{L}+$/u, "Legal name can only contain letters.");

const usernameSchema = zod
        .string("Username must be a string.")
        .min(3, "Username must contain at least 3 characters")
        .max(25, "Username can have up to 15 characters")
        .regex(/^[a-zA-Z0-9_\-]+$/, "Username can only contain letters, numbers, numbers and the special characters '_' and '-'.");

const passwordSchema = zod
    .string("Password must be a string.")
    .min(7, "Password must be at least 7 characters")
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_\-=/\\,.<>])[A-Za-z0-9!@#$%^&*()_\-=/\\,.<>]{8,}$/,
        "Password contain one lowercase letter, one uppercase letter, one number and one of the special characters '_', '-', '=', '\\'. '/', ',', '.', '<', '>'.")

export const loginSchema = zod.object({
    email: zod.email(),
    password: passwordSchema,
});

export const profileSchema = zod.object({
    token: zod.string()
})

export const registerSchema = zod.object({
    username: usernameSchema,
    legalName: zod.object({
        firstName: legalNameSchema,
        lastName: legalNameSchema,
    }),
    email: zod
        .email("Email invalid."),
    birthday: zod
        .coerce.date("Birthday must be a date."),
    password: passwordSchema,
});