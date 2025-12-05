import { config } from 'dotenv';

config();

export default {
    DB_URL: process.env.DB_URL ?? '',
    TOKEN_SECRET: process.env.TOKEN_SECRET ?? ''
}
