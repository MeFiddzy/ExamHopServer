import * as zod from 'zod';
import { ZodObject } from 'zod';

export const difficultyEnum = zod.enum(['easy', 'medium', 'hard']);
export const viewTypeEnum = zod.enum(['public', 'private', 'unlisted']);
export const roleEnum = zod.enum(['user', 'admin']);

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

// Shared pagination/filter schemas
export const paginationSchema = zod.object({
    page: zod.coerce.number().int().min(1).default(1),
    pageSize: zod.coerce.number().int().min(1).max(100).default(20)
});

// Auth
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

// Question data types
const multiChoiceData = zod
    .object({
        type: zod.literal('multiChoice'),
        maxSelected: zod.number().int().min(1),
        answers: zod
            .array(
                zod.object({
                    text: zod.string().min(1),
                    isCorrect: zod.boolean()
                })
            )
            .min(1)
    })
    .refine(
        (val) => val.maxSelected <= val.answers.length,
        'maxSelected cannot exceed answer count'
    );

const oneChoiceData = zod.object({
    type: zod.literal('oneChoice'),
    answers: zod.array(zod.string().min(1)).min(2),
    correctIndex: zod.number().int().nonnegative()
});

const trueFalseData = zod.object({
    type: zod.literal('trueFalse'),
    correct: zod.boolean()
});

const shortAnswerData = zod.object({
    type: zod.literal('shortAnswer'),
    acceptable: zod.array(zod.string().min(1)).min(1)
});

const longAnswerData = zod.object({
    type: zod.literal('longAnswer'),
    rubric: zod.string().max(2000).optional()
});

const questionDataUnion = zod.discriminatedUnion('type', [
    multiChoiceData,
    oneChoiceData,
    trueFalseData,
    shortAnswerData,
    longAnswerData
]);

export const questionCreateSchema = zod.object({
    title: zod.string().min(1),
    data: questionDataUnion
});

export const quizCreateSchema = zod.object({
    title: zod.string(),
    description: zod.string(),
    difficulty: difficultyEnum,
    subject: zod.string(),
    viewType: viewTypeEnum,
    questions: zod.array(questionCreateSchema).min(1)
});

export const quizEditSchema = zod
    .object({
        title: zod.string().min(1).max(255).optional(),
        description: zod.string().min(1).max(2000).optional(),
        subject: zod.string().min(1).max(100).optional(),
        difficulty: difficultyEnum.optional(),
        viewType: viewTypeEnum.optional()
    })
    .refine((obj) => Object.keys(obj).length > 0, {
        message: 'At least one field is required.'
    });

export const quizQuerySchema = paginationSchema
    .extend({
        subject: zod.string().optional(),
        difficulty: difficultyEnum.optional(),
        viewType: viewTypeEnum.optional(),
        authorId: zod.coerce.number().int().optional(),
        search: zod.string().optional()
    })
    .partial();

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
                makeEditVariant(oneChoiceData),
                makeEditVariant(trueFalseData),
                makeEditVariant(shortAnswerData),
                makeEditVariant(longAnswerData)
            ])
            .optional()
    })
    .refine((obj) => Object.keys(obj).length > 0, {
        message: 'At least one field is required.'
    });

// Users
export const userUpdateSchema = zod
    .object({
        username: usernameSchema.optional(),
        firstName: legalNameSchema.optional(),
        lastName: legalNameSchema.optional(),
        email: zod.email().optional(),
        birthday: zod.coerce.date().optional()
    })
    .refine((o) => Object.keys(o).length > 0, {
        message: 'At least one field is required.'
    });

export const adminUserCreateSchema = registerSchema.extend({
    role: roleEnum.optional()
});

export const adminSetRoleSchema = zod.object({
    role: roleEnum
});

export const userListQuerySchema = paginationSchema.extend({
});

// Comments
export const commentCreateSchema = zod.object({
    text: zod.string().min(1).max(2000)
});

export const commentEditSchema = zod.object({
    text: zod.string().min(1).max(2000)
});

// Attempts
export const attemptCreateSchema = zod.object({
    assignmentId: zod.number().int().optional(),
    startedAt: zod.coerce.date().optional()
});

export const attemptFinishSchema = zod.object({
    finishedAt: zod.coerce.date(),
    score: zod.number().int().min(0)
});

export const attemptQuerySchema = paginationSchema.extend({
    quizId: zod.coerce.number().int().optional()
});

// Attempt answers
export const attemptAnswerBulkSchema = zod.object({
    answers: zod.array(
        zod.object({
            questionId: zod.number().int(),
            answer: zod.any()
        })
    )
});

export const attemptAnswerUpdateSchema = zod.object({
    answer: zod.any()
});

// Classes and membership
export const classCreateSchema = zod.object({
    name: zod.string().min(1)
});

export const classUpdateSchema = zod.object({
    name: zod.string().min(1).optional()
});

export const classMembershipSchema = zod.object({
    userId: zod.number().int()
});

// Assignments
export const assignmentCreateSchema = zod.object({
    title: zod.string().min(1),
    dueBy: zod.coerce.date(),
    description: zod.string().min(1),
    quizIds: zod.array(zod.number().int()).default([])
});

export const assignmentUpdateSchema = zod
    .object({
        title: zod.string().min(1).optional(),
        dueBy: zod.coerce.date().optional(),
        description: zod.string().min(1).optional()
    })
    .refine((o) => Object.keys(o).length > 0, {
        message: 'At least one field is required.'
    });

export const assignmentQuizLinkSchema = zod.object({
    quizIds: zod.array(zod.number().int()).min(1)
});
