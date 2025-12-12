import { NextFunction, Response, Request } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import envConfig from '../../env.config.ts';

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({
            error: 'Missing or invalid authorization header'
        });
        return;
    }

    const token = header.split(' ')[1];

    try {
        req.userID = +(jwt.verify(token!, envConfig.TOKEN_SECRET) as JwtPayload)
            .userId;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized' });
    }
}
