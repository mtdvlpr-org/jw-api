import { z } from 'zod'

const querySchema = z.object({
  langwritten: jwLangCodeSchema,
  month: monthSchema
    .optional()
    .meta({ description: 'The month number. If not provided, the current month will be used.' }),
  year: yearSchema
    .min(2016)
    .optional()
    .meta({ description: 'The year number. If not provided, the current year will be used.' })
})

defineRouteMeta({
  openAPI: {
    description: 'Get the watchtower for a given language and month/year.',
    operationId: 'getWatchtower',
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
                data: { $ref: '#/components/schemas/Publication' },
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
    summary: 'Get watchtower.',
    tags: ['Publication', 'Media']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { langwritten, month, year } = parseQuery(event, querySchema)

  if (!!month !== !!year) {
    throw apiBadRequestError('Month and year must be provided together or not at all')
  }

  const result = await pubMediaService.getStudyWatchtower({
    date: year && month ? { month, year } : undefined,
    langwritten
  })
  return apiSuccess(result)
})
