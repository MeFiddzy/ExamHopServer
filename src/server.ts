import express from 'express';
import { authMiddleware } from './middleware/auth-middleware.ts';
import authRouter from './routers/auth-router.ts';
import usersRouter from './routers/users-router.ts';
import quizRouter from './routers/quiz-router.ts';
import questionRouter from './routers/queston-router.ts';

export const app = express();
const hostname = 'localhost';
const port = 8000;

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', authMiddleware, usersRouter);
app.use('/api/quiz', authMiddleware, quizRouter);
app.use('/api/question', authMiddleware, questionRouter);

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
