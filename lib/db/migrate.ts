import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

// Load environment variables from selected env file for standalone execution
const dbTarget = process.env.DB_TARGET?.trim();
const envFile = dbTarget === "production" ? ".env.production.local" : ".env.local";
dotenv.config({ path: envFile });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const main = async () => {
  try {
    await migrate(db, {
      migrationsFolder: "./lib/db/migrations",
    });

    console.log("Migration successful");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

main();
