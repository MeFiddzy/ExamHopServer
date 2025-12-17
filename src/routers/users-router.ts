import { Router, Response, Request } from 'express';
import { db } from '../../db.ts';
import * as tables from '../../schema.ts';
import { eq } from 'drizzle-orm';
import * as zodSchemas from '../../zod-schemas.ts';
import { zodMiddleware } from '../middleware/zod-middleware.ts';

const usersRouter = Router();

usersRouter.get('/me', async (req: Request, res: Response) => {
    const [userData] = await db
        .select({
            id: tables.users.id,
            username: tables.users.username,
            firstName: tables.users.firstName,
            lastName: tables.users.lastName,
            email: tables.users.email,
            birthday: tables.users.birthday,
            role: tables.users.role
        })
        .from(tables.users)
        .where(eq(tables.users.id, req.userID));

    if (!userData) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(userData);
});

usersRouter.patch(
    '/me',
    zodMiddleware(zodSchemas.userUpdateSchema),
    async (req: Request, res: Response) => {
        await db
            .update(tables.users)
            .set(req.body)
            .where(eq(tables.users.id, req.userID));
        res.status(200).json({ message: 'Profile updated' });
    }
);

usersRouter.delete('/me', async (req: Request, res: Response) => {
    await db.delete(tables.users).where(eq(tables.users.id, req.userID));
    res.status(200).json({ message: 'Account deleted (hard)' });
});

usersRouter.

usersRouter.get('/', async (req: Request, res: Response) => {
    const parsed = zodSchemas.userListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? 'Validation error';
        return res.status(400).json({ error: msg });
    }

    const { page, pageSize } = parsed.data;
    const offset = (page - 1) * pageSize;

    const usersList = await db
        .select({
            id: tables.users.id,
            username: tables.users.username,
            firstName: tables.users.firstName,
            lastName: tables.users.lastName,
            email: tables.users.email,
            birthday: tables.users.birthday,
            role: tables.users.role
        })
        .from(tables.users)
        .limit(pageSize)
        .offset(offset);

    res.status(200).json({ data: usersList, page, pageSize });
});

usersRouter.get('/:id', async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    const [userData] = await db
        .select({
            id: tables.users.id,
            username: tables.users.username,
            firstName: tables.users.firstName,
            lastName: tables.users.lastName,
            email: tables.users.email,
            birthday: tables.users.birthday,
            role: tables.users.role
        })
        .from(tables.users)
        .where(eq(tables.users.id, userId));

    if (!userData) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(userData);
});

export default usersRouter;
