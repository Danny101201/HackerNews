import { drizzle } from "drizzle-orm/postgres-js";
import postgres from 'postgres';
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

import { z } from "zod";
import { sessionTable, userTable } from "./db/schema/auth";
import { postTable } from "./db/schema/post";


const EnvSchema = z.object({
  DATABASE_URL: z.string().url()
})

const processEnv = EnvSchema.parse(process.env)

const queryClient = postgres(processEnv.DATABASE_URL);
const db = drizzle({
  client: queryClient,
  schema: {
    user: userTable,
    session: sessionTable,
    post: postTable,
  }
});

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export { db, adapter }