import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

// Stub globals before import
vi.stubGlobal('jwLangCodes', ['E', 'S'])
vi.stubGlobal('jwLangSymbols', ['en', 'es'])
vi.stubGlobal('publicationFileFormats', ['MP3', 'PDF', 'MP4'])

describe('schemas utils', () => {
  let schemas: typeof import('../../../server/utils/schemas')

  beforeEach(async () => {
    // Reset modules to ensure fresh evaluation if needed, though usually once is enough unless we change mocks
    vi.resetModules()
    schemas = await import('../../../server/utils/schemas')
  })

  describe('jwLangCodeSchema', () => {
    it('should validate valid codes', () => {
      expect(schemas.jwLangCodeSchema.parse('E')).toBe('E')
      expect(schemas.jwLangCodeSchema.parse('S')).toBe('S')
    })

    it('should reject invalid codes', () => {
      expect(() => schemas.jwLangCodeSchema.parse('INVALID_CODE')).toThrow()
    })
  })

  describe('jwLangSymbolSchema', () => {
    it('should validate valid symbols', () => {
      expect(schemas.jwLangSymbolSchema.parse('en')).toBe('en')
      expect(schemas.jwLangSymbolSchema.parse('es')).toBe('es')
    })

    it('should reject invalid symbols', () => {
      expect(() => schemas.jwLangSymbolSchema.parse('invalid_symbol')).toThrow()
    })
  })

  describe('bibleBookNrSchema', () => {
    it('should create a schema for Bible book numbers', () => {
      const schema = schemas.bibleBookNrSchema()
      expect(schema.parse(1)).toBe(1)
      expect(schema.parse('1')).toBe(1)
      expect(() => schema.parse(0)).toThrow()
      expect(() => schema.parse(67)).toThrow()
    })

    it('should create a schema for Bible book numbers with number type', () => {
      const schema = schemas.bibleBookNrSchema('number')
      expect(schema.parse(1)).toBe(1)
      expect(() => schema.parse('1')).toThrow()
    })
  })

  describe('bibleChapterNrSchema', () => {
    it('should create a schema for Bible chapter numbers', () => {
      const schema = schemas.bibleChapterNrSchema()
      expect(schema.parse(1)).toBe(1)
      expect(schema.parse('1')).toBe(1)
      expect(() => schema.parse(0)).toThrow()
      expect(() => schema.parse(151)).toThrow()
    })

    it('should create a schema for Bible chapter numbers with number type', () => {
      const schema = schemas.bibleChapterNrSchema('number')
      expect(schema.parse(1)).toBe(1)
      expect(() => schema.parse('1')).toThrow()
    })
  })

  describe('bibleVerseNrSchema', () => {
    it('should create a schema for Bible verse numbers', () => {
      const schema = schemas.bibleVerseNrSchema()
      expect(schema.parse(1)).toBe(1)
      expect(schema.parse('1')).toBe(1)
      expect(() => schema.parse(0)).toThrow()
      expect(() => schema.parse(177)).toThrow()
    })

    it('should create a schema for Bible verse numbers with number type', () => {
      const schema = schemas.bibleVerseNrSchema('number')
      expect(schema.parse(1)).toBe(1)
      expect(() => schema.parse('1')).toThrow()
    })
  })

  describe('publicationFileFormatSchema', () => {
    it('should validate valid formats', () => {
      expect(schemas.publicationFileFormatSchema.parse('MP3')).toBe('MP3')
      expect(schemas.publicationFileFormatSchema.parse('PDF')).toBe('PDF')
    })

    it('should reject invalid formats', () => {
      expect(() => schemas.publicationFileFormatSchema.parse('EXE')).toThrow()
    })
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
      expect(responses['200'].description).toBe('Successful response')
    })
  })
})
