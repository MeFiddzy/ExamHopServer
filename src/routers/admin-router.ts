import { Router, Request, Response } from 'express';
import { db } from '../../db.ts';
import * as tables from '../../schema.ts';
import {
    adminSetRoleSchema,
    adminUserCreateSchema,
    userListQuerySchema,
    userUpdateSchema
} from '../../zod-schemas.ts';
import { zodMiddleware } from '../middleware/zod-middleware.ts';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

const adminRouter = Router();

adminRouter.get('/users', async (req: Request, res: Response) => {
    const parsed = userListQuerySchema.safeParse(req.query);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues[0].message });
    const { page, pageSize } = parsed.data;
    const offset = (page - 1) * pageSize;

    const users = await db
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

    res.status(200).json({ data: users, page, pageSize });
});

adminRouter.get('/users/:id', async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    const [user] = await db
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

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
});

adminRouter.post(
    '/users',
    zodMiddleware(adminUserCreateSchema),
    async (req: Request, res: Response) => {
        const { password, role, ...rest } = req.body;
        const hash = await bcrypt.hash(password, 10);

        const [user] = await db
            .insert(tables.users)
            .values({
                ...rest,
                role: role ?? 'user',
                passwordHash: hash,
                deletedAt: null
            })
            .returning({ id: tables.users.id });

        res.status(201).json({ id: user.id });
    }
);

adminRouter.patch(
    '/users/:id',
    zodMiddleware(userUpdateSchema),
    async (req: Request, res: Response) => {
        const userId = Number(req.params.id);
        await db.update(tables.users).set(req.body).where(eq(tables.users.id, userId));
        res.status(200).json({ message: 'User updated' });
    }
);

adminRouter.delete('/users/:id', async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    await db.delete(tables.users).where(eq(tables.users.id, userId));
    res.status(200).json({ message: 'User deleted' });
});

adminRouter.post(
    '/users/:id/role',
    zodMiddleware(adminSetRoleSchema),
    async (req: Request, res: Response) => {
        const userId = Number(req.params.id);
        await db
            .update(tables.users)
            .set({ role: req.body.role })
            .where(eq(tables.users.id, userId));
        res.status(200).json({ message: 'Role updated' });
    }
);

export default adminRouter;

