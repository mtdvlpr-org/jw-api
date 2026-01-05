export default defineMcpResource({
  cache: '4w',
  description: 'Information about the different books of the Bible in English.',
  handler: async (uri: URL) => {
    try {
      const result = await bibleService.getBooks('en')
      return mcpService.jsonResource(uri, result)
    } catch (e) {
      return mcpService.resourceError(uri, e)
    }
  },
  metadata: { mimeType: 'application/json' },
  uri: 'file:///bible/en/books.json'
})
