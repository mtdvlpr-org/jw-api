import { z } from 'zod'

const routeSchema = z.object({ key: categoryKeySchema, langcode: jwLangCodeSchema })

export default defineLoggedEventHandler(async (event) => {
  const { key, langcode: locale } = await getValidatedRouterParams(event, routeSchema.parse)

  return await mediatorService.getDetailedCategory(key, { locale })
})
