import { z } from 'zod'

const routeSchema = z.object({
  book: bibleBookNrSchema,
  symbol: jwLangSymbolSchema
})

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        parameters: {
          BibleBook: {
            description: 'A Bible book number representing the book.',
            examples: {
              1: { summary: 'Genesis', value: 1 },
              2: { summary: 'Matthew', value: 40 },
              3: { summary: 'Revelation', value: 66 }
            },
            in: 'path',
            name: 'book',
            required: true,
            schema: { maximum: 66, minimum: 1, type: 'integer' },
            summary: 'A Bible book number.'
          }
        }
      }
    },
    parameters: [
      { $ref: '#/components/parameters/LangSymbol' },
      { $ref: '#/components/parameters/BibleBook' }
    ],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              properties: {
                book: { $ref: '#/components/schemas/BibleBook' },
                range: { $ref: '#/components/schemas/BibleRange' }
              },
              required: ['book', 'range'],
              type: 'object'
            }
          }
        },
        description: 'Successful response'
      },
      400: { $ref: '#/components/responses/400' },
      404: { $ref: '#/components/responses/404' }
    },
    tags: ['Bible']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { book, symbol } = await getValidatedRouterParams(event, routeSchema.parse)

  return await bibleService.getBook({ book, locale: symbol })
})
