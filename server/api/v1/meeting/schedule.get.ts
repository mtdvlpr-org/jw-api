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
        schemas: {
          MeetingSchedule: {
            example: {
              watchtower: {
                w_study_date: '2025/01/01',
                w_study_title: 'Study Article 1'
              },
              workbook: {
                mwb_week_date: '2025/01/01',
                mwb_weekly_bible_reading: 'Genesis 1-3'
              }
            },
            properties: {
              watchtower: { nullable: true, type: 'object' },
              workbook: { nullable: true, type: 'object' }
            },
            required: ['watchtower', 'workbook'],
            type: 'object'
          }
        }
      }
    },
    description: 'Get the meeting schedule for a given language and week/year.',
    operationId: 'getMeetingSchedule',
    parameters: [
      { $ref: '#/components/parameters/LangWritten' },
      { $ref: '#/components/parameters/Week' },
      { $ref: '#/components/parameters/MeetingYear' }
    ],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MeetingSchedule' }
          }
        },
        description: 'Successful response.'
      },
      400: { $ref: '#/components/responses/400' },
      404: { $ref: '#/components/responses/404' }
    },
    summary: 'Get meeting schedule.',
    tags: ['Meeting']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { langwritten, week, year } = await getValidatedQuery(event, querySchema.parse)

  if (!!week !== !!year) {
    throw apiBadRequestError('Week and year must be provided together or not at all')
  }

  return meetingService.getMeetingSchedule(langwritten, week && year ? { week, year } : undefined)
})
