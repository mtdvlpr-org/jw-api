import { beforeEach, describe, expect, it, vi } from 'vitest'

import { wolRepository } from '../../../server/repository/wol'
import { wolService } from '../../../server/utils/wol'

// Mock globals BEFORE importing anything that uses them
vi.hoisted(() => {
  const parseHtml = vi.fn((html: string) => {
    // Simple mock that strips HTML tags
    const text = html.replace(/<[^>]*>/g, '')
    return { innerText: text }
  })

  vi.stubGlobal('defineCachedFunction', (fn: unknown) => fn)
  vi.stubGlobal('parseHtml', parseHtml)
})

vi.mock('../../../server/repository/wol')

describe('wol utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getYeartext', () => {
    it('should call fetchYeartext with provided year', async () => {
      vi.mocked(wolRepository.fetchYeartext).mockResolvedValue('text')
      const result = await wolService.getYeartext('E', 2023)
      expect(result).toBe('text')
      expect(wolRepository.fetchYeartext).toHaveBeenCalledWith('E', 2023)
    })

    it('should use current year if not provided', async () => {
      vi.mocked(wolRepository.fetchYeartext).mockResolvedValue('text')
      const currentYear = new Date().getFullYear()
      const result = await wolService.getYeartext('E')
      expect(result).toBe('text')
      expect(wolRepository.fetchYeartext).toHaveBeenCalledWith('E', currentYear)
    })
  })

  describe('getYeartextDetails', () => {
    it('should return parsed details with provided year', async () => {
      const mockResult = { title: '<h1>God is love.</h1>' }
      vi.mocked(wolRepository.fetchYeartextDetails).mockResolvedValue(mockResult)

      const result = await wolService.getYeartextDetails('E', 2023)

      expect(result).toEqual({
        parsedTitle: 'God is love.',
        result: mockResult,
        year: 2023
      })
      expect(wolRepository.fetchYeartextDetails).toHaveBeenCalledWith('E', 2023)
    })

    it('should use current year if not provided', async () => {
      const mockResult = { title: '<h1>God is love.</h1>' }
      vi.mocked(wolRepository.fetchYeartextDetails).mockResolvedValue(mockResult)
      const currentYear = new Date().getFullYear()

      const result = await wolService.getYeartextDetails('E')

      expect(result).toEqual({
        parsedTitle: 'God is love.',
        result: mockResult,
        year: currentYear
      })
      expect(wolRepository.fetchYeartextDetails).toHaveBeenCalledWith('E', currentYear)
    })
  })
})
