import { describe, expect, it } from 'vitest'

import { parseRTF } from '../../../server/utils/rtf'

describe('rtf utils', () => {
  describe('parseRTF', () => {
    it('should throw error for empty content', () => {
      expect(() => parseRTF('')).toThrow('RTF content must be a non-empty string')
      // @ts-expect-error - testing invalid input
      expect(() => parseRTF(null)).toThrow('RTF content must be a non-empty string')
    })

    it('should throw error for invalid RTF header', () => {
      expect(() => parseRTF('plain text')).toThrow('Invalid RTF format - must start with {\\rtf')
    })

    it('should parse simple RTF content', () => {
      const rtf = '{\\rtf1\\ansi Plain Text}'
      const result = parseRTF(rtf)
      expect(result).toBe('Plain Text')
    })

    it('should handle special characters', () => {
      const rtf = '{\\rtf1\\ansi Text with \\emdash\\ and \\tab\\}'
      // \emdash is —, \tab is \t (but cleaned up by cleanAndFormatText?)
      // cleanAndFormatText replaces \t with space if it's considered whitespace?
      // No, rtfToText handles \tab as \t. cleanAndFormatText regex might affect it.
      // cleanAndFormatText: text = text.replace(/[^\S\n]+/g, ' ') (normalizes whitespace)

      const result = parseRTF(rtf)
      // The implementation converts emdash to unicode char.
      expect(result).toContain('—')
    })

    it('should clean and format text', () => {
      const rtf = '{\\rtf1\\ansi Header\\par\\par Body text}'
      const result = parseRTF(rtf)
      expect(result).toBe('Header\nBody text')
    })

    it('should handle unicode characters', () => {
      const rtf = "{\\rtf1\\ansi\\uc1\\u233\\'e9}"
      // \u233 is é. \'e9 is also é in windows-1252.
      const result = parseRTF(rtf)
      expect(result).toContain('é')
    })

    it('should remove picture groups', () => {
      // \bin4 followed by 4 bytes (ABCD)
      const rtf = '{\\rtf1\\ansi Text before {\\pict\\bin4 ABCD} Text after}'
      const result = parseRTF(rtf)
      expect(result).toBe('Text before Text after')
    })
  })
})
