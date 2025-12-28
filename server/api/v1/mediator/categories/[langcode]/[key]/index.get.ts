import { z } from 'zod'

const routeSchema = z.object({
  key: z.string().describe('The key of a category.').meta({ example: 'AllVideos' }),
  langcode: jwLangCodeSchema
})

export default defineLoggedEventHandler(async (event) => {
  const { key, langcode: locale } = await getValidatedRouterParams(event, routeSchema.parse)

  return await mediatorService.getCategory(key as CategoryKey, { locale })
})
