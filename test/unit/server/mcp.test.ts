import { describe, expect, it } from 'vitest'

import { mcpService } from '../../../server/utils/mcp'

describe('mcp utils', () => {
  describe('resource', () => {
    it('should create a resource object', () => {
      const uri = new URL('https://example.com')
      const text = 'content'
      const result = mcpService.resource(uri, text)
      expect(result).toEqual({
        contents: [
          {
            mimeType: 'text/plain',
            text: 'content',
            uri: 'https://example.com/'
          }
        ]
      })
    })

    it('should support custom mime type', () => {
      const uri = new URL('https://example.com')
      const result = mcpService.resource(uri, '{}', 'application/json')
      expect(result.contents[0].mimeType).toBe('application/json')
    })
  })

  describe('resourceReference', () => {
    it('should create a resource reference', () => {
      const uri = 'https://example.com'
      const text = 'content'
      const result = mcpService.resourceReference(uri, text)
      expect(result).toEqual({
        content: [
          {
            resource: {
              mimeType: 'text/plain',
              text: 'content',
              uri: 'https://example.com'
            },
            type: 'resource'
          }
        ]
      })
    })
  })

  describe('assistantPrompt', () => {
    it('should create assistant prompt', () => {
      const result = mcpService.assistantPrompt('hello')
      expect(result).toEqual({
        messages: [{ content: { text: 'hello', type: 'text' }, role: 'assistant' }]
      })
    })
  })

  describe('userPrompt', () => {
    it('should create user prompt', () => {
      const result = mcpService.userPrompt('hello')
      expect(result).toEqual({
        messages: [{ content: { text: 'hello', type: 'text' }, role: 'user' }]
      })
    })
  })

  describe('jsonResource', () => {
    it('should create json resource', () => {
      const uri = new URL('https://example.com')
      const data = { key: 'value' }
      const result = mcpService.jsonResource(uri, data)
      expect(result.contents[0].mimeType).toBe('application/json')
      expect(JSON.parse(result.contents[0].text)).toEqual(data)
    })
  })

  describe('resourceError', () => {
    it('should create resource error', () => {
      const uri = new URL('https://example.com')
      const error = new Error('fail')
      const result = mcpService.resourceError(uri, error)
      expect(result.isError).toBe(true)
      expect(result.contents[0].text).toContain('Error: fail')
    })

    it('should handle non-error objects', () => {
      const uri = new URL('https://example.com')
      const result = mcpService.resourceError(uri, 'fail string')
      expect(result.contents[0].text).toContain('Error: fail string')
    })
  })

  describe('toolError', () => {
    it('should create tool error', () => {
      const error = new Error('fail')
      const result = mcpService.toolError(error)
      expect(result.isError).toBe(true)
      expect(result.content[0].text).toContain('Error: fail')
    })
  })

  describe('toolResult', () => {
    it('should create tool result', () => {
      const result = mcpService.toolResult('success')
      expect(result.content[0].text).toBe('success')
      expect(result.structuredContent).toBeUndefined()
    })

    it('should include structured content', () => {
      const result = mcpService.toolResult('success', { id: 1 })
      expect(result.structuredContent).toEqual({ id: 1 })
    })
  })
})
