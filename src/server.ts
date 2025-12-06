import express from 'express';
import authRouter from './routers/auth-router.ts';
import usersRouter from './routers/users-router.ts';


export const app = express();
const hostname = 'localhost';
const port = 8000;

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
