import { z } from 'zod'

const currentYear = new Date().getFullYear()

const querySchema = z.object({
  wtlocale: jwLangCodeSchema,
  year: yearSchema
    .min(currentYear - 1)
    .max(currentYear + 1)
    .optional()
    .meta({ description: 'The year of the yeartext.', examples: [currentYear] })
})

const _responseSchema = z.object({ yeartext: z.partialRecord(z.number(), z.string()) })

defineRouteMeta({
  openAPI: {
    parameters: [
      {
        description: 'The language of the yeartext.',
        examples: {
          1: { summary: 'English', value: 'E' },
          2: { summary: 'Dutch', value: 'O' },
          3: { summary: 'Spanish', value: 'S' }
        },
        in: 'query',
        name: 'wtlocale',
        required: true,
        schema: { type: 'string' }
      },
      {
        description: 'The year of the yeartext.',
        example: 2026,
        in: 'query',
        name: 'year',
        required: false,
        schema: { default: 2026, maximum: 2027, minimum: 2025, type: 'integer' }
      }
    ],
    responses: {
      200: {
        content: {
          'application/json': {
            example: { yeartext: { '2026': 'The yeartext of 2026.' } },
            schema: {
              properties: {
                yeartext: { additionalProperties: { type: 'string' }, type: 'object' }
              },
              type: 'object'
            }
          }
        },
        description: 'Successful response.'
      },
      400: { $ref: '#/components/responses/400' },
      404: { $ref: '#/components/responses/404' }
    },
    tags: ['WOL']
  }
})

export default defineLoggedEventHandler<typeof _responseSchema>(async (event) => {
  const { wtlocale, year } = await getValidatedQuery(event, querySchema.parse)

  const { parsedTitle, year: usedYear } = await wolService.getYeartextDetails(wtlocale, year)

  return { yeartext: { [usedYear?.toString()]: parsedTitle } }
})
