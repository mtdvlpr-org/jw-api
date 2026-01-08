import { z } from 'zod'

const routeSchema = z.object({ key: categoryKeySchema, langcode: jwLangCodeSchema })

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          CategoryDetailed: {
            example: {
              description: 'Videos on demand',
              images: {},
              key: 'VideoOnDemand',
              name: 'Videos',
              parentCategory: null,
              subcategories: [],
              tags: [],
              type: 'container'
            },
            properties: {
              description: { type: 'string' },
              images: { additionalProperties: { type: 'object' }, type: 'object' },
              key: { type: 'string' },
              name: { type: 'string' },
              parentCategory: { nullable: true, type: 'object' },
              subcategories: { items: { type: 'object' }, type: 'array' },
              tags: { items: { type: 'string' }, type: 'array' },
              type: { type: 'string' }
            },
            required: ['description', 'images', 'key', 'name', 'parentCategory', 'tags', 'type'],
            type: 'object'
          }
        }
      }
    },
    parameters: [
      { $ref: '#/components/parameters/LangCode' },
      { $ref: '#/components/parameters/CategoryKey' }
    ],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CategoryDetailed' }
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
  const { key, langcode: locale } = await getValidatedRouterParams(event, routeSchema.parse)

  return await mediatorService.getDetailedCategory(key, { locale })
})
