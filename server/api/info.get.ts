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
                example: {
                  error: true,
                  message: 'Invalid value.',
                  statusCode: 400,
                  statusMessage: 'Validation Error',
                  url: 'https://example.com/api/path'
                },
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            },
            description: 'Validation error.'
          },
          404: {
            content: {
              'application/json': {
                example: {
                  error: true,
                  message: 'Not found.',
                  statusCode: 404,
                  statusMessage: 'Not Found',
                  url: 'https://example.com/api/path'
                },
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            },
            description: 'Not found.'
          }
        },
        schemas: {
          Error: {
            example: {
              error: true,
              message: 'Error message.',
              statusCode: 404,
              statusMessage: 'Not Found',
              url: 'https://example.com/api/path'
            },
            properties: {
              error: { type: 'boolean' },
              message: { type: 'string' },
              statusCode: { type: 'integer' },
              statusMessage: { type: 'string' },
              url: { type: 'string' }
            },
            type: 'object'
          }
        }
      }
    },
    description: 'Get general information about the API.',
    operationId: 'getInfo',
    summary: 'Get API information.'
  }
})

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  return {
    version: config.public.version
  }
})
