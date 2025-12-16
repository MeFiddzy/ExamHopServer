import * as zod from 'zod';
import { ZodObject } from 'zod';

const difficultyEnum = zod.enum(['easy', 'medium', 'hard']);
const viewTypeEnum = zod.enum(['public', 'private', 'unlisted']);
const questionTypeEnum = zod.enum(['multiChoice', 'oneChoice']);

const legalNameSchema = zod
    .string('Legal Name must be a string.')
    .min(3, 'First name must be at least 3 characters')
    .max(25, 'First name must be at least 3 characters')
    .regex(/^\p{L}+$/u, 'Legal name can only contain letters.');

const usernameSchema = zod
    .string('Username must be a string.')
    .min(3, 'Username must contain at least 3 characters')
    .max(25, 'Username can have up to 15 characters')
    .regex(
        /^[a-zA-Z0-9_\-]+$/,
        "Username can only contain letters, numbers, numbers and the special characters '_' and '-'."
    );

const passwordSchema = zod
    .string('Password must be a string.')
    .min(7, 'Password must be at least 7 characters')
    .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_\-=/\\,.<>])[A-Za-z0-9!@#$%^&*()_\-=/\\,.<>]{8,}$/,
        "Password contain one lowercase letter, one uppercase letter, one number and one of the special characters '_', '-', '=', '\\'. '/', ',', '.', '<', '>'."
    );

export const resetPasswordSchema = zod.object({
    email: zod.email(),
    oldPassword: passwordSchema,
    newPassword: passwordSchema
});

export const loginSchema = zod.object({
    email: zod.email(),
    password: passwordSchema
});

export const profileSchema = zod.object({
    token: zod.string()
});

export const registerSchema = zod.object({
    username: usernameSchema,
    firstName: legalNameSchema,
    lastName: legalNameSchema,
    email: zod.email('Email invalid.'),
    birthday: zod.coerce.date('Birthday must be a date.'),
    password: passwordSchema
});

const multiChoiceData = zod.object({
    type: zod.literal('multiChoice'),
    maxSelected: zod.number(),
    answers: zod.array(
        zod.object({
            text: zod.string(),
            isCorrect: zod.boolean()
        })
    )
});

const oneChoiceData = zod.object({
    type: zod.literal('oneChoice'),
    answers: zod.array(zod.string()),
    correctAns: zod.number()
});

const questionSchema = zod.object({
    title: zod.string(),
    data: zod.discriminatedUnion('type', [multiChoiceData, oneChoiceData]),
});

export const quizCreateSchema = zod.object({
    title: zod.string(),
    description: zod.string(),
    difficulty: difficultyEnum,
    subject: zod.string(),
    viewType: viewTypeEnum,
    questions: zod.array(questionSchema)
});

export const quizEditSchema = zod
    .object({
        title: zod.string().min(1).max(255).optional(),
        description: zod.string().min(1).max(2000).optional(),
        subject: zod.string().min(1).max(100).optional(),
        difficulty: zod.enum(['easy', 'medium', 'hard']).optional(),
        viewType: zod.enum(['public', 'private', 'unlisted']).optional()
    })
    .refine((obj) => Object.keys(obj).length > 0, {
        message: 'At least one field is required.'
    });

function makeEditVariant<
    T extends zod.ZodObject<{ type: zod.ZodLiteral<string> }>
>(schema: T) {
    return schema
        .omit({ type: true })
        .partial()
        .extend({ type: schema.shape.type });
}

export const questionEditSchema = zod
    .object({
        title: zod.string().optional(),
        data: zod
            .discriminatedUnion('type', [
                makeEditVariant(multiChoiceData),
                makeEditVariant(oneChoiceData)
            ])
            .optional()
    })
    .refine((obj) => Object.keys(obj).length > 0, {
        message: 'At least one field is required.'
    });
