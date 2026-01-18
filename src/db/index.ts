import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config({ path: ".env.local" }); // or .env.local

const client = postgres(process.env.DATABASE_URL!, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});
export const db = drizzle(client, { schema });
