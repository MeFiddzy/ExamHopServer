import { Router, Request, Response } from 'express';
import { db } from '../../db.ts';
import * as tables from '../../schema.ts';
import {
    assignmentCreateSchema,
    assignmentQuizLinkSchema,
    assignmentUpdateSchema
} from '../../zod-schemas.ts';
import { zodMiddleware } from '../middleware/zod-middleware.ts';
import { and, eq } from 'drizzle-orm';

const assignmentsRouter = Router();

assignmentsRouter.get(
    '/classes/:classId/assignments',
    async (req: Request, res: Response) => {
        const classId = Number(req.params.classId);
        const rows = await db
            .select()
            .from(tables.assignments)
            .where(eq(tables.assignments.classId, classId));
        res.status(200).json(rows);
    }
);

assignmentsRouter.get(
    '/assignments/:id',
    async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const [row] = await db
            .select()
            .from(tables.assignments)
            .where(eq(tables.assignments.id, id));
        if (!row)
            return res.status(404).json({ error: 'Assignment not found' });
        res.status(200).json(row);
    }
);

assignmentsRouter.post(
    '/classes/:classId/assignments',
    zodMiddleware(assignmentCreateSchema),
    async (req: Request, res: Response) => {
        const classId = Number(req.params.classId);
        const { title, dueBy, description, quizIds } = req.body;

        const created = await db.transaction(async (tx) => {
            const [assignment] = await tx
                .insert(tables.assignments)
                .values({
                    classId,
                    authorId: req.userID,
                    title,
                    dueBy,
                    description,
                    createdAt: new Date()
                })
                .returning({ id: tables.assignments.id });

            if (quizIds?.length) {
                await tx.insert(tables.assignmentsToQuizzes).values(
                    quizIds.map((quizId: number) => ({
                        assignmentId: assignment.id,
                        quizId
                    }))
                );
            }
            return assignment;
        });

        res.status(201).json({ id: created.id });
    }
);

assignmentsRouter.patch(
    '/assignments/:id',
    zodMiddleware(assignmentUpdateSchema),
    async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const [assignment] = await db
            .select({ authorId: tables.assignments.authorId })
            .from(tables.assignments)
            .where(eq(tables.assignments.id, id));
        if (!assignment)
            return res.status(404).json({ error: 'Assignment not found' });
        if (assignment.authorId !== req.userID && req.role !== 'admin')
            return res.status(403).json({ error: 'Forbidden' });

        await db
            .update(tables.assignments)
            .set(req.body)
            .where(eq(tables.assignments.id, id));
        res.status(200).json({ message: 'Assignment updated' });
    }
);

assignmentsRouter.delete(
    '/assignments/:id',
    async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const [assignment] = await db
            .select({ authorId: tables.assignments.authorId })
            .from(tables.assignments)
            .where(eq(tables.assignments.id, id));
        if (!assignment)
            return res.status(404).json({ error: 'Assignment not found' });
        if (assignment.authorId !== req.userID && req.role !== 'admin')
            return res.status(403).json({ error: 'Forbidden' });

        await db
            .delete(tables.assignmentsToQuizzes)
            .where(eq(tables.assignmentsToQuizzes.assignmentId, id));
        await db
            .delete(tables.assignments)
            .where(eq(tables.assignments.id, id));
        res.status(200).json({ message: 'Assignment deleted' });
    }
);

assignmentsRouter.get(
    '/assignments/:id/quizzes',
    async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const rows = await db
            .select()
            .from(tables.assignmentsToQuizzes)
            .where(eq(tables.assignmentsToQuizzes.assignmentId, id));
        res.status(200).json(rows);
    }
);

assignmentsRouter.post(
    '/assignments/:id/quizzes',
    zodMiddleware(assignmentQuizLinkSchema),
    async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        await db
            .insert(tables.assignmentsToQuizzes)
            .values(
                req.body.quizIds.map((quizId: number) => ({
                    assignmentId: id,
                    quizId
                }))
            )
            .onConflictDoNothing();
        res.status(201).json({ message: 'Quizzes linked' });
    }
);

assignmentsRouter.delete(
    '/assignments/:id/quizzes/:quizId',
    async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const quizId = Number(req.params.quizId);
        await db
            .delete(tables.assignmentsToQuizzes)
            .where(
                and(
                    eq(tables.assignmentsToQuizzes.assignmentId, id),
                    eq(tables.assignmentsToQuizzes.quizId, quizId)
                )
            );
        res.status(200).json({ message: 'Quiz unlinked' });
    }
);

export default assignmentsRouter;
