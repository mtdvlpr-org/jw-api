import { z } from 'zod'

export default defineMcpPrompt({
  handler: async ({ book, chapter, language }) => {
    return mcpService.userPrompt(
      `Find spiritual gems in ${book} chapter ${chapter} using the 'get_bible_chapter_research' tool in ${language}.`
    )
  },
  inputSchema: {
    book: z.string().meta({
      description: 'The Bible book to get the chapter from. Example: Genesis, Matthew, Psalms.'
    }),
    chapter: z
      .number()
      .int()
      .positive()
      .meta({ description: 'The chapter number to get the research for. Example: 1, 2, 3.' }),
    language: z.string().meta({
      description: 'The preferred language of the research. English, Dutch, Spanish, etc.'
    })
  }
})
