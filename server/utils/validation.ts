import type { H3Event } from 'h3'
import type { z } from 'zod'

/**
 * Parse and validate query parameters using a Zod schema.
 *
 * @param event - The H3 event
 * @param schema - Zod schema to validate against
 * @returns Validated and typed query parameters
 * @throws 400 Bad Request if validation fails
 *
 * @example
 * ```ts
 * const querySchema = z.object({ page: z.coerce.number().optional() })
 * const { page } = parseQuery(event, querySchema)
 * ```
 */
export const parseQuery = <T extends z.ZodType>(event: H3Event, schema: T): z.infer<T> => {
  const query = getQuery(event)
  const result = schema.safeParse(query)

  if (!result.success) {
    const details: ApiErrorDetail[] = result.error.issues
    throw apiBadRequestError('Invalid query parameter(s)', { details })
  }

  return result.data
}

/**
 * Parse and validate route parameters using a Zod schema.
 *
 * @param event - The H3 event
 * @param schema - Zod schema to validate against
 * @returns Validated and typed route parameters
 * @throws 400 Bad Request if validation fails
 *
 * @example
 * ```ts
 * const paramsSchema = z.object({ id: z.coerce.number() })
 * const { id } = parseRouteParams(event, paramsSchema)
 * ```
 */
export const parseRouteParams = <T extends z.ZodType>(event: H3Event, schema: T): z.infer<T> => {
  const params = getRouterParams(event)
  const result = schema.safeParse(params)

  if (!result.success) {
    const details: ApiErrorDetail[] = result.error.issues
    throw apiBadRequestError('Invalid route parameter(s)', { details })
  }

  return result.data
}

/**
 * Parse and validate request body using a Zod schema.
 *
 * @param event - The H3 event
 * @param schema - Zod schema to validate against
 * @returns Validated and typed request body
 * @throws 400 Bad Request if validation fails
 *
 * @example
 * ```ts
 * const bodySchema = z.object({ name: z.string(), email: z.string().email() })
 * const { name, email } = await parseBody(event, bodySchema)
 * ```
 */
export const parseBody = async <T extends z.ZodType>(
  event: H3Event,
  schema: T
): Promise<z.infer<T>> => {
  const body = await readBody(event)
  const result = schema.safeParse(body)

  if (!result.success) {
    const details: ApiErrorDetail[] = result.error.issues
    throw apiBadRequestError('Invalid request body', { details })
  }

  return result.data
}
