import { NextFunction, Request, Response } from 'express';

export function requireRole(role: 'admin') {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.role !== role) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        next();
    };
}

