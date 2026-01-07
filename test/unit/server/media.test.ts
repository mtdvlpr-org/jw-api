import { describe, expect, it, vi } from 'vitest'

import type { MediaItemFile } from '../../../shared/types/mediator'
import type { PublicationFetcher } from '../../../shared/types/pubMedia'

import {
  extractMediaKey,
  extractResolution,
  findBestFile,
  findBestImage,
  generateMediaKey,
  isMediaKey,
  parseMediaKey
} from '../../../server/utils/media'
import { imageSizes, imageTypes } from '../../../shared/types/media.types'

vi.stubGlobal('imageTypes', imageTypes)
vi.stubGlobal('imageSizes', imageSizes)

describe('jw media utils', () => {
  describe('isMediaKey', () => {
    it('should return true for docid-', () => {
      expect(isMediaKey('docid-123456_1_VIDEO')).toBe(true)
    })

    it('should return true for pub-', () => {
      expect(isMediaKey('pub-jw_x_VIDEO')).toBe(true)
    })

    it('should return false for other strings', () => {
      expect(isMediaKey('something-else')).toBe(false)
    })

    it('should return true for complex keys', () => {
      expect(isMediaKey('pub-jwb-105_10_x_VIDEO')).toBe(true)
    })
  })

  describe('generateMediaKey', () => {
    it('should generate docid format', () => {
      const pub = {
        docid: 123456,
        track: 1
      } as unknown as PublicationFetcher
      expect(generateMediaKey(pub)).toBe('docid-123456_1_VIDEO')
    })

    it('should generate pub format', () => {
      const pub = {
        issue: 20230100,
        pub: 'w',
        track: 1
      } as unknown as PublicationFetcher
      expect(generateMediaKey(pub)).toBe('pub-w_202301_1_VIDEO')
    })

    it('should handle file formats', () => {
      const videoPub = {
        docid: 123,
        fileformat: 'MP4'
      } as unknown as PublicationFetcher
      expect(generateMediaKey(videoPub)).toBe('docid-123_x_VIDEO')

      const audioPub = {
        docid: 123,
        fileformat: 'MP3'
      } as unknown as PublicationFetcher
      expect(generateMediaKey(audioPub)).toBe('docid-123_x_AUDIO')
    })
  })

  describe('extractMediaKey', () => {
    it('should return input if it is a valid id', () => {
      expect(extractMediaKey('pub-jw_x_VIDEO')).toBe('pub-jw_x_VIDEO')
    })

    it('should extract from item param', () => {
      expect(extractMediaKey('https://mediator.jw.org/finder?item=pub-jwban_x_VIDEO')).toBe(
        'pub-jwban_x_VIDEO'
      )
    })

    it('should extract from lank param', () => {
      expect(extractMediaKey('https://jw.org/finder?lank=pub-jw_x_VIDEO')).toBe('pub-jw_x_VIDEO')
    })

    it('should extract from docid param', () => {
      expect(extractMediaKey('https://jw.org/finder?docid=docid-123_1_VIDEO')).toBe(
        'docid-123_1_VIDEO'
      )
    })

    it('should extract from path', () => {
      expect(extractMediaKey('https://jw.org/pub-jw_x_VIDEO')).toBe('pub-jw_x_VIDEO')
    })

    it('should extract from hash', () => {
      expect(extractMediaKey('https://jw.org/videos/#en/pub-jw_x_VIDEO')).toBe('pub-jw_x_VIDEO')
    })

    it('should return null if not found', () => {
      expect(extractMediaKey('https://jw.org')).toBe(null)
    })

    it('should return null on invalid input', () => {
      expect(extractMediaKey('not-a-url')).toBe(null)
    })
  })

  describe('parseMediaKey', () => {
    it('should parse docid format', () => {
      const result = parseMediaKey('docid-123456_1_VIDEO')
      expect(result).toEqual({
        docid: 123456,
        langwritten: 'E',
        track: 1
      })
    })

    it('should parse pub format with issue', () => {
      const result = parseMediaKey('pub-w_202301_1_VIDEO')
      expect(result).toEqual({
        issue: 202301,
        langwritten: 'E',
        pub: 'w',
        track: 1
      })
    })

    it('should parse pub format without issue', () => {
      const result = parseMediaKey('pub-jwb_x_VIDEO')
      expect(result).toEqual({
        issue: undefined,
        langwritten: 'E',
        pub: 'jwb',
        track: 0
      })
    })

    it('should handle custom language', () => {
      const result = parseMediaKey('pub-w_202301_1_VIDEO', 'S')
      expect(result).toEqual({
        issue: 202301,
        langwritten: 'S',
        pub: 'w',
        track: 1
      })
    })

    it('should return null for invalid key', () => {
      expect(parseMediaKey('invalid-key')).toBe(null)
    })
  })

  describe('extractResolution', () => {
    it('should extract resolution from label', () => {
      expect(extractResolution({ label: '720p' } as unknown as MediaItemFile)).toBe(720)
      expect(extractResolution({ label: '480p' } as unknown as MediaItemFile)).toBe(480)
    })

    it('should return 0 if no match', () => {
      expect(extractResolution({ label: 'HD' } as unknown as MediaItemFile)).toBe(0)
    })
  })

  describe('findBestFile', () => {
    const media = [
      { label: '480p', subtitles: { url: 'sub' } },
      { label: '720p' },
      { label: '360p' }
    ] as unknown as MediaItemFile[]

    it('should return null for empty list', () => {
      expect(findBestFile([])).toBe(null)
    })

    it('should return single item', () => {
      expect(findBestFile([media[0]])).toBe(media[0])
    })

    it('should sort by resolution', () => {
      // Should pick 720p as it is the highest resolution
      expect(findBestFile(media)).toEqual(media[1]) // 720p
    })

    it('should prioritize subtitles if requested', () => {
      expect(findBestFile(media, true)).toEqual(media[0]) // 480p has subtitles
    })

    it('should return null if subtitles requested but not found', () => {
      expect(findBestFile(media.slice(1), true)).toBe(null)
    })
  })

  describe('findBestImage', () => {
    it('should return null for empty images', () => {
      expect(findBestImage({})).toBe(null)
    })

    it('should return highest priority image (wsr xl)', () => {
      const images = {
        sqr: { xl: 'sqr-xl' },
        wsr: { lg: 'wsr-lg', xl: 'wsr-xl' }
      }
      expect(findBestImage(images)).toBe('wsr-xl')
    })

    it('should fall back to smaller sizes if larger not available', () => {
      const images = {
        wsr: { sm: 'wsr-sm', xs: 'wsr-xs' }
      }
      expect(findBestImage(images)).toBe('wsr-sm')
    })

    it('should fall back to lower priority types if preferred type not available', () => {
      const images = {
        cvr: { xl: 'cvr-xl' },
        sqr: { xl: 'sqr-xl' }
      }
      expect(findBestImage(images)).toBe('sqr-xl')
    })

    it('should handle complex availability', () => {
      const images = {
        lsr: { sm: 'lsr-sm' },
        sqr: { xl: 'sqr-xl' }
      }

      expect(findBestImage(images)).toBe('lsr-sm')
    })
  })
})
