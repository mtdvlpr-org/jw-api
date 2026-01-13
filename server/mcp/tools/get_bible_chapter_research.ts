import { z } from 'zod'

export default defineMcpTool({
  annotations: {
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
    readOnlyHint: true
  },
  cache: '4w',
  description: 'Get footnotes, references, and more for a Bible chapter.',
  handler: async ({ book, chapter, langcode }) => {
    try {
      const research = await wolService.getBibleChapterWithResearch(book, chapter, langcode)

      return mcpService.toolResult(JSON.stringify(research, null, 2))
    } catch (e) {
      return mcpService.toolError(e)
    }
  },
  inputSchema: {
    book: bibleBookNrSchema,
    chapter: bibleChapterNrSchema,
    langcode: z.enum(jwLangCodes).meta({
      description:
        'The language code of the video. Example: E for English, O for Dutch, S for Spanish. See JW Languages for the full list.',
      examples: ['E', 'O', 'S']
    })
  }
})
