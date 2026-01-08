import { z } from 'zod'

const querySchema = z.object({
  langwritten: jwLangCodeSchema,
  month: monthSchema
    .optional()
    .meta({ description: 'The month number. If not provided, the current month will be used.' }),
  year: yearSchema
    .min(2015)
    .optional()
    .meta({ description: 'The year number. If not provided, the current year will be used.' })
})

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          WatchtowerArticle: {
            example: {
              file: {
                checksum: 'b52799ae27c35f13d9bb49cb7b4b9bdf',
                modifiedDatetime: '2025-09-25 12:23:36',
                stream: 'https://jw.org',
                url: 'https://cfp2.jw-cdn.org/a/eefed82/1/o/w_E_202601_01.rtf'
              },
              title: 'March 2-8, 2026: Continue to Satisfy Your “Spiritual Need”'
            },
            properties: {
              file: {
                properties: {
                  checksum: { type: 'string' },
                  modifiedDatetime: { type: 'string' },
                  stream: { type: 'string' },
                  url: { format: 'uri', type: 'string' }
                },
                required: ['checksum', 'modifiedDatetime', 'stream', 'url'],
                type: 'object'
              },
              title: { type: 'string' }
            },
            required: ['file', 'title'],
            type: 'object'
          }
        }
      }
    },
    description: 'Get the watchtower articles for a given language and month/year.',
    operationId: 'getWatchtowerArticles',
    parameters: [
      { $ref: '#/components/parameters/LangWritten' },
      { $ref: '#/components/parameters/Month' },
      { $ref: '#/components/parameters/MeetingYear' }
    ],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              properties: {
                articles: {
                  items: { $ref: '#/components/schemas/WatchtowerArticle' },
                  type: 'array'
                },
                issue: { type: 'string' }
              },
              required: ['issue', 'article'],
              type: 'object'
            }
          }
        },
        description: 'Successful response.'
      },
      400: { $ref: '#/components/responses/400' },
      404: { $ref: '#/components/responses/404' }
    },
    summary: 'Get watchtower articles.',
    tags: ['Publication', 'Media']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { langwritten, month, year } = await getValidatedQuery(event, querySchema.parse)

  if (!!month !== !!year) {
    throw createBadRequestError('Month and year must be provided together or not at all.')
  }

  const result = await pubMediaService.getWatchtowerArticles({
    date: year && month ? { month, year } : undefined,
    langwritten
  })

  return result
})
