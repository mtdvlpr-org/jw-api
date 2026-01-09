import { beforeEach, describe, expect, it, vi } from 'vitest'

import { mediatorRepository } from '../../../server/repository/mediator'
import { mediatorService } from '../../../server/utils/mediator'

// Mock dependencies BEFORE importing anything that uses them
const { $fetch, findBestFile } = vi.hoisted(() => {
  const $fetch = vi.fn()
  const findBestFile = vi.fn()
  const apiNotFoundError = vi.fn((msg) => new Error(msg))

  vi.stubGlobal('$fetch', $fetch)
  vi.stubGlobal('findBestFile', findBestFile)
  vi.stubGlobal('apiNotFoundError', apiNotFoundError)
  vi.stubGlobal('defineCachedFunction', (fn: unknown) => fn)

  return { $fetch, apiNotFoundError, findBestFile }
})

vi.mock('../../../server/repository/mediator')

describe('mediator utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getCategories', () => {
    it('should call fetchCategories with default locale', async () => {
      const mockResult = [{ key: 'Audio', name: 'Audio' }]
      vi.mocked(mediatorRepository.fetchCategories).mockResolvedValue(mockResult)

      const result = await mediatorService.getCategories()

      expect(result).toEqual(mockResult)
      expect(mediatorRepository.fetchCategories).toHaveBeenCalledWith('E')
    })

    it('should call fetchCategories with provided locale', async () => {
      const mockResult = [{ key: 'Audio', name: 'Audio' }]
      vi.mocked(mediatorRepository.fetchCategories).mockResolvedValue(mockResult)

      const result = await mediatorService.getCategories('S')

      expect(result).toEqual(mockResult)
      expect(mediatorRepository.fetchCategories).toHaveBeenCalledWith('S')
    })
  })

  describe('getCategory', () => {
    it('should call fetchCategory', async () => {
      const mockCategory = { key: 'Audio', name: 'Audio' }
      vi.mocked(mediatorRepository.fetchCategory).mockResolvedValue(mockCategory)

      const result = await mediatorService.getCategory('Audio', { locale: 'F' })

      expect(result).toEqual(mockCategory)
      expect(mediatorRepository.fetchCategory).toHaveBeenCalledWith('F', 'Audio', undefined)
    })
  })

  describe('getDetailedCategory', () => {
    it('should call fetchCategoryDetails', async () => {
      const mockCategory = { key: 'Audio', name: 'Audio' }
      vi.mocked(mediatorRepository.fetchCategoryDetails).mockResolvedValue(mockCategory)

      const result = await mediatorService.getDetailedCategory('Audio')

      expect(result).toEqual(mockCategory)
      expect(mediatorRepository.fetchCategoryDetails).toHaveBeenCalledWith('E', 'Audio', undefined)
    })
  })

  describe('getLanguages', () => {
    it('should call fetchLanguages', async () => {
      const mockLanguages = [{ code: 'E', name: 'English' }]
      vi.mocked(mediatorRepository.fetchLanguages).mockResolvedValue(mockLanguages)

      const result = await mediatorService.getLanguages('E')

      expect(result).toEqual(mockLanguages)
      expect(mediatorRepository.fetchLanguages).toHaveBeenCalledWith('E')
    })
  })

  describe('getMediaItem', () => {
    it('should call fetchMediaItem', async () => {
      const mockMediaItem = { guid: '123' }
      vi.mocked(mediatorRepository.fetchMediaItem).mockResolvedValue(mockMediaItem)
      const mockPub = { docid: 123, langwritten: 'E' }

      const result = await mediatorService.getMediaItem(mockPub)

      expect(result).toEqual(mockMediaItem)
      expect(mediatorRepository.fetchMediaItem).toHaveBeenCalledWith(mockPub, 'www')
    })
  })

  describe('getMediaWithSubtitles', () => {
    it('should return media with best matching subtitle file', async () => {
      const mockPub = { docid: 123, langwritten: 'E' }
      const mockFiles = [{ url: 'video.mp4' }]
      const mockMediaItem = { files: mockFiles, guid: '123' }
      const mockBestMatch = { subtitles: { url: 'sub.vtt' }, url: 'video.mp4' }

      vi.mocked(mediatorRepository.fetchMediaItem).mockResolvedValue(mockMediaItem)
      vi.mocked(findBestFile).mockReturnValue(mockBestMatch)

      const result = await mediatorService.getMediaWithSubtitles(mockPub)

      expect(result).toEqual({
        bestMatch: mockBestMatch,
        video: mockMediaItem
      })
      expect(findBestFile).toHaveBeenCalledWith(mockFiles, true)
    })

    it('should throw error if no best match found', async () => {
      const mockPub = { docid: 123, langwritten: 'E' }
      const mockMediaItem = { files: [], guid: '123' }

      vi.mocked(mediatorRepository.fetchMediaItem).mockResolvedValue(mockMediaItem)
      vi.mocked(findBestFile).mockReturnValue(null)

      await expect(mediatorService.getMediaWithSubtitles(mockPub)).rejects.toThrow(
        'No media file with subtitles found'
      )
    })
  })

  describe('getSubtitles', () => {
    it('should return subtitles content', async () => {
      const mockPub = { docid: 123, langwritten: 'E' }
      const mockFiles = [{ url: 'video.mp4' }]
      const mockMediaItem = { files: mockFiles, guid: '123' }
      const mockBestMatch = { subtitles: { url: 'sub.vtt' }, url: 'video.mp4' }
      const mockSubtitlesContent = 'WEBVTT...'

      vi.mocked(mediatorRepository.fetchMediaItem).mockResolvedValue(mockMediaItem)
      vi.mocked(findBestFile).mockReturnValue(mockBestMatch)
      vi.mocked($fetch).mockResolvedValue(mockSubtitlesContent)

      const result = await mediatorService.getSubtitles(mockPub)

      expect(result).toEqual({
        bestMatch: mockBestMatch,
        subtitles: mockSubtitlesContent,
        video: mockMediaItem
      })
      expect($fetch).toHaveBeenCalledWith('sub.vtt', { responseType: 'text' })
    })

    it('should throw error if best match has no subtitles', async () => {
      const mockPub = { docid: 123, langwritten: 'E' }
      const mockMediaItem = { files: [], guid: '123' }
      const mockBestMatch = { url: 'video.mp4' } // No subtitles property

      vi.mocked(mediatorRepository.fetchMediaItem).mockResolvedValue(mockMediaItem)
      vi.mocked(findBestFile).mockReturnValue(mockBestMatch)

      await expect(mediatorService.getSubtitles(mockPub)).rejects.toThrow('No subtitles found')
    })
  })

  describe('getTranslations', () => {
    it('should call fetchTranslations', async () => {
      const mockTranslations = { hello: 'Hello' }
      vi.mocked(mediatorRepository.fetchTranslations).mockResolvedValue(mockTranslations)

      const result = await mediatorService.getTranslations('E')

      expect(result).toEqual(mockTranslations)
      expect(mediatorRepository.fetchTranslations).toHaveBeenCalledWith('E')
    })
  })
})
