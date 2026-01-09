import { beforeEach, describe, expect, it, vi } from 'vitest'

import { jwRepository } from '../../../server/repository/jw'
import { jwService } from '../../../server/utils/jw'

// Mock defineCachedFunction BEFORE importing anything that uses it
vi.hoisted(() => {
  vi.stubGlobal('defineCachedFunction', (fn: unknown) => fn)
  vi.stubGlobal('apiNotFoundError', (msg: string) => new Error(msg))
})

vi.mock('../../../server/repository/jw')

describe('jw service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getLanguages', () => {
    it('should fetch languages and filter by webOnly by default', async () => {
      const mockLanguages = [
        { code: 'en', hasWebContent: true, name: 'English' },
        { code: 'xx', hasWebContent: false, name: 'NoWeb' }
      ]
      vi.mocked(jwRepository.fetchLanguages).mockResolvedValue(mockLanguages)

      const result = await jwService.getLanguages('en')

      expect(jwRepository.fetchLanguages).toHaveBeenCalledWith('en')
      expect(result).toHaveLength(1)
      expect(result[0].code).toBe('en')
    })

    it('should return all languages if webOnly is false', async () => {
      const mockLanguages = [
        { code: 'en', hasWebContent: true, name: 'English' },
        { code: 'xx', hasWebContent: false, name: 'NoWeb' }
      ]
      vi.mocked(jwRepository.fetchLanguages).mockResolvedValue(mockLanguages)

      const result = await jwService.getLanguages('en', false)

      expect(result).toHaveLength(2)
    })
  })

  describe('getLanguage', () => {
    it('should return language by name (case insensitive)', async () => {
      const mockLanguages = [
        { code: 'en', name: 'English', vernacularName: 'English' },
        { code: 'es', name: 'Spanish', vernacularName: 'Español' }
      ]
      vi.mocked(jwRepository.fetchLanguages).mockResolvedValue(mockLanguages)

      const result = await jwService.getLanguage('english')
      expect(result).toEqual(mockLanguages[0])

      const result2 = await jwService.getLanguage('SPANISH')
      expect(result2).toEqual(mockLanguages[1])
    })

    it('should return language by vernacular name (case insensitive)', async () => {
      const mockLanguages = [{ code: 'es', name: 'Spanish', vernacularName: 'Español' }]
      vi.mocked(jwRepository.fetchLanguages).mockResolvedValue(mockLanguages)

      const result = await jwService.getLanguage('español')
      expect(result).toEqual(mockLanguages[0])
    })

    it('should throw error if language not found', async () => {
      const mockLanguages = [{ code: 'en', name: 'English', vernacularName: 'English' }]
      vi.mocked(jwRepository.fetchLanguages).mockResolvedValue(mockLanguages)

      await expect(jwService.getLanguage('German')).rejects.toThrow("Language 'German' not found")
    })
  })
})
