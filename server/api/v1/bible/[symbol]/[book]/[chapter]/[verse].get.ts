import { z } from 'zod'

const routeSchema = z.object({
  book: z.coerce.number<string>().int().positive().min(1).max(66).describe('The book number.'),
  chapter: z.coerce
    .number<string>()
    .int()
    .positive()
    .min(1)
    .max(150)
    .describe('The chapter number.'),
  symbol: jwLangSymbolSchema,
  verse: z.coerce.number<string>().int().positive().min(1).max(176).describe('The verse number.')
})

export default defineLoggedEventHandler(async (event) => {
  const { book, chapter, symbol, verse } = await getValidatedRouterParams(event, routeSchema.parse)

  return await bibleService.getVerse({ book, chapter, locale: symbol, verse })
})
