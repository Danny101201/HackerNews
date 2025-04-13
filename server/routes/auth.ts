import type { Context } from "@/context";
import { Hono } from "hono";
import { arktypeValidator } from "@hono/arktype-validator";
import { loginSchema, type SuccessResponse } from "@/shared/types";
import { generateId } from "lucia";
import { db } from "@/adapter";
import { userTable } from "@/db/schema/auth";
import { lucia } from "@/lucia";
import postgres from "postgres";
import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";
import { loggedIn } from "@/middleware/loggedin";

const authRouter = new Hono<Context>()
  .post("/signup", arktypeValidator('form', loginSchema), async (c) => {
    const { userName, password } = c.req.valid("form")
    const passwordHash = await Bun.password.hash(password)
    const userId = generateId(15)

    try {
      await db.insert(userTable).values({
        id: userId,
        userName,
        password_hash: passwordHash
      })
      const session = await lucia.createSession(userId, { userName })
      const sessionCookie = lucia.createSessionCookie(session.id).serialize()
      c.header("Set-Cookie", sessionCookie, { append: true })
      return c.json<SuccessResponse>({
        success: true,
        message: "User created"
      }, 201)
    } catch (error) {
      if (error instanceof postgres.PostgresError && error.code === "23505") {
        throw new HTTPException(409, { message: "User already used" })
      }
      throw new HTTPException(500, { message: "Failed create user" })
    }
  })
  .post('/login', arktypeValidator('form', loginSchema), async (c) => {
    const { userName, password } = c.req.valid('form')
    const [existingUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.userName, userName))
      .limit(1)

    if (!existingUser) {
      throw new HTTPException(401, {
        message: "User not found"
      })
    }

    const validatePassword = await Bun.password.verify(
      password,
      existingUser.password_hash
    )
    if (!validatePassword) {
      throw new HTTPException(401, {
        message: "Incorrect password"
      })
    }
    const session = await lucia.createSession(existingUser.id, { userName })
    const sessionCookie = lucia.createSessionCookie(session.id).serialize()
    c.header("Set-Cookie", sessionCookie, { append: true })
    return c.json<SuccessResponse>({
      success: true,
      message: "Logged in"
    }, 201)
  })
  .get('/logout', async (c) => {
    const session = c.get('session')
    if (!session) {
      return c.redirect('/')
    }
    await lucia.invalidateSession(session.id)
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), { append: true })
    return c.redirect("/")
  })
  .get("/user", loggedIn, async (c) => {
    const user = c.get('user')!
    return c.json<SuccessResponse<{ username: string }>>({
      success: true,
      message: "User fetched",
      data: { username: user.userName }
    })
  })

export { authRouter }