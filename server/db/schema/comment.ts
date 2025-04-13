import { relations } from "drizzle-orm";
import { integer, serial, text, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { userTable } from "./auth";
import { postTable } from "./post";
import { commentUpvotesTable } from "./upvotes";


const commentTable = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  postId: integer("post_id").notNull(),
  parentCommentId: integer("parent_comment_id"),
  context: text("context").notNull(),
  createdAt: timestamp("create_at", {
    withTimezone: true
  })
    .defaultNow()
    .notNull(),
  depth: integer("depth").default(0).notNull(),
  commentCount: integer("comment_count").default(0).notNull(),
  points: integer("points").default(0).notNull()
})

const commentRelation = relations(commentTable, ({ one, many }) => ({
  author: one(userTable, {
    fields: [commentTable.userId],
    references: [userTable.id],
    relationName: "author"
  }),
  parentComment: one(commentTable, {
    fields: [commentTable.parentCommentId],
    references: [commentTable.id],
    relationName: "childComments"
  }),
  childComments: many(commentTable, {
    relationName: 'childComments'
  }),
  post: one(postTable, {
    fields: [commentTable.postId],
    references: [postTable.id]
  }),
  commentUpvotes: many(commentUpvotesTable, { relationName: 'commentUpvotes' })
}))

export { commentTable, commentRelation }