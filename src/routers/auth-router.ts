import { Request, Router, Response } from "express";
import * as ZodSchemas from "../../zod-schemas.ts";
import { db } from '../../db.ts'
import jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import envConfig from "../../env.config.ts";
import * as Tables from '../../schema.ts'

const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
    let { username, password } = req.body;
});

authRouter.post('/register', async (req: Request, res: Response) => {
    let { username, email, birthday, first_name: firstName, lastName, password } = req.body;

    birthday = JSON.parse(birthday);

    try {
        ZodSchemas.userSchema.parse({
            username: username,
            email: email,
            birthday: birthday,
            password: password,
            legalName: { firstName, lastName },
        });
    }
    catch (err) {
        res.status(400).json({error: err});
    }

    const hash = await bcrypt.hash(req.body.password, 10);

    try {
        db.insert(Tables.users).values({
            username: username,
            firstName: firstName,
            lastName: lastName,
            email: email,
            birthday: birthday,
            passwordHash: hash,
        });
    }
    catch (err) {
        res.status(400).json({error: "Username already exists!"});
    }

    res.status(200).json({message: "User registered successfully!"});
});

export default authRouter;