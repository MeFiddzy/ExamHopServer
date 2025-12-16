import { Request, Response, Router } from 'express';
import { zodMiddleware } from '../middleware/zod-middleware.ts';
import * as zodSchemas from '../../zod-schemas.ts';
import { db } from '../../db.ts';
import * as tables from '../../schema.ts';
import { eq } from 'drizzle-orm';

const questionRouter = Router();

questionRouter.patch(
    '/edit/:id',
    zodMiddleware(zodSchemas.questionEditSchema),
    async (req: Request, res: Response) => {
        let questionId = Number(req.params.id);

        let edits = req.body;

        const [quizAuthor] = await db
            .select({
                authorId: tables.quizzes.authorId
            })
            .from(tables.questions)
            .leftJoin(tables.quizzes, eq(tables.quizzes.id, tables.questions.quizId))
            .where(eq(tables.quizzes.authorId, req.userID));

        console.log(quizAuthor);

        if (!quizAuthor) {
            res.status(403).json({
                error: 'The logged in account is not the owner of the quiz!'
            });
            return;
        }

        
    }
);

export default questionRouter;
