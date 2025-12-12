import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import envConfig from './env.config.ts';

const pool = new Pool({
    connectionString: envConfig.DB_URL
});

export const db = drizzle({
    client: pool
});
