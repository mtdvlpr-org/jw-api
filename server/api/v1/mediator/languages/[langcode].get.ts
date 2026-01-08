import { z } from 'zod'

const routeSchema = z.object({ langcode: jwLangCodeSchema })

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          MediatorLanguage: {
            example: {
              code: 'E',
              isLangPair: false,
              isRTL: false,
              isSignLanguage: false,
              locale: 'en',
              name: 'English',
              script: 'ROMAN',
              vernacular: 'English'
            },
            properties: {
              code: { type: 'string' },
              isLangPair: { type: 'boolean' },
              isRTL: { type: 'boolean' },
              isSignLanguage: { type: 'boolean' },
              locale: { type: 'string' },
              name: { type: 'string' },
              script: { type: 'string' },
              vernacular: { type: 'string' }
            },
            required: [
              'code',
              'isLangPair',
              'isRTL',
              'isSignLanguage',
              'locale',
              'name',
              'script',
              'vernacular'
            ],
            type: 'object'
          }
        }
      }
    },
    parameters: [{ $ref: '#/components/parameters/LangCode' }],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              items: { $ref: '#/components/schemas/MediatorLanguage' },
              type: 'array'
            }
          }
        },
        description: 'Successful response'
      },
      400: { $ref: '#/components/responses/400' },
      404: { $ref: '#/components/responses/404' }
    },
    tags: ['Mediator', 'Languages']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { langcode } = await getValidatedRouterParams(event, routeSchema.parse)

  return await mediatorService.getLanguages(langcode)
})
