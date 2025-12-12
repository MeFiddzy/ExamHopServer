import { NextFunction, Request, Response } from 'express';
import * as zod from 'zod';

export function zodMiddleware(schema: any) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (err) {
            if (err instanceof zod.ZodError) {
                // @ts-ignore
                return res.status(400).json({ error: err.issues[0].message });
            }
            res.status(500).json({ error: 'Server Error' });
        }
    };
}
