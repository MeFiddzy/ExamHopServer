import express from 'express';
import authRouter from './routers/auth-router.ts';
import usersRouter from './routers/users-router.ts';
import statsRouter from './routers/stats-router.ts';
import { authMiddleware } from './middleware/auth-middleware.ts';

export const app = express();
const hostname = 'localhost';
const port = 8000;

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', authMiddleware, usersRouter);
app.use('/api/stats', authMiddleware, statsRouter);

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
