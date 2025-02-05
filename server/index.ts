import type { ErrorResponse } from "@/shared/types";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

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

export default app;
