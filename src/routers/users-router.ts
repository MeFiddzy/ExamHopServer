import { Router, Response, Request } from 'express';
import { db } from '../../db.ts';
import * as tables from '../../schema.ts';
import { eq } from 'drizzle-orm';
import * as zodSchemas from '../../zod-schemas.ts';
import * as zod from 'zod';
import * as bcrypt from 'bcrypt';
import { zodMiddleware } from '../middleware/zod-middleware.ts';

const usersRouter = Router();

usersRouter.get(
    '/profile',
    zodMiddleware(zodSchemas.profileSchema),
    async (req: Request, res: Response) => {
        let { token } = req.body;

        try {
            zodSchemas.profileSchema.parse({
                token: token
            });
        } catch (err) {
            if (err instanceof zod.ZodError) {
                // @ts-ignore
                return res.status(400).json({ error: err.issues[0].message });
            }
            res.status(400).json({ error: 'Unknown validation error' });
        }

        const [userData] = await db
            .select({
                id: tables.users.id,
                username: tables.users.username,
                firstName: tables.users.firstName,
                lastName: tables.users.lastName,
                email: tables.users.email,
                birthday: tables.users.birthday
            })
            .from(tables.users)
            .where(eq(tables.users.id, req.userID));

        res.status(200).json(userData);
    }
);
export default usersRouter;
