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
    const { email, password } = req.body;

    const [user] = await db
        .select({
            passwordHash: tables.users.passwordHash,
            userId: tables.users.id
        })
        .from(tables.users)
        .where(drizzle.eq(tables.users.email, email));

    console.log(user);

    if (!user || !await bcrypt.compare(password, user!.passwordHash)) {
        res.status(404).json({ error: "Incorrect email or password" });
        return;
    }

    const token = jwt.sign(
        {user_id: user!.userId},
        envData.TOKEN_SECRET
    )

    res.status(200).json({ message: "Login successfully", token: token });
});

authRouter.post('/register', async (req: Request, res: Response) => {
    let { username, email, birthday, firstName, lastName, password } = req.body;

    console.log(req.body);

    try {
        zodSchemas.registerSchema.parse({
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
        await db.insert(tables.users).values({
            username: username,
            firstName: firstName,
            lastName: lastName,
            email: email,
            birthday: birthday,
            passwordHash: hash,
        });
    }
    catch (err) {
        console.log(err);

        // @ts-ignore
        if (err.cause.code == 23505)
            res.status(400).json({error: "Username or email already exists!"});
        else {
            res.status(500).json({ error: "Database error" });
        }
        return;
    }

    res.status(200).json({message: "User registered successfully!"});
});

export default authRouter;