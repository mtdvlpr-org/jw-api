import { z } from 'zod'

const routeSchema = z.strictObject({ key: categoryKeySchema, langcode: jwLangCodeSchema })

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
    description: 'Get detailed information about a category.',
    operationId: 'getCategoryDetails',
    parameters: [
      { $ref: '#/components/parameters/LangCode' },
      { $ref: '#/components/parameters/CategoryKey' }
    ],
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              properties: {
                data: {
                  oneOf: [
                    { $ref: '#/components/schemas/CategoryContainer' },
                    { $ref: '#/components/schemas/CategoryOndemand' }
                  ],
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
    summary: 'Get detailed category.',
    tags: ['Mediator', 'Categories']
  }
})

export default defineLoggedEventHandler(async (event) => {
  const { key, langcode: locale } = parseRouteParams(event, routeSchema)

  const result = await mediatorService.getDetailedCategory(key, { locale })
  return apiSuccess(result)
})
