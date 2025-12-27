import type { Variables } from '@modelcontextprotocol/sdk/shared/uriTemplate.js'

import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'

export default defineMcpResource({
  cache: '4w',
  description: 'Information about the different books of the Bible.',
  handler: async (uri: URL, variables: Variables) => {
    try {
      const locale = variables.locale as JwLangSymbol
      if (!locale) return mcpService.resourceError(uri, new Error('Locale variable is required.'))
      if (!jwLangSymbols.includes(locale)) {
        return mcpService.resourceError(
          uri,
          new Error(`Locale is invalid or does not have web content: ${locale}.`)
        )
      }

      const result = await bibleService.getBooks(locale)
      return mcpService.jsonResource(uri, result)
    } catch (e) {
      return mcpService.resourceError(uri, e)
    }
  },
  metadata: { mimeType: 'application/json' },
  uri: new ResourceTemplate('file:///bible/{locale}/books.json', {
    complete: {
      locale: (value) => jwLangSymbols.filter((symbol) => !value || symbol.startsWith(value))
    },
    list: async () => {
      try {
        const result = await jwService.getLanguages()
        return {
          resources: result.map((language) => ({
            name: `Bible Books (${language.name})`,
            uri: `file:///bible/${language.symbol}/books.json`
          }))
        }
      } catch {
        return {
          resources: jwLangSymbols.map((symbol) => ({
            name: `Bible Books (${symbol})`,
            uri: `file:///bible/${symbol}/books.json`
          }))
        }
      }
    }
  })
})
