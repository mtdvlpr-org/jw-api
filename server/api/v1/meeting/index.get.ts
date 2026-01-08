import { z } from 'zod'

const querySchema = z.object({
  langwritten: jwLangCodeSchema.optional().default('E'),
  week: weekSchema.optional().meta({
    description: 'The week number of the meeting. If not provided, the current week will be used.'
  }),
  year: yearSchema.min(2016).optional().meta({
    description: 'The year of the meeting. If not provided, the current year will be used.'
  })
})

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        parameters: {
          MeetingYear: {
            description: 'A 4-digit year number representing a year.',
            examples: {
              1: { summary: '2024', value: 2024 },
              2: { summary: '2025', value: 2025 },
              3: { summary: '2026', value: 2026 }
            },
            in: 'query',
            name: 'year',
            schema: { minimum: 2016, type: 'integer' },
            summary: 'A year number.'
          }
        },
        schemas: {
          MeetingArticle: {
            properties: {
              end: { format: 'date', type: 'string' },
              start: { format: 'date', type: 'string' },
              title: { type: 'string' }
            },
            required: ['end', 'start', 'title'],
            type: ['object', 'null']
          }
        }
      }
    },
    description: 'Get the meeting articles for a given language and week/year.',
    operationId: 'getMeetingArticles',
    parameters: [
      { $ref: '#/components/parameters/LangWritten' },
      { $ref: '#/components/parameters/Week' },
      { $ref: '#/components/parameters/MeetingYear' }
    ],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              properties: {
                watchtower: { $ref: '#/components/schemas/MeetingArticle' },
                workbook: { $ref: '#/components/schemas/MeetingArticle' }
              },
              required: ['watchtower', 'workbook'],
              type: 'object'
            }
          }
        },
        description: 'Successful response.'
      },
      400: { $ref: '#/components/responses/400' },
      404: { $ref: '#/components/responses/404' }
    },
    summary: 'Get meeting articles.',
    tags: ['Meeting']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { langwritten, week, year } = await getValidatedQuery(event, querySchema.parse)

  if (!!week !== !!year) {
    throw createBadRequestError('Week and year must be provided together or not at all.')
  }

  return meetingService.getMeetingArticles(langwritten, week && year ? { week, year } : undefined)
})
