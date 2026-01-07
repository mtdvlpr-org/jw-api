import { z } from 'zod'

export default defineMcpTool({
  annotations: {
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
    readOnlyHint: true
  },
  cache: '4w',
  description: 'Get a JW Language by name.',
  handler: async ({ name, symbol }) => {
    try {
      const language = await jwService.getLanguage(name, symbol)

      return mcpService.toolResult(
        JSON.stringify(language, null, 2),
        language as unknown as Record<string, unknown>
      )
    } catch (e) {
      return mcpService.toolError(e)
    }
  },
  inputSchema: {
    name: z.string().meta({
      description:
        'The name of the language. Example: English, Dutch, Spanish. See JW Languages for the full list.',
      examples: ['English', 'Dutch', 'Spanish']
    }),
    symbol: jwLangSymbolSchema
      .meta({
        description:
          'The locale for the language. Example: en for English, nl for Dutch, es for Spanish. See JW Languages for the full list.',
        examples: ['en', 'nl', 'es']
      })
      .optional()
      .default('en')
  }
})
