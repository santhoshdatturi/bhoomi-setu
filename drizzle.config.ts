import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

const dbTarget = process.env.DB_TARGET?.trim();
const envFile = dbTarget === "production" ? ".env.production.local" : ".env.local";
dotenv.config({ path: envFile });

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema/index.ts",
  out: "./lib/db/migrations",
  schemaFilter: ["public", "auth"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
