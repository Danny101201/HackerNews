import { relations } from "drizzle-orm";
import { integer, serial, text, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { postTable } from "./post";
import { userTable } from "./auth";
import { commentTable } from "./comment";

const postUpvotesTable = pgTable("post_upvotes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

const postUpvoteRelations = relations(postUpvotesTable, ({ one }) => ({
  post: one(postTable, {
    fields: [postUpvotesTable.postId],
    references: [postTable.id],
    relationName: "postUpvotes",
  }),
  user: one(userTable, {
    fields: [postUpvotesTable.userId],
    references: [userTable.id],
    relationName: "user",
  }),
}));

const commentUpvotesTable = pgTable("comment_upvotes", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

const commentUpvoteRelations = relations(
  commentUpvotesTable,
  ({ one }) => ({
    post: one(commentTable, {
      fields: [commentUpvotesTable.commentId],
      references: [commentTable.id],
      relationName: "commentUpvotes",
    }),
    user: one(userTable, {
      fields: [commentUpvotesTable.userId],
      references: [userTable.id],
      relationName: "user",
    }),
  }),
);
export { postUpvotesTable, commentUpvotesTable, postUpvoteRelations, commentUpvoteRelations }