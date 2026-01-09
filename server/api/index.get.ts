defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        parameters: {
          LangCode: {
            description: 'A JW language code for internal use.',
            examples: {
              1: { summary: 'English', value: 'E' },
              2: { summary: 'Dutch', value: 'O' },
              3: { summary: 'Spanish', value: 'S' }
            },
            in: 'path',
            name: 'langcode',
            required: true,
            schema: { type: 'string' },
            summary: 'A Language code.'
          },
          LangSymbol: {
            description: 'An official language symbol representing a language.',
            examples: {
              1: { summary: 'English', value: 'en' },
              2: { summary: 'Dutch', value: 'nl' },
              3: { summary: 'Spanish', value: 'es' }
            },
            in: 'path',
            name: 'symbol',
            required: true,
            schema: { type: 'string' },
            summary: 'A language symbol.'
          },
          Month: {
            description: 'A 1-12 month number representing a month of the year.',
            examples: {
              1: { summary: 'January', value: 1 },
              2: { summary: 'June', value: 6 },
              3: { summary: 'December', value: 12 }
            },
            in: 'query',
            name: 'month',
            schema: { maximum: 12, minimum: 1, type: 'integer' },
            summary: 'A month number.'
          },
          Week: {
            description: 'An ISO week number representing a week of the year.',
            examples: {
              1: { summary: 'Week 1', value: 1 },
              2: { summary: 'Week 10', value: 10 },
              3: { summary: 'Week 52', value: 52 }
            },
            in: 'query',
            name: 'week',
            schema: { maximum: 53, minimum: 1, type: 'integer' },
            summary: 'An ISO week number.'
          },
          Year: {
            description: 'A 4-digit year number representing a year.',
            examples: {
              1: { summary: '2024', value: 2024 },
              2: { summary: '2025', value: 2025 },
              3: { summary: '2026', value: 2026 }
            },
            in: 'query',
            name: 'year',
            schema: { minimum: 1800, type: 'integer' },
            summary: 'A year number.'
          }
        },
        responses: {
          400: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            },
            description: 'Bad request.'
          },
          404: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            },
            description: 'Not found.'
          },
          500: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            },
            description: 'Internal server error.'
          }
        },
        schemas: {
          /* API Info Response */
          ApiInfoResponse: {
            description: 'API information response.',
            properties: {
              data: {
                properties: {
                  general: {
                    properties: {
                      description: { type: 'string' },
                      title: { type: 'string' },
                      version: { type: 'string' }
                    },
                    required: ['title', 'description', 'version'],
                    type: 'object'
                  },
                  links: {
                    properties: {
                      health: { format: 'uri', type: 'string' },
                      openAPI: { format: 'uri', type: 'string' },
                      scalar: { format: 'uri', type: 'string' },
                      swagger: { format: 'uri', type: 'string' }
                    },
                    required: ['health', 'openAPI', 'scalar', 'swagger'],
                    type: 'object'
                  }
                },
                required: ['general', 'links'],
                type: 'object'
              },
              meta: { $ref: '#/components/schemas/ApiMeta' },
              success: { enum: [true], type: 'boolean' }
            },
            required: ['success', 'data', 'meta'],
            type: 'object'
          },
          ApiLinks: {
            description: 'HATEOAS links for navigation.',
            properties: {
              first: { description: 'Link to the first page.', format: 'uri', type: 'string' },
              last: { description: 'Link to the last page.', format: 'uri', type: 'string' },
              next: { description: 'Link to the next page.', format: 'uri', type: 'string' },
              prev: { description: 'Link to the previous page.', format: 'uri', type: 'string' },
              related: {
                additionalProperties: { format: 'uri', type: 'string' },
                description: 'Related resource links.',
                type: 'object'
              },
              self: { description: 'Link to the current resource.', format: 'uri', type: 'string' }
            },
            required: ['self'],
            type: 'object'
          },
          /* Response Envelope Schemas */
          ApiMeta: {
            description: 'Metadata about the API response.',
            example: {
              requestId: 'k7f2m9x3q1',
              responseTime: 42,
              timestamp: '2026-01-09T12:34:56.789Z',
              version: 'v1'
            },
            properties: {
              requestId: {
                description: 'Correlation ID for request tracing.',
                type: 'string'
              },
              responseTime: {
                description: 'Response time in milliseconds.',
                type: 'integer'
              },
              timestamp: {
                description: 'ISO 8601 timestamp of when the response was generated.',
                format: 'date-time',
                type: 'string'
              },
              version: {
                description: 'API version that handled the request.',
                type: 'string'
              }
            },
            required: ['requestId', 'timestamp', 'responseTime', 'version'],
            type: 'object'
          },
          ApiPagination: {
            description: 'Pagination information for list responses.',
            example: {
              page: 1,
              pageSize: 20,
              totalItems: 100,
              totalPages: 5
            },
            properties: {
              page: { description: 'Current page number (1-indexed).', type: 'integer' },
              pageSize: { description: 'Number of items per page.', type: 'integer' },
              totalItems: { description: 'Total number of items.', type: 'integer' },
              totalPages: { description: 'Total number of pages.', type: 'integer' }
            },
            required: ['page', 'pageSize', 'totalItems', 'totalPages'],
            type: 'object'
          },
          ErrorResponse: {
            description: 'Error response format. The data property contains request metadata.',
            properties: {
              data: {
                description: 'Additional error data with request metadata.',
                properties: {
                  details: {
                    description: 'Field-level error details (for validation errors).',
                    items: {
                      properties: {
                        code: { description: 'The error code.', type: 'string' },
                        expected: { description: 'The expected value type.', type: 'string' },
                        message: { description: 'The error message.', type: 'string' },
                        path: {
                          description: 'The path to the value that caused the error.',
                          items: { type: 'string' },
                          type: 'array'
                        },
                        received: { description: 'The received value.', type: 'string' }
                      },
                      required: ['code', 'expected', 'message', 'path', 'received'],
                      type: 'object'
                    },
                    type: 'array'
                  },
                  meta: { $ref: '#/components/schemas/ApiMeta' }
                },
                required: ['meta'],
                type: 'object'
              },
              error: { enum: [true], type: 'boolean' },
              message: { description: 'Error message.', type: 'string' },
              statusCode: { description: 'HTTP status code.', type: 'integer' },
              statusMessage: { description: 'HTTP status text.', type: 'string' },
              url: {
                description: 'URL of the resource that caused the error.',
                format: 'uri',
                type: 'string'
              }
            },
            required: ['error', 'url', 'statusCode', 'statusMessage', 'message', 'data'],
            type: 'object'
          }
        }
      }
    },
    description:
      'Get general information about the API, like title, description, version, and more.',
    operationId: 'getInfo',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ApiInfoResponse' }
          }
        },
        description: 'Successful response.'
      }
    },
    summary: 'Get API information.',
    tags: ['API Routes']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const base = getRequestURL(event).origin
  const config = useRuntimeConfig()
  const { description, title, version } = config.public

  return apiSuccess(
    {
      general: { description, title, version },
      links: {
        health: formatUrl(base, '/api/health'),
        openAPI: formatUrl(base, '/_docs/openapi.json'),
        scalar: formatUrl(base, '/_docs/scalar'),
        swagger: formatUrl(base, '/_docs/swagger')
      }
    },
    { self: formatUrl(base, '/api') }
  )
})
