export default defineMcpResource({
  cache: '4w',
  description: 'Supported languages for JW.org',
  handler: async (uri: URL) => {
    try {
      const result = await jwService.getLanguages()
      return mcpService.jsonResource(uri, result)
    } catch (e) {
      return mcpService.resourceError(uri, e)
    }
  },
  metadata: { mimeType: 'application/json' },
  title: 'JW Languages',
  uri: 'file:///jw/en/languages.json'
})
