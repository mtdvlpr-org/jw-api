import { z } from 'zod'

const querySchema = z.object({
  langwritten: z
    .enum(jwLangCodes)
    .optional()
    .default('E')
    .describe('The language to get the meeting for.'),
  week: z.coerce
    .number<string>()
    .min(1)
    .max(53)
    .optional()
    .describe('The week number of the meeting. If not provided, the current week will be used.'),
  year: z.coerce
    .number<string>()
    .min(2016)
    .optional()
    .describe('The year of the meeting. If not provided, the current year will be used.')
})

export default defineLoggedEventHandler(async (event) => {
  const { langwritten, week, year } = await getValidatedQuery(event, querySchema.parse)

  if (!!week !== !!year) {
    throw createBadRequestError('Week and year must be provided together or not at all.')
  }

  return meetingService.getMeetingArticles(langwritten, week && year ? { week, year } : undefined)
})
