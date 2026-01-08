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
    description: 'Get the meeting workbook for a given language and month/year.',
    operationId: 'getWorkbook',
    parameters: [
      { $ref: '#/components/parameters/LangWritten' },
      { $ref: '#/components/parameters/Month' },
      { $ref: '#/components/parameters/MeetingYear' }
    ],
    responses: {
      200: {
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Publication' } } },
        description: 'Successful response'
      },
      400: { $ref: '#/components/responses/400' },
      404: { $ref: '#/components/responses/404' }
    },
    summary: 'Get meeting workbook.',
    tags: ['Publication', 'Media']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { langwritten, month, year } = await getValidatedQuery(event, querySchema.parse)

  if (!!month !== !!year) {
    throw createBadRequestError('Month and year must be provided together or not at all.')
  }

  const result = await pubMediaService.getMeetingWorkbook({
    date: year && month ? { month, year } : undefined,
    langwritten
  })

  return result
})
