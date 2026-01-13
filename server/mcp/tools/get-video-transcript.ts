import { z } from 'zod'

const outputSchema = {
  subtitles: z.string().meta({ description: 'The subtitles of the video.' }),
  thumbnail: z.string().meta({ description: 'The thumbnail of the video.' }),
  title: z.string().meta({ description: 'The title of the video.' })
}

type OutputSchema = z.output<z.ZodObject<typeof outputSchema>>

export default defineMcpTool({
  annotations: {
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
    readOnlyHint: true
  },
  cache: '4w',
  description: 'Get the transcript of a video from JW.org.',
  handler: async ({ langcode, url }) => {
    const key = extractMediaKey(url)
    const langwritten = extractLangCode(url)
    if (!key) throw new Error('Could not extract publication ID from URL')
    const result = await mediatorService.getSubtitles({
      key,
      langwritten: langcode || langwritten || 'E'
    })

    return mcpService.toolResult<OutputSchema>(result.subtitles, {
      subtitles: result.subtitles,
      thumbnail: findBestImage(result.video.images ?? {}) ?? '',
      title: result.video.title
    })
  },
  inputSchema: {
    langcode: z
      .enum(jwLangCodes)
      .meta({
        description:
          'The language code of the video. Example: E for English, O for Dutch, S for Spanish. See JW Languages for the full list. If not provided, will try to extract it from the video URL. If that fails, will default to English.',
        examples: ['E', 'O', 'S']
      })
      .optional(),
    url: z.url().meta({
      description:
        'A JW Video URL. Examples: https://www.jw.org/finder?srcid=share&wtlocale=E&lank=pub-imv_4_VIDEO or https://www.jw.org/en/library/videos/#en/mediaitems/FeaturedLibraryVideos/pub-imv_4_VIDEO',
      examples: [
        'https://www.jw.org/finder?srcid=share&wtlocale=E&lank=pub-imv_4_VIDEO',
        'https://www.jw.org/en/library/videos/#en/mediaitems/FeaturedLibraryVideos/pub-imv_4_VIDEO'
      ]
    })
  },
  outputSchema
})
