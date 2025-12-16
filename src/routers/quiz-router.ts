import { Router, Request, Response } from 'express';
import { zodMiddleware } from '../middleware/zod-middleware.ts';
import * as zodSchemas from '../../zod-schemas.ts';
import { db } from '../../db.ts';
import * as tables from '../../schema.ts';
import { and, eq, ilike, or } from 'drizzle-orm';

const quizRouter = Router();

quizRouter.get('/', async (req: Request, res: Response) => {
    const parsed = zodSchemas.quizQuerySchema.safeParse(req.query);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues[0].message });
    const { page = 1, pageSize = 20, subject, difficulty, viewType, authorId, search } =
        parsed.data;
    const offset = (page - 1) * pageSize;

    const filters = [
        subject ? eq(tables.quizzes.subject, subject) : undefined,
        difficulty ? eq(tables.quizzes.difficulty, difficulty) : undefined,
        viewType ? eq(tables.quizzes.viewType, viewType) : undefined,
        authorId ? eq(tables.quizzes.authorId, authorId) : undefined,
        search
            ? or(
                  ilike(tables.quizzes.title, `%${search}%`),
                  ilike(tables.quizzes.description, `%${search}%`)
              )
            : undefined
    ].filter(Boolean) as any[];

    const rows = await db
        .select()
        .from(tables.quizzes)
        .where(filters.length ? and(...filters) : undefined)
        .limit(pageSize)
        .offset(offset);

    res.status(200).json({ data: rows, page, pageSize });
});

quizRouter.get('/:id', async (req: Request, res: Response) => {
    const quizId = Number(req.params.id);
    const [quiz] = await db.select().from(tables.quizzes).where(eq(tables.quizzes.id, quizId));
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const questions = await db
        .select()
        .from(tables.questions)
        .where(eq(tables.questions.quizId, quizId));

    res.status(200).json({ ...quiz, questions });
});

quizRouter.post(
    '/',
    zodMiddleware(zodSchemas.quizCreateSchema),
    async (req: Request, res: Response) => {
        const { title, description, difficulty, subject, viewType, questions } = req.body;

        const created = await db.transaction(async (tx) => {
            const [quiz] = await tx
                .insert(tables.quizzes)
                .values({
                    title,
                    description,
                    difficulty,
                    subject,
                    viewType,
                    authorId: req.userID,
                    createdAt: new Date()
                })
                .returning({ id: tables.quizzes.id });

            await tx.insert(tables.questions).values(
                questions.map((question: any) => ({
                    quizId: quiz.id,
                    title: question.title,
                    data: question.data
                }))
            );
            return quiz;
        });

        res.status(201).json({ id: created.id });
    }
);

quizRouter.patch(
    '/:id',
    zodMiddleware(zodSchemas.quizEditSchema),
    async (req: Request, res: Response) => {
        const quizId = Number(req.params.id);

        const [quizAuthor] = await db
            .select({
                authorId: tables.quizzes.authorId
            })
            .from(tables.quizzes)
            .where(and(eq(tables.quizzes.id, quizId), eq(tables.quizzes.authorId, req.userID)));

        if (!quizAuthor) {
            res.status(403).json({
                error: 'The logged in account is not the owner of the quiz!'
            });
            return;
        }

        const [quiz] = await db
            .select()
            .from(tables.quizzes)
            .where(eq(tables.quizzes.id, quizId));

        if (!quiz) {
            res.status(404).json({ error: 'The quiz does not exist' });
            return;
        }

        await db
            .update(tables.quizzes)
            .set(req.body)
            .where(eq(tables.quizzes.id, quizId));

        res.status(200).json({ message: 'Successfully edited quiz' });
    }
);

quizRouter.delete('/:id', async (req: Request, res: Response) => {
    const quizId = Number(req.params.id);

    const [quiz] = await db
        .select({ authorId: tables.quizzes.authorId })
        .from(tables.quizzes)
        .where(eq(tables.quizzes.id, quizId));

    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    if (quiz.authorId !== req.userID && req.role !== 'admin')
        return res.status(403).json({ error: 'Forbidden' });

    await db.transaction(async (tx) => {
        await tx.delete(tables.comments).where(eq(tables.comments.quizId, quizId));
        await tx.delete(tables.questions).where(eq(tables.questions.quizId, quizId));
        await tx.delete(tables.assignmentsToQuizzes).where(eq(tables.assignmentsToQuizzes.quizId, quizId));
        await tx.delete(tables.quizAttempts).where(eq(tables.quizAttempts.quizId, quizId));
        await tx.delete(tables.quizzes).where(eq(tables.quizzes.id, quizId));
    });

    res.status(200).json({ message: 'Quiz deleted' });
});

export default quizRouter;
