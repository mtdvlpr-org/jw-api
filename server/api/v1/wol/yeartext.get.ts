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
          English: { summary: 'English', value: 'E' },
          O: { summary: 'Dutch', value: 'O' },
          Spanish: { summary: 'Spanish', value: 'S' }
        },
        in: 'query',
        name: 'wtlocale',
        required: true,
        schema: { enum: [...jwLangCodes], type: 'string' }
      },
      {
        description: 'The year of the yeartext.',
        example: currentYear,
        in: 'query',
        name: 'year',
        required: false,
        schema: {
          default: currentYear,
          minimum: currentYear,
          type: 'number'
        }
      }
    ],
    responses: {
      200: {
        content: {
          'application/json': {
            example: { yeartext: { 2025: 'The yeartext of 2025.' } },
            schema: {
              properties: {
                yeartext: {
                  additionalProperties: { type: 'string' },
                  type: 'object'
                }
              },
              type: 'object'
            }
          }
        },
        description: 'A successful response.'
      },
      400: {
        content: {
          'application/json': {
            example: { error: 'Invalid year or language.' },
            schema: {
              type: 'object'
            }
          }
        },
        description: 'Validation Error.'
      },
      404: {
        content: {
          'application/json': {
            example: { error: 'Yeartext not found.' },
            schema: {
              type: 'object'
            }
          }
        },
        description: 'Not Found.'
      }
    }
  }
})

export default defineLoggedEventHandler<typeof _responseSchema>(async (event) => {
  const { wtlocale, year } = await getValidatedQuery(event, querySchema.parse)

  const { parsedTitle, year: usedYear } = await wolService.getYeartextDetails(wtlocale, year)

  return { yeartext: { [usedYear?.toString()]: parsedTitle } }
})
