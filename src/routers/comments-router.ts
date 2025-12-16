import { Router, Request, Response } from 'express';
import { db } from '../../db.ts';
import * as tables from '../../schema.ts';
import { commentCreateSchema, commentEditSchema } from '../../zod-schemas.ts';
import { zodMiddleware } from '../middleware/zod-middleware.ts';
import { eq } from 'drizzle-orm';

const commentsRouter = Router();

commentsRouter.get('/quizzes/:quizId/comments', async (req: Request, res: Response) => {
    const quizId = Number(req.params.quizId);
    const rows = await db
        .select()
        .from(tables.comments)
        .where(eq(tables.comments.quizId, quizId));
    res.status(200).json(rows);
});

commentsRouter.post(
    '/quizzes/:quizId/comments',
    zodMiddleware(commentCreateSchema),
    async (req: Request, res: Response) => {
        const quizId = Number(req.params.quizId);
        const [comment] = await db
            .insert(tables.comments)
            .values({
                quizId,
                userId: req.userID,
                text: req.body.text,
                createdAt: new Date()
            })
            .returning({ id: tables.comments.id });
        res.status(201).json({ id: comment.id });
    }
);

commentsRouter.patch(
    '/comments/:id',
    zodMiddleware(commentEditSchema),
    async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const [comment] = await db
            .select({ userId: tables.comments.userId })
            .from(tables.comments)
            .where(eq(tables.comments.id, id));
        if (!comment) return res.status(404).json({ error: 'Comment not found' });
        if (comment.userId !== req.userID && req.role !== 'admin')
            return res.status(403).json({ error: 'Forbidden' });

        await db
            .update(tables.comments)
            .set({ text: req.body.text })
            .where(eq(tables.comments.id, id));
        res.status(200).json({ message: 'Comment updated' });
    }
);

commentsRouter.delete('/comments/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const [comment] = await db
        .select({ userId: tables.comments.userId })
        .from(tables.comments)
        .where(eq(tables.comments.id, id));
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== req.userID && req.role !== 'admin')
        return res.status(403).json({ error: 'Forbidden' });

    await db.delete(tables.comments).where(eq(tables.comments.id, id));
    res.status(200).json({ message: 'Comment deleted' });
});

export default commentsRouter;

