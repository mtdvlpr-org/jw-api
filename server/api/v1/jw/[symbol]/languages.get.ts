import { z } from 'zod'

const routeSchema = z.object({ symbol: jwLangSymbolSchema })

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          JWLanguage: {
            example: {
              altSpellings: ['English'],
              direction: 'ltr',
              hasWebContent: true,
              isCounted: true,
              isSignLanguage: false,
              langcode: 'E',
              name: 'English',
              script: 'ROMAN',
              symbol: 'en',
              vernacularName: 'English'
            },
            properties: {
              altSpellings: { items: { type: 'string' }, type: 'array' },
              direction: { type: 'string' },
              hasWebContent: { type: 'boolean' },
              isCounted: { type: 'boolean' },
              isSignLanguage: { type: 'boolean' },
              langcode: { type: 'string' },
              name: { type: 'string' },
              script: { type: 'string' },
              symbol: { type: 'string' }
            },
            required: [
              'altSpellings',
              'direction',
              'hasWebContent',
              'isCounted',
              'isSignLanguage',
              'langcode',
              'name',
              'script',
              'symbol'
            ],
            type: 'object'
          }
        }
      }
    },
    description: 'Get all languages supported by JW.org.',
    operationId: 'getJWLanguages',
    parameters: [{ $ref: '#/components/parameters/LangSymbol' }],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              properties: {
                data: { items: { $ref: '#/components/schemas/JWLanguage' }, type: 'array' },
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
    summary: 'Get JW languages.',
    tags: ['JW', 'Languages']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { symbol } = await getValidatedRouterParams(event, routeSchema.parse)

  const result = await jwService.getLanguages(symbol)
  return apiSuccess(result)
})
