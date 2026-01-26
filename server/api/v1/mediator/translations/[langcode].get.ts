import { z } from 'zod'

const routeSchema = z.strictObject({ langcode: jwLangCodeSchema })

defineRouteMeta({
  openAPI: {
    description: 'Get all Mediator API translations for a given language.',
    operationId: 'getMediatorTranslations',
    parameters: [{ $ref: '#/components/parameters/LangCode' }],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              properties: {
                data: {
                  additionalProperties: { type: 'string' },
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
    summary: 'Get translations.',
    tags: ['Mediator']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { langcode } = parseRouteParams(event, routeSchema)

  const result = await mediatorService.getTranslations(langcode)
  return apiSuccess(result)
})
