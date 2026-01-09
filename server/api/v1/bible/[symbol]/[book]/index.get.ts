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
    description: 'Get a Bible book by book number.',
    operationId: 'getBibleBook',
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
                data: {
                  properties: {
                    book: { $ref: '#/components/schemas/BibleBook' },
                    range: { $ref: '#/components/schemas/BibleRange' }
                  },
                  required: ['book', 'range'],
                  type: 'object'
                },
                meta: { $ref: '#/components/schemas/ApiMeta' },
                success: { enum: [true], type: 'boolean' }
              },
              required: ['success', 'data', 'meta'],
              type: 'object'
            }
          }
        },
        description: 'Successful response.'
      },
      400: { $ref: '#/components/responses/400' },
      404: { $ref: '#/components/responses/404' }
    },
    summary: 'Get Bible book.',
    tags: ['Bible']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { book, symbol } = await getValidatedRouterParams(event, routeSchema.parse)

  const result = await bibleService.getBook({ book, locale: symbol })
  return apiSuccess(result)
})
