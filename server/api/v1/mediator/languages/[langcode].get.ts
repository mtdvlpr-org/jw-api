import { z } from 'zod'

const routeSchema = z.strictObject({ langcode: jwLangCodeSchema })

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
    description: 'Get all languages supported by the Mediator API.',
    operationId: 'getMediatorLanguages',
    parameters: [{ $ref: '#/components/parameters/LangCode' }],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              properties: {
                data: { items: { $ref: '#/components/schemas/MediatorLanguage' }, type: 'array' },
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
    summary: 'Get Mediator languages.',
    tags: ['Mediator', 'Languages']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { langcode } = parseRouteParams(event, routeSchema)

  const result = await mediatorService.getLanguages(langcode)
  return apiSuccess(result)
})
