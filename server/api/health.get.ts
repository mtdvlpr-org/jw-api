defineRouteMeta({
  openAPI: {
    description: 'Get the health of the API.',
    operationId: 'getHealth',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              description: 'Health check response.',
              properties: {
                data: {
                  properties: {
                    status: { enum: ['OK'], type: 'string' }
                  },
                  required: ['status'],
                  type: 'object'
                },
                links: { $ref: '#/components/schemas/ApiLinks' },
                meta: { $ref: '#/components/schemas/ApiMeta' },
                success: { enum: [true], type: 'boolean' }
              },
              required: ['success', 'data', 'meta'],
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

export default defineLoggedEventHandler(async () => {
  return apiSuccess({ status: 'OK' })
})
