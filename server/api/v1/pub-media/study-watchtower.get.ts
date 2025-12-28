import { z } from 'zod'

const querySchema = z.object({
  langwritten: jwLangCodeSchema,
  month: z.coerce
    .number<string>()
    .int()
    .positive()
    .min(1)
    .max(12)
    .optional()
    .describe('The month number.'),
  year: z.coerce.number<string>().int().positive().min(2015).optional().describe('The year number.')
})

export default defineLoggedEventHandler(async (event) => {
  const { langwritten, month, year } = await getValidatedQuery(event, querySchema.parse)

  if (!!month !== !!year) {
    throw createBadRequestError('Either month and year must be provided or neither.')
  }

  const result = await pubMediaService.getStudyWatchtower(
    langwritten,
    year && month ? { month, year } : undefined
  )

  return result
})
