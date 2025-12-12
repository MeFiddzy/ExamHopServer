import { Router } from 'express';
import { zodMiddleware } from '../middleware/zod-middleware.ts';
import * as zodSchemas from '../../zod-schemas.ts';
import { Request, Response } from 'express';
import { db } from '../../db.ts';
import * as tables from '../../schema.ts';

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

        const quizID = quiz!.id;

        db.insert(tables.questions).values([
            questions.map((question: any) => ({
                quizId: quizID,
                title: question.title,
                data: question.data
            }))
        ]);
        res.status(200).json({message: 'Successfully created quiz'});
    }
);

export default quizRouter;
