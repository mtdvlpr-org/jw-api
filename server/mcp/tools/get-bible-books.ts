export default defineMcpTool({
  annotations: {
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
    readOnlyHint: true
  },
  cache: '4w',
  description: 'Get information about the different books of the Bible.',
  handler: async ({ symbol }) => {
    try {
      const books = await bibleService.getBooks(symbol)
      return mcpService.toolResult(JSON.stringify(books, null, 2), books)
    } catch (e) {
      return mcpService.toolError(e)
    }
  },
  inputSchema: {
    symbol: jwLangSymbolSchema
      .meta({
        description:
          'The language for the bible books. Example: en for English, nl for Dutch, es for Spanish. See JW Languages for the full list.',
        examples: ['en', 'nl', 'es']
      })
      .optional()
      .default('en')
  }
})
