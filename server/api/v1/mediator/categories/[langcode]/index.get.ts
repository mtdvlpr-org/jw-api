import { z } from 'zod'

const routeSchema = z.object({ langcode: jwLangCodeSchema })

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          CategoryParent: {
            example: {
              description: 'Videos on demand',
              images: {},
              key: 'VOD',
              name: 'Videos',
              tags: [],
              type: 'container'
            },
            properties: {
              description: { type: 'string' },
              images: { additionalProperties: { type: 'object' }, type: 'object' },
              key: { type: 'string' },
              name: { type: 'string' },
              tags: { items: { type: 'string' }, type: 'array' },
              type: { type: 'string' }
            },
            required: ['description', 'images', 'key', 'name', 'tags', 'type'],
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
            schema: { items: { $ref: '#/components/schemas/CategoryParent' }, type: 'array' }
          }
        },
        description: 'Successful response'
      },
      400: { $ref: '#/components/responses/400' },
      404: { $ref: '#/components/responses/404' }
    },
    tags: ['Mediator', 'Categories']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { langcode } = await getValidatedRouterParams(event, routeSchema.parse)

  return await mediatorService.getCategories(langcode)
})
