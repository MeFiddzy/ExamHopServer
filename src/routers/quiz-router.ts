import { Router } from 'express';
import { zodMiddleware } from '../middleware/zod-middleware.ts';
import * as zodSchemas from '../../zod-schemas.ts';
import { Request, Response } from 'express';
import { db } from '../../db.ts';
import * as tables from '../../schema.ts';
import { eq } from 'drizzle-orm';

const quizRouter = Router();

quizRouter.post(
    '/create',
    zodMiddleware(zodSchemas.quizCreateSchema),
    async (req: Request, res: Response) => {
        let { title, description, difficulty, subject, viewType, questions } =
            req.body;

        const [quiz] = await db
            .insert(tables.quizzes)
            .values([
                {
                    title: title,
                    description: description,
                    difficulty: difficulty,
                    subject: subject,
                    viewType: viewType,
                    authorId: req.userID,
                    createdAt: new Date()
                }
            ])
            .returning({ id: tables.quizzes.id });

        await db.insert(tables.questions).values(
            questions.map((question: any) => ({
                quizId: quiz!.id,
                title: question.title,
                data: question.data
            }))
        );

        res.status(200).json({ message: 'Successfully created quiz' });
    }
);

quizRouter.post(
    '/edit/:id',
    zodMiddleware(zodSchemas.quizEditSchema),
    async (req: Request, res: Response) => {
        let quizId = Number(req.params.id);

        let edits = req.body;

        const [quizAuthor] = await db
            .select({
                authorId: tables.quizzes.authorId
            })
            .from(tables.quizzes)
            .where(eq(tables.quizzes.authorId, req.userID));

        if (!quizAuthor) {
            res.status(403).json({
                error: 'The logged in account is not the owner of the quiz!'
            });
            return;
        }

        const [quiz] = await db
            .select()
            .from(tables.quizzes)
            .where(eq(tables.quizzes.id, quizId));

        if (!quiz) {
            res.status(404).json({ error: 'The quiz does not exist' });
            return;
        }

        await db.update(tables.quizzes)
            .set(edits)
            .where(eq(tables.quizzes.id, quizId));

        res.status(200).json({ message: 'Successfully edited quiz' });
    }
);

export default quizRouter;
