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
