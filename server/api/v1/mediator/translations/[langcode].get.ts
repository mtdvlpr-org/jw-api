import { z } from 'zod'

const routeSchema = z.object({ langcode: jwLangCodeSchema })

defineRouteMeta({
  openAPI: {
    parameters: [{ $ref: '#/components/parameters/LangCode' }],
    responses: {
      200: {
        content: {
          'application/json': {
            example: {
              'translation.key.1': 'Translation 1',
              'translation.key.2': 'Translation 2'
            },
            schema: {
              additionalProperties: { type: 'string' },
              type: 'object'
            }
          }
        },
        description: 'Successful response'
      },
      400: { $ref: '#/components/responses/400' },
      404: { $ref: '#/components/responses/404' }
    },
    tags: ['Mediator']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { langcode } = await getValidatedRouterParams(event, routeSchema.parse)

  return await mediatorService.getTranslations(langcode)
})
