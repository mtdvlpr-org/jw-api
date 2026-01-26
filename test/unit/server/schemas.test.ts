import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import {
  biblePublicationSchema,
  jwLangCodeSchema,
  publicationFileFormatSchema,
  trackSchema
} from '../../../shared/utils/schemas'

// Stub globals before import
vi.hoisted(() => {
  vi.stubGlobal('jwLangCodes', ['E', 'S'])
  vi.stubGlobal('jwLangSymbols', ['en', 'es'])
  vi.stubGlobal('imageSizes', ['sm', 'md', 'lg'])
  vi.stubGlobal('imageTypes', ['pnr', 'sqr', 'wss'])
  vi.stubGlobal('biblePublications', ['nwt', 'nwtsty'])
  vi.stubGlobal('jwLangScripts', ['ROMAN', 'CYRILLIC', 'ARABIC'])
  vi.stubGlobal('publicationFileFormats', ['MP3', 'PDF', 'MP4'])
  vi.stubGlobal('categoryContainerKeys', [])
  vi.stubGlobal('categoryOnDemandKeys', [])
})

vi.stubGlobal('trackSchema', trackSchema)
vi.stubGlobal('jwLangCodeSchema', jwLangCodeSchema)
vi.stubGlobal('biblePublicationSchema', biblePublicationSchema)
vi.stubGlobal('publicationFileFormatSchema', publicationFileFormatSchema)

describe('schemas utils', () => {
  let schemas: typeof import('../../../server/utils/schemas')

  beforeEach(async () => {
    // Reset modules to ensure fresh evaluation if needed, though usually once is enough unless we change mocks
    vi.resetModules()
    schemas = await import('../../../server/utils/schemas')
  })

  describe('zodToParams', () => {
    it('should convert zod schema to openapi params', () => {
      const schema = z.object({
        count: z.number().optional(),
        id: z.string().describe('The ID')
      })

      const params = schemas.zodToParams(schema, 'query')

      expect(params).toHaveLength(2)
      expect(params[0]).toMatchObject({
        in: 'query',
        name: 'count',
        required: false
      })
      expect(params[1]).toMatchObject({
        description: 'The ID',
        in: 'query',
        name: 'id',
        required: true
      })
    })
  })

  describe('zodToRequestBody', () => {
    it('should convert zod schema to openapi request body', () => {
      const schema = z.object({
        name: z.string()
      })

      const body = schemas.zodToRequestBody(schema)

      // @ts-expect-error - body does not exist on reference
      expect(body.content['application/json']).toHaveProperty('schema')
    })
  })

  describe('zodToResponses', () => {
    it('should convert zod schema to openapi responses', () => {
      const schema = z.object({
        success: z.boolean()
      })

      const responses = schemas.zodToResponses(schema)

      // @ts-expect-error - responses does not exist on reference
      expect(responses['200'].content['application/json']).toHaveProperty('schema')
      expect(responses['200'].description).toBe('Successful response.')
    })
  })
})
