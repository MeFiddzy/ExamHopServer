import express from 'express';
import { authMiddleware } from './middleware/auth-middleware.ts';
import { requireRole } from './middleware/role-middleware.ts';
import authRouter from './routers/auth-router.ts';
import usersRouter from './routers/users-router.ts';
import quizRouter from './routers/quiz-router.ts';
import questionRouter from './routers/queston-router.ts';
import adminRouter from './routers/admin-router.ts';
import commentsRouter from './routers/comments-router.ts';
import attemptsRouter from './routers/attempts-router.ts';
import classesRouter from './routers/classes-router.ts';
import assignmentsRouter from './routers/assignments-router.ts';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/openapi.ts';

export const app = express();
const hostname = 'localhost';
const port = 8000;

app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

app.use('/api/auth', authRouter);
app.use('/api/users', authMiddleware, usersRouter);
app.use('/api/admin', authMiddleware, requireRole('admin'), adminRouter);
app.use('/api/quizzes', authMiddleware, quizRouter);
app.use('/api/questions', authMiddleware, questionRouter);
app.use('/api', authMiddleware, commentsRouter);
app.use('/api', authMiddleware, attemptsRouter);
app.use('/api', authMiddleware, classesRouter);
app.use('/api', authMiddleware, assignmentsRouter);

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
