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

export default defineLoggedEventHandler(async (event) => {
  const { langwritten, week, year } = await getValidatedQuery(event, querySchema.parse)

  if (!!week !== !!year) {
    throw createBadRequestError('Week and year must be provided together or not at all.')
  }

  return meetingService.getMeetingArticles(langwritten, week && year ? { week, year } : undefined)
})
