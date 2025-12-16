import { Router, Request, Response } from 'express';
import { db } from '../../db.ts';
import * as tables from '../../schema.ts';
import {
    classCreateSchema,
    classMembershipSchema,
    classUpdateSchema,
    paginationSchema
} from '../../zod-schemas.ts';
import { zodMiddleware } from '../middleware/zod-middleware.ts';
import { and, eq } from 'drizzle-orm';

const classesRouter = Router();

classesRouter.get('/classes', async (req: Request, res: Response) => {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues[0].message });
    const { page, pageSize } = parsed.data;
    const offset = (page - 1) * pageSize;

    const classes = await db
        .select()
        .from(tables.classes)
        .limit(pageSize)
        .offset(offset);

    res.status(200).json({ data: classes, page, pageSize });
});

classesRouter.get('/classes/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const [cls] = await db.select().from(tables.classes).where(eq(tables.classes.id, id));
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.status(200).json(cls);
});

classesRouter.post(
    '/classes',
    zodMiddleware(classCreateSchema),
    async (req: Request, res: Response) => {
        const [cls] = await db
            .insert(tables.classes)
            .values({ name: req.body.name, authorId: req.userID })
            .returning({ id: tables.classes.id });
        res.status(201).json({ id: cls.id });
    }
);

classesRouter.patch(
    '/classes/:id',
    zodMiddleware(classUpdateSchema),
    async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const [cls] = await db
            .select({ authorId: tables.classes.authorId })
            .from(tables.classes)
            .where(eq(tables.classes.id, id));
        if (!cls) return res.status(404).json({ error: 'Class not found' });
        if (cls.authorId !== req.userID && req.role !== 'admin')
            return res.status(403).json({ error: 'Forbidden' });

        await db.update(tables.classes).set(req.body).where(eq(tables.classes.id, id));
        res.status(200).json({ message: 'Class updated' });
    }
);

classesRouter.delete('/classes/:id', async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const [cls] = await db
        .select({ authorId: tables.classes.authorId })
        .from(tables.classes)
        .where(eq(tables.classes.id, id));
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    if (cls.authorId !== req.userID && req.role !== 'admin')
        return res.status(403).json({ error: 'Forbidden' });

    await db.delete(tables.studentsToClasses).where(eq(tables.studentsToClasses.classId, id));
    await db.delete(tables.teachersToClasses).where(eq(tables.teachersToClasses.classId, id));
    await db.delete(tables.classes).where(eq(tables.classes.id, id));
    res.status(200).json({ message: 'Class deleted' });
});

classesRouter.post(
    '/classes/:id/students',
    zodMiddleware(classMembershipSchema),
    async (req: Request, res: Response) => {
        const classId = Number(req.params.id);
        await db
            .insert(tables.studentsToClasses)
            .values({ classId, userId: req.body.userId })
            .onConflictDoNothing();
        res.status(201).json({ message: 'Student added' });
    }
);

classesRouter.delete('/classes/:id/students/:userId', async (req: Request, res: Response) => {
    const classId = Number(req.params.id);
    const userId = Number(req.params.userId);
    await db
        .delete(tables.studentsToClasses)
        .where(
            and(
                eq(tables.studentsToClasses.classId, classId),
                eq(tables.studentsToClasses.userId, userId)
            )
        );
    res.status(200).json({ message: 'Student removed' });
});

classesRouter.post(
    '/classes/:id/teachers',
    zodMiddleware(classMembershipSchema),
    async (req: Request, res: Response) => {
        const classId = Number(req.params.id);
        await db
            .insert(tables.teachersToClasses)
            .values({ classId, userId: req.body.userId })
            .onConflictDoNothing();
        res.status(201).json({ message: 'Teacher added' });
    }
);

classesRouter.delete('/classes/:id/teachers/:userId', async (req: Request, res: Response) => {
    const classId = Number(req.params.id);
    const userId = Number(req.params.userId);
    await db
        .delete(tables.teachersToClasses)
        .where(
            and(
                eq(tables.teachersToClasses.classId, classId),
                eq(tables.teachersToClasses.userId, userId)
            )
        );
    res.status(200).json({ message: 'Teacher removed' });
});

export default classesRouter;

