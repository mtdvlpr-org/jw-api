import type pino from 'pino'
import type { $ZodIssue } from 'zod/v4/core'

/**
 * Standard API response envelope types.
 *
 * Success responses follow a consistent structure with:
 * - `success`: Boolean indicating the request succeeded
 * - `data`: The actual payload
 * - `meta`: Request metadata
 * - `links`: HATEOAS links (optional)
 * - `pagination`: Pagination info (optional, for collections)
 *
 * Error responses use Nuxt's createError format with meta in the data property.
 */

/* Error Details */

export interface ApiErrorData {
  /** Field-level error details (for validation errors) */
  details?: ApiErrorDetail[]
  /** Request metadata */
  meta: ApiMeta
}

export type ApiErrorDetail = $ZodIssue

/* HATEOAS Links */

export interface ApiLinks {
  /** Link to the first page (paginated responses) */
  first?: string
  /** Link to the last page (paginated responses) */
  last?: string
  /** Link to the next page (paginated responses) */
  next?: string
  /** Link to the previous page (paginated responses) */
  prev?: string
  /** Additional related resource links */
  related?: Record<string, string>
  /** Link to the current resource */
  self: string
}

/* Meta Information */

export interface ApiMeta {
  /** The correlation ID for request tracing */
  requestId: string
  /** Response time in milliseconds */
  responseTime: number
  /** ISO 8601 timestamp of when the response was generated */
  timestamp: string
  /** API version that handled the request */
  version: string
}

/* Pagination */

/** Successful paginated API response */
export interface ApiPaginatedResponse<T> {
  data: T[]
  links?: ApiLinks
  meta: ApiMeta & {
    pagination: ApiPagination
  }
  success: true
}

/* Response Types */

export interface ApiPagination {
  /** Current page number (1-indexed) */
  page: number
  /** Number of items per page */
  pageSize: number
  /** Total number of items across all pages */
  totalItems: number
  /** Total number of pages */
  totalPages: number
}

/** Successful API response */
export interface ApiSuccessResponse<T> {
  data: T
  links?: ApiLinks
  meta: ApiMeta
  success: true
}

/* Request Context */

/** Context stored in async local storage for each request */
export interface RequestContext {
  /** Pino logger instance for the request */
  logger: pino.Logger
  /** Unique request ID for tracing */
  requestId: string
  /** Request start time in milliseconds */
  startTime: number
}
