import { defineConfig } from "drizzle-kit";
import envConfig from "./env.config.ts";
import {config} from 'dotenv';

config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./schema.ts",
  out: "./schema/migrations",
  dbCredentials: {
    url: envConfig.DB_URL
  }
});