import {NextFunction, Request} from 'express';
import {JwtPayload} from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: string | JwtPayload;
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        //res.status(401).json({ error: "Missing or invalid authorization header"});
        return;
    }
}