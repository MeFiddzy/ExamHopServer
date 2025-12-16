import { Request, Response, Router } from 'express';
import { zodMiddleware } from '../middleware/zod-middleware.ts';
import * as zodSchemas from '../../zod-schemas.ts';
import { db } from '../../db.ts';
import * as tables from '../../schema.ts';
import { and, eq } from 'drizzle-orm';

const questionRouter = Router();

questionRouter.get('/quiz/:quizId', async (req: Request, res: Response) => {
    const quizId = Number(req.params.quizId);
    const questions = await db
        .select()
        .from(tables.questions)
        .where(eq(tables.questions.quizId, quizId));
    res.status(200).json(questions);
});

questionRouter.get('/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const [question] = await db
        .select()
        .from(tables.questions)
        .where(eq(tables.questions.id, id));
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.status(200).json(question);
});

questionRouter.post(
    '/quiz/:quizId',
    zodMiddleware(zodSchemas.questionCreateSchema),
    async (req: Request, res: Response) => {
        const quizId = Number(req.params.quizId);
        const [quiz] = await db
            .select({ authorId: tables.quizzes.authorId })
            .from(tables.quizzes)
            .where(eq(tables.quizzes.id, quizId));
        if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
        if (quiz.authorId !== req.userID)
            return res.status(403).json({ error: 'Forbidden' });

        const [question] = await db
            .insert(tables.questions)
            .values({ quizId, title: req.body.title, data: req.body.data })
            .returning({ id: tables.questions.id });
        if (!question) return res.status(500).json({ error: 'Failed to create question' });
        res.status(201).json({ id: question.id });
    }
);

questionRouter.patch(
    '/:id',
    zodMiddleware(zodSchemas.questionEditSchema),
    async (req: Request, res: Response) => {
        const questionId = Number(req.params.id);

        const [record] = await db
            .select({
                questionId: tables.questions.id,
                quizAuthor: tables.quizzes.authorId
            })
            .from(tables.questions)
            .leftJoin(tables.quizzes, eq(tables.quizzes.id, tables.questions.quizId))
            .where(eq(tables.questions.id, questionId));

        if (!record)
            return res.status(404).json({ error: 'Question not found' });
        if (record.quizAuthor !== req.userID)
            return res.status(403).json({
                error: 'The logged in account is not the owner of the quiz!'
            });

        await db
            .update(tables.questions)
            .set(req.body)
            .where(eq(tables.questions.id, questionId));

        res.status(200).json({ message: 'Question updated' });
    }
);

questionRouter.delete('/:id', async (req: Request, res: Response) => {
    const questionId = Number(req.params.id);
    const [record] = await db
        .select({
            quizAuthor: tables.quizzes.authorId
        })
        .from(tables.questions)
        .leftJoin(tables.quizzes, eq(tables.quizzes.id, tables.questions.quizId))
        .where(eq(tables.questions.id, questionId));

    if (!record) return res.status(404).json({ error: 'Question not found' });
    if (record.quizAuthor !== req.userID && req.role !== 'admin')
        return res.status(403).json({ error: 'Forbidden' });

    await db.delete(tables.questions).where(eq(tables.questions.id, questionId));
    res.status(200).json({ message: 'Question deleted' });
});

export default questionRouter;
