export const createNotFoundError = <T = unknown>(statusMessage: string, data?: T) =>
  createError({ data, statusCode: 404, statusMessage, statusText: 'Not Found' })

export const createBadRequestError = <T = unknown>(statusMessage: string, data?: T) =>
  createError({ data, statusCode: 400, statusMessage, statusText: 'Bad Request' })

export const createInternalServerError = <T = unknown>(statusMessage: string, data?: T) => {
  logger.error(data instanceof Error ? data.message : String(data))
  return createError({ data, statusCode: 500, statusMessage, statusText: 'Internal Server Error' })
}

export const createUnauthorizedError = <T = unknown>(statusMessage: string, data?: T) =>
  createError({ data, statusCode: 401, statusMessage, statusText: 'Unauthorized' })

export const createForbiddenError = <T = unknown>(statusMessage: string, data?: T) =>
  createError({ data, statusCode: 403, statusMessage, statusText: 'Forbidden' })
