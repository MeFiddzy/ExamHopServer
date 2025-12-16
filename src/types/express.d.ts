declare global {
    namespace Express {
        interface Request {
            userID: number;
            role?: 'user' | 'admin';
        }
    }
}

export {};
