import { cors } from 'hono/cors';
import type { ErrorResponse } from "@/shared/types";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { lucia } from "./lucia";
import type { Context } from './context';
import { authRouter } from './routes/auth';
const app = new Hono<Context>();
app.use("*", cors(), async (c, next) => {
  const sessionId = lucia.readSessionCookie(c.req.header("Cookie") ?? "");
  if (!sessionId) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
  }
  if (!session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), { append: true });
  }
  c.set("session", session);
  c.set("user", user);
  return next();
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app.basePath("/api").route('/auth', authRouter)

app.onError((err, c) => {
  // throw new HTTPException(404, { message: 'Not Found', cause: {form:true} })
  // throw new HTTPException(404, { message: 'Not Found' })
  // throw new Error('Unexpected error')
  if (err instanceof HTTPException) {
    const errorResponse = err.res ?? c.json<ErrorResponse>({
      success: false,
      error: err.message,
      isFormError: err.cause && typeof err.cause === 'object' && 'form' in err.cause
        ? err.cause.form === true
        : false
    }, err.status)

    return errorResponse
  }

  return c.json<ErrorResponse>({
    success: false,
    error: process.env.NODE_ENV === 'production' ? "Interal Server Error" : err.stack ?? err.message
  }, 500)
})

export default {
  port: 4000,
  fetch: app.fetch,
} 

export type ApiRoutes = typeof routes
