defineRouteMeta({
  openAPI: {
    description: 'Get the health of the API.',
    operationId: 'getHealth',
    responses: {
      200: {
        content: {
          'application/json': {
            example: { status: 'OK' },
            schema: {
              properties: { status: { example: 'OK', type: 'string' } },
              required: ['status'],
              type: 'object'
            }
          }
        },
        description: 'Successful response.'
      }
    },
    summary: 'Get health.',
    tags: ['API Routes']
  }
})

export default defineEventHandler(async () => {
  return { status: 'OK' }
})
