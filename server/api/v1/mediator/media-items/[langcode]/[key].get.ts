import { z } from 'zod'

const routeSchema = z.object({ key: mediaKeySchema, langcode: jwLangCodeSchema })

export default defineLoggedEventHandler(async (event) => {
  const { key, langcode: langwritten } = await getValidatedRouterParams(event, routeSchema.parse)

  return await mediatorService.getMediaItem({ key, langwritten })
})
