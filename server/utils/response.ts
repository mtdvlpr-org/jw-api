import type { NuxtError } from 'nuxt/app'

import { FetchError } from 'ofetch'

/**
 * Get the current request context from async local storage.
 * Falls back to defaults if not in a request context.
 */
const getRequestContext = () => {
  const store = asyncLocalStorage.getStore()
  return {
    requestId: store?.requestId ?? 'unknown',
    startTime: store?.startTime ?? Date.now()
  }
}

/**
 * Build the meta object for API responses.
 */
export const buildMeta = (): ApiMeta => {
  const { apiVersion } = useRuntimeConfig()
  const { requestId, startTime } = getRequestContext()
  return {
    requestId,
    responseTime: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    version: apiVersion
  }
}

/**
 * Create a successful API response with the standard envelope.
 *
 * @param data - The response payload
 * @param links - Optional HATEOAS links
 * @returns Wrapped response with success envelope
 *
 * @example
 * ```ts
 * return apiSuccess({ status: 'OK' })
 * // Returns: { success: true, data: { status: 'OK' }, meta: {...} }
 * ```
 */
export const apiSuccess = <T>(data: T, links?: ApiLinks): ApiSuccessResponse<T> => {
  const response: ApiSuccessResponse<T> = {
    data,
    meta: buildMeta(),
    success: true
  }

  if (links) {
    response.links = links
  }

  return response
}

/**
 * Create a paginated API response with the standard envelope.
 *
 * @param data - Array of items for the current page
 * @param pagination - Pagination details
 * @param links - Optional HATEOAS links (self, first, prev, next, last)
 * @returns Wrapped response with pagination envelope
 *
 * @example
 * ```ts
 * return apiPaginated(items, { page: 1, pageSize: 20, totalItems: 100, totalPages: 5 })
 * ```
 */
export const apiPaginated = <T>(
  data: T[],
  pagination: ApiPagination,
  links?: ApiLinks
): ApiPaginatedResponse<T> => {
  const response: ApiPaginatedResponse<T> = {
    data,
    meta: {
      ...buildMeta(),
      pagination
    },
    success: true
  }

  if (links) {
    response.links = links
  }

  return response
}

/**
 * Build error data with meta and optional details.
 *
 * @param details - Optional field-level error details
 * @returns Error data object with meta
 */
const buildErrorData = (details?: ApiErrorDetail[]): ApiErrorData => {
  const data: ApiErrorData = {
    meta: buildMeta()
  }

  if (details?.length) {
    data.details = details
  }

  return data
}

type ApiError = RequiredFields<NuxtError<ApiErrorData>, 'data' | 'status' | 'statusText'>

export const isApiError = (error: unknown): error is ApiError => {
  return (
    error instanceof Error &&
    'status' in error &&
    'fatal' in error &&
    'statusText' in error &&
    'data' in error &&
    typeof error.data === 'object' &&
    error.data !== null &&
    'meta' in error.data
  )
}

interface ApiErrorOptions {
  cause?: unknown
  details?: ApiErrorDetail[]
}

/**
 * Create an API error.
 * Uses Nuxt's createError for proper content negotiation (HTML in browser, JSON for API clients).
 * The data property contains meta information for request tracing.
 *
 * @param message - Human-readable error message
 * @param status - HTTP status code
 * @param statusText - HTTP status text
 * @param options - Optional error details and cause
 */
const apiError = (
  message: string,
  status: number,
  statusText: string,
  options?: ApiErrorOptions
): ApiError => {
  return createError({
    cause: options?.cause,
    data: buildErrorData(options?.details),
    message,
    status,
    statusText
  }) as ApiError
}

/* Convenience error creators */

export const apiNotFoundError = (message: string, options?: ApiErrorOptions) =>
  apiError(message, 404, 'Not Found', options)

export const apiBadRequestError = (message: string, options?: ApiErrorOptions) =>
  apiError(message, 400, 'Bad Request', options)

export const apiUnauthorizedError = (message: string, options?: ApiErrorOptions) =>
  apiError(message, 401, 'Unauthorized', options)

export const apiForbiddenError = (message: string, options?: ApiErrorOptions) =>
  apiError(message, 403, 'Forbidden', options)

export const apiInternalError = (message: string, options?: ApiErrorOptions) =>
  apiError(message, 500, 'Internal Server Error', options)

/* Fetch error transformer */

interface FetchErrorContext {
  /** Custom message for 404 errors */
  notFoundMessage: string
  /** Name of the external service (e.g., "WOL", "Mediator") */
  serviceName: string
}

/**
 * Transforms fetch errors into appropriate API errors.
 * Use this in repository catch blocks to convert external service errors.
 *
 * @param error - The caught error
 * @param context - Service name and custom not found message
 * @returns An error to be thrown by the caller
 *
 * @example
 * ```ts
 * catch (error) {
 *   throw toFetchApiError(error, {
 *     serviceName: 'WOL',
 *     notFoundMessage: `Yeartext not found for language '${wtlocale}' and year ${year}`
 *   })
 * }
 * ```
 */
export const toFetchApiError = (error: unknown, context: FetchErrorContext): ApiError | Error => {
  const { notFoundMessage, serviceName } = context

  if (error instanceof FetchError || isApiError(error)) {
    const cause = { cause: error.cause ?? error }
    switch (error.status) {
      case 400:
        return apiBadRequestError(
          `Invalid request to ${serviceName} service: ${error.message}`,
          cause
        )
      case 401:
        return apiUnauthorizedError(
          `Unauthorized request to ${serviceName} service: ${error.message}`,
          cause
        )
      case 403:
        return apiForbiddenError(
          `Forbidden request to ${serviceName} service: ${error.message}`,
          cause
        )
      case 404:
        return apiNotFoundError(notFoundMessage, cause)
      case 500:
        return apiInternalError(`${serviceName} service unavailable: ${error.message}`, cause)
      default:
        return apiInternalError(
          `Failed to connect to ${serviceName} service: ${error.message}`,
          cause
        )
    }
  }

  // Return unexpected errors as-is
  return error instanceof Error ? error : new Error(String(error))
}
