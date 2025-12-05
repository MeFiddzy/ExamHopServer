import { Request, Router, Response } from "express";
import * as zod from "zod";

import jwt from "jsonwebtoken";
import envConfig from "../../env.config.ts";

const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
    let { username, password } = req.body;
});

authRouter.post('/register', async (req: Request, res: Response) => {
    let { username, email, birthday, first_name, last_name, password } = req.body;

    birthday = JSON.parse(birthday);

    
});

export default authRouter;