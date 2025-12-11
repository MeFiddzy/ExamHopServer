import express from 'express';
import authRouter from './routers/auth-router.ts';
import usersRouter from './routers/users-router.ts';
import statsRouter from './routers/stats-router.ts';
import * as middleware from './middleware';

export const app = express();
const hostname = 'localhost';
const port = 8000;

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', middleware.authenticateJWT, usersRouter);
app.use('/api/stats', middleware.authenticateJWT, statsRouter);

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
