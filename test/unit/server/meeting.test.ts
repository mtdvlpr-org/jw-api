import { beforeEach, describe, expect, it, vi } from 'vitest'

import { meetingService } from '../../../server/utils/meeting'

// Stub globals
const catalogService = {
  getCatalog: vi.fn(),
  getPublicationForDate: vi.fn()
}
const getMondayOfWeek = vi.fn()
const pubMediaService = {
  getMeetingWorkbook: vi.fn(),
  getMwbJwpub: vi.fn(),
  getStudyWatchtower: vi.fn(),
  getWtJwpub: vi.fn()
}
const jwpubService = {
  getMwbArticleForDate: vi.fn(),
  getWtArticleForDate: vi.fn()
}

vi.stubGlobal('catalogService', catalogService)
vi.stubGlobal('getMondayOfWeek', getMondayOfWeek)
vi.stubGlobal('pubMediaService', pubMediaService)
vi.stubGlobal('jwpubService', jwpubService)

describe('meeting utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getMeetingPublications', () => {
    it('should get meeting publications', async () => {
      const date = { week: 1, year: 2024 }
      const monday = new Date('2024-01-01')
      getMondayOfWeek.mockReturnValue(monday)

      catalogService.getPublicationForDate
        .mockResolvedValueOnce({ issue: 202401 }) // mwb
        .mockResolvedValueOnce({ issue: 202401 }) // w

      const result = await meetingService.getMeetingPublications(date)

      expect(catalogService.getCatalog).toHaveBeenCalled()
      expect(getMondayOfWeek).toHaveBeenCalledWith(date)
      expect(catalogService.getPublicationForDate).toHaveBeenCalledWith('mwb', 'E', monday)
      expect(catalogService.getPublicationForDate).toHaveBeenCalledWith('w', 'E', monday)

      expect(result).toEqual({
        watchtower: { issue: 202401 },
        workbook: { issue: 202401 }
      })
    })

    it('should handle failures', async () => {
      getMondayOfWeek.mockReturnValue(new Date())
      catalogService.getPublicationForDate.mockRejectedValue(new Error('Failed'))

      const result = await meetingService.getMeetingPublications()

      expect(result).toEqual({
        watchtower: null,
        workbook: null
      })
    })
  })

  describe('getMeetingArticles', () => {
    it('should fetch and process meeting articles', async () => {
      const date = { week: 1, year: 2024 }
      const langwritten = 'E'
      const monday = new Date('2024-01-01')
      getMondayOfWeek.mockReturnValue(monday)

      // Mock getMeetingPublications result indirectly via catalogService
      catalogService.getPublicationForDate.mockImplementation((pub) => {
        if (pub === 'w') return Promise.resolve({ issue: '202401' })
        if (pub === 'mwb') return Promise.resolve({ issue: '202401' })
        return Promise.resolve(null)
      })

      // Mock pubMediaService
      pubMediaService.getStudyWatchtower.mockResolvedValue({
        files: {
          E: {
            JWPUB: [{ file: { url: 'wt-url' } }]
          }
        }
      })
      pubMediaService.getMeetingWorkbook.mockResolvedValue({
        files: {
          E: {
            JWPUB: [{ file: { url: 'mwb-url' } }]
          }
        }
      })

      // Mock jwpubService
      jwpubService.getWtArticleForDate.mockResolvedValue({ title: 'WT Article' })
      jwpubService.getMwbArticleForDate.mockResolvedValue({ title: 'MWB Article' })

      const result = await meetingService.getMeetingArticles(langwritten, date)

      expect(catalogService.getPublicationForDate).toHaveBeenCalled()
      expect(pubMediaService.getStudyWatchtower).toHaveBeenCalledWith({
        date: { month: 1, year: 2024 },
        fileformat: 'JWPUB',
        langwritten
      })
      expect(pubMediaService.getMeetingWorkbook).toHaveBeenCalledWith({
        date: { month: 1, year: 2024 },
        fileformat: 'JWPUB',
        langwritten
      })
      expect(jwpubService.getWtArticleForDate).toHaveBeenCalledWith('wt-url', monday)
      expect(jwpubService.getMwbArticleForDate).toHaveBeenCalledWith('mwb-url', monday)

      expect(result).toEqual({
        watchtower: { title: 'WT Article' },
        workbook: { title: 'MWB Article' }
      })
    })

    it('should handle missing publications or files', async () => {
      const date = { week: 1, year: 2024 }
      const langwritten = 'E'
      getMondayOfWeek.mockReturnValue(new Date())

      // Mock getMeetingPublications to return nulls
      catalogService.getPublicationForDate.mockResolvedValue(null)

      const result = await meetingService.getMeetingArticles(langwritten, date)

      expect(result).toEqual({
        watchtower: null,
        workbook: null
      })
    })
  })

  describe('getMeetingSchedule', () => {
    it('should fetch and process meeting schedule', async () => {
      const date = { week: 1, year: 2024 }
      const langwritten = 'E'
      const monday = new Date('2024-01-01')
      getMondayOfWeek.mockReturnValue(monday)

      vi.stubGlobal('formatDate', (_d: Date) => '2024/01/01')
      vi.stubGlobal('getPublicationSchedule', (pub: unknown, type: string) => {
        if (type === 'wt') return [{ w_study_date: '2024/01/01' }]
        if (type === 'mwb') return [{ mwb_week_date: '2024/01/01' }]
        return []
      })

      catalogService.getPublicationForDate.mockResolvedValue({ issue: '202401' })

      pubMediaService.getWtJwpub.mockResolvedValue({
        issue: 202401
      })
      pubMediaService.getMwbJwpub.mockResolvedValue({
        issue: 202401
      })

      const result = await meetingService.getMeetingSchedule(langwritten, date)

      expect(result).toEqual({
        watchtower: { w_study_date: '2024/01/01' },
        workbook: { mwb_week_date: '2024/01/01' }
      })
    })
  })
})
