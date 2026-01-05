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
  symbol: jwLangSymbolSchema
})

export default defineLoggedEventHandler(async (event) => {
  const { book, chapter, symbol } = await getValidatedRouterParams(event, routeSchema.parse)

  return await bibleService.getChapter({ book, chapter, locale: symbol })
})
