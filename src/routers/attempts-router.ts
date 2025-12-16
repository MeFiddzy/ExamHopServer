import { Router, Request, Response } from 'express';
import { db } from '../../db.ts';
import * as tables from '../../schema.ts';
import {
    attemptAnswerBulkSchema,
    attemptAnswerUpdateSchema,
    attemptCreateSchema,
    attemptFinishSchema,
    attemptQuerySchema
} from '../../zod-schemas.ts';
import { zodMiddleware } from '../middleware/zod-middleware.ts';
import { and, eq } from 'drizzle-orm';

const attemptsRouter = Router();

attemptsRouter.get('/attempts', async (req: Request, res: Response) => {
    const parsed = attemptQuerySchema.safeParse(req.query);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues[0].message });
    const { page, pageSize, quizId } = parsed.data;
    const offset = (page - 1) * pageSize;

    const baseCondition = eq(tables.quizAttempts.userId, req.userID);
    const attempts = await db
        .select()
        .from(tables.quizAttempts)
        .where(quizId ? and(baseCondition, eq(tables.quizAttempts.quizId, quizId)) : baseCondition)
        .limit(pageSize)
        .offset(offset);

    res.status(200).json({ data: attempts, page, pageSize });
});

attemptsRouter.get('/attempts/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const [attempt] = await db
        .select()
        .from(tables.quizAttempts)
        .where(eq(tables.quizAttempts.id, id));
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    if (attempt.userId !== req.userID && req.role !== 'admin')
        return res.status(403).json({ error: 'Forbidden' });
    res.status(200).json(attempt);
});

attemptsRouter.post(
    '/quizzes/:quizId/attempts',
    zodMiddleware(attemptCreateSchema),
    async (req: Request, res: Response) => {
        const quizId = Number(req.params.quizId);
        const assignmentId = req.body.assignmentId;

        const [quiz] = await db
            .select({ viewType: tables.quizzes.viewType })
            .from(tables.quizzes)
            .where(eq(tables.quizzes.id, quizId));

        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        if (quiz.viewType === 'private' && req.role !== 'admin')
            return res.status(403).json({ error: 'Quiz is private' });

        if (assignmentId) {
            const [assignment] = await db
                .select({
                    classId: tables.assignments.classId
                })
                .from(tables.assignments)
                .where(eq(tables.assignments.id, assignmentId));
            if (!assignment)
                return res.status(400).json({ error: 'Invalid assignmentId' });

            const [membership] = await db
                .select({ userId: tables.studentsToClasses.userId })
                .from(tables.studentsToClasses)
                .where(
                    and(
                        eq(tables.studentsToClasses.classId, assignment.classId),
                        eq(tables.studentsToClasses.userId, req.userID)
                    )
                );
            if (!membership && req.role !== 'admin')
                return res.status(403).json({ error: 'Not in class for assignment' });
        }

        const [attempt] = await db
            .insert(tables.quizAttempts)
            .values({
                userId: req.userID,
                quizId,
                startedAt: req.body.startedAt ?? new Date(),
                finishedAt: req.body.startedAt ?? new Date(),
                score: 0,
                assignmentId: assignmentId ?? null
            })
            .returning({ id: tables.quizAttempts.id });

        res.status(201).json({ id: attempt.id });
    }
);

attemptsRouter.patch(
    '/attempts/:id',
    zodMiddleware(attemptFinishSchema),
    async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const [attempt] = await db
            .select({ userId: tables.quizAttempts.userId })
            .from(tables.quizAttempts)
            .where(eq(tables.quizAttempts.id, id));
        if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
        if (attempt.userId !== req.userID && req.role !== 'admin')
            return res.status(403).json({ error: 'Forbidden' });

        await db
            .update(tables.quizAttempts)
            .set({
                finishedAt: req.body.finishedAt,
                score: req.body.score
            })
            .where(eq(tables.quizAttempts.id, id));

        res.status(200).json({ message: 'Attempt updated' });
    }
);

attemptsRouter.delete('/attempts/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const [attempt] = await db
        .select({ userId: tables.quizAttempts.userId })
        .from(tables.quizAttempts)
        .where(eq(tables.quizAttempts.id, id));
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    if (attempt.userId !== req.userID && req.role !== 'admin')
        return res.status(403).json({ error: 'Forbidden' });

    await db.delete(tables.attemptAnswers).where(eq(tables.attemptAnswers.attemptId, id));
    await db.delete(tables.quizAttempts).where(eq(tables.quizAttempts.id, id));
    res.status(200).json({ message: 'Attempt deleted' });
});

attemptsRouter.get('/attempts/:id/answers', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const answers = await db
        .select()
        .from(tables.attemptAnswers)
        .where(eq(tables.attemptAnswers.attemptId, id));
    res.status(200).json(answers);
});

attemptsRouter.post(
    '/attempts/:id/answers',
    zodMiddleware(attemptAnswerBulkSchema),
    async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const payload = req.body.answers.map((a: any) => ({
            attemptId: id,
            questionId: a.questionId,
            answer: a.answer
        }));

        await db.insert(tables.attemptAnswers).values(payload).onConflictDoNothing();
        res.status(201).json({ message: 'Answers saved' });
    }
);

attemptsRouter.patch(
    '/attempts/:id/answers/:questionId',
    zodMiddleware(attemptAnswerUpdateSchema),
    async (req: Request, res: Response) => {
        const attemptId = Number(req.params.id);
        const questionId = Number(req.params.questionId);
        await db
            .update(tables.attemptAnswers)
            .set({ answer: req.body.answer })
            .where(
                and(
                    eq(tables.attemptAnswers.attemptId, attemptId),
                    eq(tables.attemptAnswers.questionId, questionId)
                )
            );
        res.status(200).json({ message: 'Answer updated' });
    }
);

attemptsRouter.delete('/attempts/:id/answers/:questionId', async (req: Request, res: Response) => {
    const attemptId = Number(req.params.id);
    const questionId = Number(req.params.questionId);
    await db
        .delete(tables.attemptAnswers)
        .where(
            and(
                eq(tables.attemptAnswers.attemptId, attemptId),
                eq(tables.attemptAnswers.questionId, questionId)
            )
        );
    res.status(200).json({ message: 'Answer deleted' });
});

export default attemptsRouter;

