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
      const languages = await jwService.getLanguages()
      return mcpService.jsonResourceReference('file:///jw/en/languages.json', languages)
    } catch (e) {
      return mcpService.toolError(e)
    }
  },
  title: 'Get JW Languages'
})
