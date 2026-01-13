import { z } from 'zod'

export default defineMcpPrompt({
  handler: async ({ language, url }) => {
    return mcpService.userPrompt(
      `Get a transcript using the 'get_video_transcript' tool for the following video${language ? ` in ${language}` : ''}:\n\n${url}.`
    )
  },
  inputSchema: {
    language: z
      .string()
      .meta({
        description: 'The preferred language of the transcript. English, Dutch, Spanish, etc.'
      })
      .optional(),
    url: z.url().meta({
      description:
        'A JW Video URL. Examples: https://www.jw.org/finder?srcid=share&wtlocale=E&lank=pub-imv_4_VIDEO or https://www.jw.org/en/library/videos/#en/mediaitems/FeaturedLibraryVideos/pub-imv_4_VIDEO'
    })
  }
})
