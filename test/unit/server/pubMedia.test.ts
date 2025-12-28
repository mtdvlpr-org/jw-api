import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PublicationFetcher } from '../../../shared/types/pubMedia'

import { pubMediaRepository } from '../../../server/repository/pubMedia'
import { pubMediaService } from '../../../server/utils/pubMedia'

vi.mock('../../../server/repository/pubMedia')

const getStudyWatchtowerIssueMock = vi.fn()
const getWorkbookIssueMock = vi.fn()

vi.stubGlobal('getStudyWatchtowerIssue', getStudyWatchtowerIssueMock)
vi.stubGlobal('getWorkbookIssue', getWorkbookIssueMock)

describe('pubMedia utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getPublication', () => {
    it('should call fetchPublication', async () => {
      const mockResult = { pub: 'w', title: 'Watchtower' }
      vi.mocked(pubMediaRepository.fetchPublication).mockResolvedValue(mockResult)
      const pubMock = { issue: 202401, langwritten: 'E', pub: 'w' } as unknown as PublicationFetcher

      const result = await pubMediaService.getPublication(pubMock)

      expect(result).toEqual(mockResult)
      expect(pubMediaRepository.fetchPublication).toHaveBeenCalledWith(pubMock)
    })
  })

  describe('getStudyWatchtower', () => {
    it('should call fetchPublication with correct params', async () => {
      const date = { month: 1, year: 2024 }
      const langwritten = 'E'
      const issue = '202401'

      getStudyWatchtowerIssueMock.mockReturnValue(issue)

      const mockResult = { issue, pub: 'w' }
      vi.mocked(pubMediaRepository.fetchPublication).mockResolvedValue(mockResult)

      const result = await pubMediaService.getStudyWatchtower(langwritten, date)

      expect(result).toEqual(mockResult)
      expect(getStudyWatchtowerIssueMock).toHaveBeenCalledWith(date)
      expect(pubMediaRepository.fetchPublication).toHaveBeenCalledWith({
        issue,
        langwritten,
        pub: 'w'
      })
    })
  })

  describe('getWorkbook', () => {
    it('should call fetchPublication with correct params', async () => {
      const date = { month: 1, year: 2024 }
      const langwritten = 'E'
      const issue = '202401'

      getWorkbookIssueMock.mockReturnValue(issue)

      const mockResult = { issue, pub: 'mwb' }
      vi.mocked(pubMediaRepository.fetchPublication).mockResolvedValue(mockResult)

      const result = await pubMediaService.getWorkbook(langwritten, date)

      expect(result).toEqual(mockResult)
      expect(getWorkbookIssueMock).toHaveBeenCalledWith(date)
      expect(pubMediaRepository.fetchPublication).toHaveBeenCalledWith({
        issue,
        langwritten,
        pub: 'mwb'
      })
    })
  })
})
