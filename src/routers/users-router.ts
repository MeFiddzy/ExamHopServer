import { Router, Response, Request } from 'express';
import jwt from "jsonwebtoken";
import envConfig from "../../env.config.ts";
import { db } from "../../db.ts";
import * as tables from '../../schema.ts'
import { eq } from "drizzle-orm";

const usersRouter = Router();

usersRouter.get('/profile', (req: Request, res: Response) => {
    let { token } = req.body;

    jwt.verify(token, envConfig.TOKEN_SECRET, async (err: any, decoded: any) => {
        if (err) {
            res.status(400).json({ error: "Incorrect token" });
            return;
        }

        console.log(decoded);

        const [userData] = await db.select({
            id: tables.users.id,
            username: tables.users.username,
            firstName: tables.users.firstName,
            lastName: tables.users.lastName,
            email: tables.users.email,
            birthday: tables.users.birthday,
        }).from(tables.users).where(eq(tables.users.id, decoded!.user_id));

        console.log(userData);

        res.status(200).json(userData);
    })
})

export default usersRouter;