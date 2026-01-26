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
            properties: {
              watchtower: {
                properties: {
                  w_study_concluding_song: { maximum: 500, minimum: 1, type: 'integer' },
                  w_study_date: { format: 'date', type: 'string' },
                  w_study_date_locale: { type: 'string' },
                  w_study_opening_song: { maximum: 500, minimum: 1, type: 'integer' },
                  w_study_title: { type: 'string' }
                },
                required: [
                  'w_study_date',
                  'w_study_date_locale',
                  'w_study_title',
                  'w_study_opening_song',
                  'w_study_concluding_song'
                ],
                type: ['object', 'null']
              },
              workbook: {
                properties: {
                  mwb_ayf_count: { maximum: 4, minimum: 1, type: 'integer' },
                  mwb_ayf_part1: { type: 'string' },
                  mwb_ayf_part1_time: { maximum: 15, minimum: 1, type: 'integer' },
                  mwb_ayf_part1_title: { type: 'string' },
                  mwb_ayf_part2: { type: 'string' },
                  mwb_ayf_part2_time: { maximum: 15, minimum: 1, type: 'integer' },
                  mwb_ayf_part2_title: { type: 'string' },
                  mwb_ayf_part3: { type: 'string' },
                  mwb_ayf_part3_time: { maximum: 15, minimum: 1, type: 'integer' },
                  mwb_ayf_part3_title: { type: 'string' },
                  mwb_ayf_part4: { type: 'string' },
                  mwb_ayf_part4_time: { maximum: 15, minimum: 1, type: 'integer' },
                  mwb_ayf_part4_title: { type: 'string' },
                  mwb_lc_cbs: { type: 'string' },
                  mwb_lc_cbs_title: { type: 'string' },
                  mwb_lc_count: { maximum: 2, minimum: 1, type: 'integer' },
                  mwb_lc_part1: { type: 'string' },
                  mwb_lc_part1_content: { type: 'string' },
                  mwb_lc_part1_time: { maximum: 15, minimum: 1, type: 'integer' },
                  mwb_lc_part1_title: { type: 'string' },
                  mwb_lc_part2: { type: 'string' },
                  mwb_lc_part2_content: { type: 'string' },
                  mwb_lc_part2_time: { maximum: 15, minimum: 1, type: 'integer' },
                  mwb_lc_part2_title: { type: 'string' },
                  mwb_song_conclude: { maximum: 500, minimum: 1, type: 'integer' },
                  mwb_song_first: { maximum: 500, minimum: 1, type: 'integer' },
                  mwb_song_middle: { maximum: 500, minimum: 1, type: 'integer' },
                  mwb_week_date: { format: 'date', type: 'string' },
                  mwb_week_date_locale: { type: 'string' },
                  mwb_weekly_bible_reading: { type: 'string' }
                },
                required: [
                  'mwb_week_date',
                  'mwb_week_date_locale',
                  'mwb_song_first',
                  'mwb_song_middle',
                  'mwb_song_conclude',
                  'mwb_ayf_count',
                  'mwb_ayf_part1',
                  'mwb_ayf_part1_time',
                  'mwb_ayf_part1_title',
                  'mwb_lc_cbs',
                  'mwb_lc_cbs_title',
                  'mwb_lc_count',
                  'mwb_lc_part1',
                  'mwb_lc_part1_content',
                  'mwb_lc_part1_time',
                  'mwb_lc_part1_title',
                  'mwb_weekly_bible_reading'
                ],
                type: ['object', 'null']
              }
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
            schema: {
              properties: {
                data: { $ref: '#/components/schemas/MeetingSchedule' },
                meta: { $ref: '#/components/schemas/ApiMeta' },
                success: { enum: [true], type: 'boolean' }
              },
              required: ['success', 'data', 'meta'],
              type: 'object'
            }
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
  const { langwritten, week, year } = parseQuery(event, querySchema)

  if (!!week !== !!year) {
    throw apiBadRequestError('Week and year must be provided together or not at all')
  }

  const result = await meetingService.getMeetingSchedule(
    langwritten,
    week && year ? { week, year } : undefined
  )
  return apiSuccess(result)
})
