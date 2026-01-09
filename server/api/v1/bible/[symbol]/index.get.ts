import { z } from 'zod'

const routeSchema = z.object({ symbol: jwLangSymbolSchema })

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          BibleData: {
            properties: {
              additionalPages: {
                items: { $ref: '#/components/schemas/BibleAdditionalPage' },
                type: 'array'
              },
              copyrightPage: { $ref: '#/components/schemas/BibleAdditionalPage' },
              currentLocale: { type: 'string' },
              editionData: { $ref: '#/components/schemas/BibleEditionData' },
              ranges: { maxItems: 0, minItems: 0, type: 'array' },
              status: { type: 'integer' }
            },
            required: [
              'status',
              'currentLocale',
              'ranges',
              'editionData',
              'additionalPages',
              'copyrightPage'
            ],
            type: 'object'
          },
          BibleEditionData: {
            properties: {
              articleCSSClassNames: { type: 'string' },
              bookCount: { type: 'string' },
              books: { $ref: '#/components/schemas/BibleBooks' },
              locale: { type: 'string' },
              pageCSSClassNames: { type: 'string' },
              titleFormat: { type: 'string' },
              url: { type: 'string' },
              vernacularAbbreviation: { type: 'string' },
              vernacularFullName: { type: 'string' },
              vernacularShortName: { type: ['string', 'null'] }
            },
            required: [
              'articleCSSClassNames',
              'bookCount',
              'books',
              'locale',
              'pageCSSClassNames',
              'titleFormat',
              'url'
            ],
            type: 'object'
          }
        }
      }
    },
    description: 'Get the Bible data for a given language.',
    operationId: 'getBibleData',
    parameters: [{ $ref: '#/components/parameters/LangSymbol' }],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              properties: {
                data: { $ref: '#/components/schemas/BibleData' },
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
    summary: 'Get Bible data.',
    tags: ['Bible']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { symbol } = parseRouteParams(event, routeSchema)

  const result = await bibleService.getBibleData(symbol)
  return apiSuccess(result)
})
