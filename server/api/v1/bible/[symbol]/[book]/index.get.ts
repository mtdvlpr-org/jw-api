import { z } from 'zod'

const routeSchema = z.object({
  book: z.coerce.number<string>().int().positive().min(1).max(66).describe('The book number.'),
  symbol: jwLangSymbolSchema
})

export default defineLoggedEventHandler(async (event) => {
  const { book, symbol } = await getValidatedRouterParams(event, routeSchema.parse)

  return await bibleService.getBook({ book, locale: symbol })
})
