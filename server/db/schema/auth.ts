import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

const userTable = pgTable("user", {
  id: text("id").primaryKey(),
  userName: text("username").notNull().unique(),
  password_hash: text("password_hash").notNull()
});

const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date"
  }).notNull()
});

export { userTable, sessionTable }