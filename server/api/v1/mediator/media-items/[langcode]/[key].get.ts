import { z } from 'zod'

const routeSchema = z.object({
  key: z
    .string()
    .describe('The language agnostic natural key of the media item.')
    .meta({ example: 'pub-imv_4_VIDEO' }),
  langcode: jwLangCodeSchema
})

export default defineLoggedEventHandler(async (event) => {
  const { key, langcode: langwritten } = await getValidatedRouterParams(event, routeSchema.parse)

  return await mediatorService.getMediaItem({ key, langwritten })
})
