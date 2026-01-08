import { z } from 'zod'

const routeSchema = z.object({ langcode: jwLangCodeSchema })

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          CategoryParent: {
            properties: {
              description: { type: 'string' },
              images: { $ref: '#/components/schemas/ImagesObject' },
              key: { type: 'string' },
              media: { items: { $ref: '#/components/schemas/MediaItem' }, type: 'array' },
              name: { type: 'string' },
              tags: { items: { type: 'string' }, type: 'array' },
              type: { enum: ['container', 'ondemand'], type: 'string' }
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
