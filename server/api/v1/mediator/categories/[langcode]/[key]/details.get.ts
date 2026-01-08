import { z } from 'zod'

const routeSchema = z.object({ key: categoryKeySchema, langcode: jwLangCodeSchema })

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          CategoryContainer: {
            properties: {
              description: { type: 'string' },
              images: { $ref: '#/components/schemas/ImagesObject' },
              key: { type: 'string' },
              name: { type: 'string' },
              parentCategory: {
                oneOf: [{ $ref: '#/components/schemas/CategoryParent' }, { type: 'null' }],
                type: ['object', 'null']
              },
              subcategories: {
                items: { $ref: '#/components/schemas/CategoryParent' },
                type: 'array'
              },
              tags: { items: { type: 'string' }, type: 'array' },
              type: { enum: ['container'], type: 'string' }
            },
            required: [
              'description',
              'subcategories',
              'parentCategory',
              'images',
              'key',
              'name',
              'tags',
              'type'
            ],
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
            schema: {
              oneOf: [
                { $ref: '#/components/schemas/CategoryContainer' },
                { $ref: '#/components/schemas/CategoryOndemand' }
              ],
              type: 'object'
            }
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
