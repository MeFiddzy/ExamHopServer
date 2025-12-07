import { Request, Router, Response } from "express";
import * as zodSchemas from "../../zod-schemas.ts";
import { db } from '../../db.ts'
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import envData from "../../env.config.ts";
import * as tables from '../../schema.ts'
import * as zod from 'zod';
import * as drizzle from 'drizzle-orm';

const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
    const { identification, password } = req.body;

    let isUsername: boolean = false;

    try {
        zod.email().parse(identification)
    }
    catch (error) {
        isUsername = true;
    }

    const hash: string = await bcrypt.hash(password, 10);

    let username, userId, passwordHashInDb;

    if (isUsername) {
        // @ts-ignore
        [userId, username, passwordHashInDb] = await loginViaUsernameData(req, res, hash);
    }
    else {
        // @ts-ignore
        [userId, username, passwordHashInDb] = await loginViaEmailData(req, res, hash);
    }

    // @ts-ignore
    if (passwordHashInDb != passwordHash) {
        res.status(400).json({ error: "Incorrect password" });
        return;
    }

    const token = jwt.sign(
        {user_id: userId, username: username, password: req.body.password},
        envData.TOKEN_SECRET
    )

    res.status(200).json({ message: "Login successfully", token: token });
});

async function loginViaEmailData(req: Request, res: Response, passwordHash: string) {
    const [passwordHashInDb, userId, username] = await db
        .select({
            passwordHash: tables.users.passwordHash,
            userId: tables.users.id,
            username: tables.users.username
        })
        .from(tables.users)
        .where(drizzle.eq(tables.users.username, req.body.username));

    return { userId: userId, username: username, passwordHashInDb: passwordHashInDb};
}

async function loginViaUsernameData(req: Request, res: Response, passwordHash: string) {
    const [passwordHashInDb, userId, username] = await db
        .select({
            passwordHash: tables.users.passwordHash,
            userId: tables.users.id,
            username: tables.users.username
        })
        .from(tables.users)
        .where(drizzle.eq(tables.users.email, req.body.email));

    return { userId: userId, username: username, passwordHashInDb: passwordHashInDb};
}

authRouter.post('/register', async (req: Request, res: Response) => {
    let { username, email, birthday, firstName, lastName, password } = req.body;

    console.log(req.body);

    try {
        zodSchemas.userSchema.parse({
            username: username,
            email: email,
            birthday: birthday,
            password: password,
            legalName: { firstName, lastName },
        });
    }
    catch (err)  {
        if (err instanceof zod.ZodError) {
            // @ts-ignore
            return res.status(400).json({ error: err.issues[0].message });
        }
        res.status(400).json({ error: "Unknown validation error" });

        return;
    }

    const hash = await bcrypt.hash(req.body.password, 10);

    try {
        db.insert(tables.users).values({
            username: username,
            firstName: firstName,
            lastName: lastName,
            email: email,
            birthday: birthday,
            passwordHash: hash,
        });
    }
    catch (err) {
        res.status(400).json({error: "Username or email already exists!"});
        return;
    }

    res.status(200).json({message: "User registered successfully!"});
});

export default authRouter;