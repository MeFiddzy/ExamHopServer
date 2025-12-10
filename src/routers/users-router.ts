import { Router, Response, Request } from 'express';
import jwt from "jsonwebtoken";
import envConfig from "../../env.config.ts";
import { db } from "../../db.ts";
import * as tables from '../../schema.ts'
import { eq } from "drizzle-orm";
import * as zodSchemas from '../../zod-schemas.ts'
import * as zod from "zod";
import * as bcrypt from "bcrypt";

const usersRouter = Router();

usersRouter.get('/profile', (req: Request, res: Response) => {
    let { token } = req.body;

    try {
        zodSchemas.profileSchema.parse({
            token: token,
        });
    }
    catch (err) {
        if (err instanceof zod.ZodError) {
            // @ts-ignore
            return res.status(400).json({ error: err.issues[0].message });
        }
        res.status(400).json({ error: "Unknown validation error" });
    }

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

usersRouter.patch('/reset_password', async (req: Request, res: Response) => {
    let { email, oldPassword, newPassword } = req.body;

    console.log(req.body);

    try {
        zodSchemas.resetPasswordSchema.parse({
            email: email,
            oldPassword: oldPassword,
            newPassword: newPassword
        })
    }
    catch (err) {
        if (err instanceof zod.ZodError) {
            // @ts-ignore
            return res.status(400).json({ error: err.issues[0].message });
        }
        res.status(400).json({ error: "Unknown validation error" });
    }

    const [passwordHashes] = await db.select({
        passwordHash: tables.users.passwordHash
    }).from(tables.users).where(eq(tables.users.email, email));

    if (!passwordHashes) {
        res.status(404).json({ error: "User doesn't exist!" });
        return;
    }

    console.log(passwordHashes);

    if (!await bcrypt.compare(oldPassword, passwordHashes!.passwordHash)) {
        res.status(400).json({ error: "Incorrect password!" });
        return;
    }

    let newHash = await bcrypt.hash(newPassword, 10);

    await db.update(tables.users).set({ passwordHash: newHash }).where(eq(tables.users.email, email));

    res.status(200).json({message: "Password updated"});
})

usersRouter.delete('/account_delete', async (req: Request, res: Response) => {
    let { email, password } = req.body;

    try {
        zodSchemas.loginSchema.parse({
            email: email,
            password: password
        })
    }
    catch (err) {
        if (err instanceof zod.ZodError) {
            // @ts-ignore
            return res.status(400).json({ error: err.issues[0].message });
        }
        res.status(400).json({ error: "Unknown validation error" })
    }

    let [passwordHashes] = await db.select({
        passwordHash: tables.users.passwordHash
    }).from(tables.users).where(eq(tables.users.email, email));

    if (!passwordHashes) {
        res.status(404).json({ error: "User not found!" });
        return;
    }

    if (!await bcrypt.compare(password, passwordHashes!.passwordHash)) {
        res.status(400).json({ error: "Incorrect password!" });
        return;
    }

    await db.delete(tables.users).where(eq(tables.users.email, email));

    res.status(200).json({message: "Account deleted"});
})

export default usersRouter;