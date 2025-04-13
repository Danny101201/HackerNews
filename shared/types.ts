import { type } from 'arktype'
import { z } from "zod"

export type SuccessResponse<T = void> = {
  success: true,
  message: string
} & (T extends void ? {} : { data: T })

export type ErrorResponse = {
  success: false,
  error: string,
  isFormError?: boolean
}

// export const loginSchema = z.object({
//   userName: z.string().min(3).max(31).regex(/^[a-zA-Z0-9_]+/),
//   password: z.string().min(3).max(255)
// })
export const loginSchema = type({
  userName: type.string.moreThanLength(3).atMostLength(31).narrow(value => /^[a-zA-Z0-9_]+/.test(value)),
  password: type.string.moreThanLength(3).atMostLength(255),
})

export type LoginSchema = typeof loginSchema.infer
// if (result instanceof type.errors) {
//   // hover out.summary to see validation errors
//   console.error(result.summary)
// } else {
//   // hover out to see your validated data
//   console.log(result)
// }

