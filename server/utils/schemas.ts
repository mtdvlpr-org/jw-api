/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NitroRouteMeta } from 'nitropack/types'

import { z, ZodOptional } from 'zod'
import { createSchema } from 'zod-openapi'

// Enums
export const jwLangSymbolSchema = z
  .enum(jwLangSymbols)
  .describe('A JW language symbol')
  .meta({ example: 'en' })

export const jwLangCodeSchema = z
  .enum(jwLangCodes)
  .describe('A JW language code')
  .meta({ example: 'E' })

export const publicationFileFormatSchema = z
  .enum(['3GP', 'AAC', 'BRL', 'DAISY', 'EPUB', 'JWPUB', 'M4V', 'MP3', 'MP4', 'PDF', 'RTF', 'ZIP'])
  .describe('A publication file format.')
  .meta({ example: 'MP4' })

export const zodToParams = (
  zodObject: z.ZodObject<any, any>,
  type: 'cookie' | 'header' | 'path' | 'query'
): NonNullable<Required<NitroRouteMeta>['openAPI']['parameters']> => {
  return Object.entries(zodObject.shape).map(([name, zodSchema]) => {
    const { description, example, ...schema } = createSchema(zodSchema as any, { io: 'input' })
      .schema as any
    return {
      description,
      example,
      in: type,
      name,
      required: !(zodSchema instanceof ZodOptional),
      schema
    }
  })
}

export const zodToRequestBody = (
  schema: z.ZodObject<any, any>
): NonNullable<Required<NitroRouteMeta>['openAPI']['requestBody']> => {
  return { content: { 'application/json': createSchema(schema, { io: 'input' }).schema as any } }
}

export const zodToResponses = (
  schema: z.ZodObject<any, any>
): NonNullable<Required<NitroRouteMeta>['openAPI']['responses']> => {
  return {
    '200': {
      content: {
        'application/json': { schema: createSchema(schema, { io: 'output' }).schema as any }
      },
      description: 'Successful response'
    }
  }
}
