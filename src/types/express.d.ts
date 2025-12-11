declare global {
    namespace Express {
        interface Request {
            userID: number;
        }
    }
}

export {};
