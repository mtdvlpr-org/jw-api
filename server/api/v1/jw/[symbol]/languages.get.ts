import { z } from 'zod'

const routeSchema = z.object({ symbol: jwLangSymbolSchema })

const _responseSchema = z.array(z.object(jwLanguageSchema))

defineRouteMeta({
  openAPI: {
    parameters: [
      {
        description: 'The locale for the languages result.',
        examples: {
          1: { summary: 'English', value: 'en' },
          2: { summary: 'Dutch', value: 'nl' },
          3: { summary: 'Spanish', value: 'es' }
        },
        in: 'path',
        name: 'symbol',
        required: true,
        schema: { type: 'string' }
      }
    ],
    responses: {
      200: {
        content: {
          'application/json': {
            example: [
              {
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
              {
                altSpellings: ['Dutch', 'Nederlands'],
                direction: 'ltr',
                hasWebContent: true,
                isCounted: true,
                isSignLanguage: false,
                langcode: 'O',
                name: 'Dutch',
                script: 'ROMAN',
                symbol: 'nl',
                vernacularName: 'Nederlands'
              },
              {
                altSpellings: ['Spanish', 'español', 'espanol'],
                direction: 'ltr',
                hasWebContent: true,
                isCounted: true,
                isSignLanguage: false,
                langcode: 'S',
                name: 'Spanish',
                script: 'ROMAN',
                symbol: 'es',
                vernacularName: 'español'
              }
            ],
            schema: {
              items: {
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
                type: 'object'
              },
              minItems: 3,
              type: 'array'
            }
          }
        },
        description: 'Successful response.'
      },
      400: {
        content: {
          'application/json': {
            example: {
              error: true,
              message: 'Invalid value.',
              statusCode: 400,
              statusMessage: 'Validation Error',
              url: 'https://example.com/api/path'
            },
            schema: {
              properties: {
                error: { type: 'boolean' },
                message: { type: 'string' },
                statusCode: { type: 'number' },
                statusMessage: { type: 'string' },
                url: { type: 'string' }
              },
              type: 'object'
            }
          }
        },
        description: 'Validation error.'
      },
      404: {
        content: {
          'application/json': {
            example: {
              error: true,
              message: 'Yeartext not found.',
              statusCode: 404,
              statusMessage: 'Not Found',
              url: 'https://example.com/api/path'
            },
            schema: {
              properties: {
                error: { type: 'boolean' },
                message: { type: 'string' },
                statusCode: { type: 'number' },
                statusMessage: { type: 'string' },
                url: { type: 'string' }
              },
              type: 'object'
            }
          }
        },
        description: 'Not found.'
      }
    }
  }
})

export default defineLoggedEventHandler<typeof _responseSchema>(async (event) => {
  const { symbol } = await getValidatedRouterParams(event, routeSchema.parse)

  return await jwService.getLanguages(symbol)
})
