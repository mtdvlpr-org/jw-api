import { z } from 'zod'

const outputSchema = bibleVerseSchema.shape

type Output = z.output<typeof bibleVerseSchema>

export default defineMcpTool({
  annotations: {
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
    readOnlyHint: true
  },
  cache: '4w',
  description: 'Get a Bible verse from JW.org.',
  handler: async ({ book, chapter, symbol, verseNumber }) => {
    try {
      const verse = await bibleService.getVerse({
        book,
        chapter,
        locale: symbol,
        verse: verseNumber
      })

      return mcpService.toolResult<Output>(verse.parsedContent, verse.result)
    } catch (e) {
      return mcpService.toolError(e)
    }
  },
  inputSchema: {
    book: bibleBookNrSchema,
    chapter: bibleChapterNrSchema,
    symbol: z
      .enum(jwLangSymbols)
      .meta({
        description:
          'The language of the Bible. Example: en for English, nl for Dutch, es for Spanish. See JW Languages for the full list. Default to English.',
        examples: ['en', 'nl', 'es']
      })
      .optional()
      .default('en'),
    verseNumber: bibleVerseNrSchema
  },
  outputSchema
})
