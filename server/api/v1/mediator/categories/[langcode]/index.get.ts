import { z } from 'zod'

const routeSchema = z.object({ langcode: jwLangCodeSchema })

export default defineLoggedEventHandler(async (event) => {
  const { langcode } = await getValidatedRouterParams(event, routeSchema.parse)

  return await mediatorService.getCategories(langcode)
})
