export default defineMcpTool({
  annotations: {
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
    readOnlyHint: true
  },
  //cache: '4w',
  description: 'Get the JW Languages resource.',
  handler: async () => {
    try {
      const result = await jwService.getLanguages()
      return mcpService.jsonResourceReference('file:///jw/en/languages.json', result)
    } catch (e) {
      return mcpService.toolError(e)
    }
  },
  title: 'Get JW Languages'
})
