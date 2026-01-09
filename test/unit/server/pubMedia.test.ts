import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PublicationFetcher } from '../../../shared/types/pubMedia'

import { downloadRepository } from '../../../server/repository/download'
import { pubMediaRepository } from '../../../server/repository/pubMedia'
import { pubMediaService } from '../../../server/utils/pubMedia'

// Mock defineCachedFunction BEFORE importing anything that uses it
vi.hoisted(() => {
  vi.stubGlobal('defineCachedFunction', (fn: unknown) => fn)
  vi.stubGlobal('apiNotFoundError', (msg: string) => new Error(msg))
})

vi.mock('../../../server/repository/pubMedia')
vi.mock('../../../server/repository/download')

const getStudyWatchtowerIssueMock = vi.fn()
const getWorkbookIssueMock = vi.fn()
const parseRTF = vi.fn()

vi.stubGlobal('getStudyWatchtowerIssue', getStudyWatchtowerIssueMock)
vi.stubGlobal('getWorkbookIssue', getWorkbookIssueMock)
vi.stubGlobal('parseRTF', parseRTF)

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

      const result = await pubMediaService.getStudyWatchtower({ date, langwritten })

      expect(result).toEqual(mockResult)
      expect(getStudyWatchtowerIssueMock).toHaveBeenCalledWith(date)
      expect(pubMediaRepository.fetchPublication).toHaveBeenCalledWith({
        issue,
        langwritten,
        pub: 'w'
      })
    })
  })

  describe('getMeetingWorkbook', () => {
    it('should call fetchPublication with correct params', async () => {
      const date = { month: 1, year: 2024 }
      const langwritten = 'E'
      const issue = '202401'

      getWorkbookIssueMock.mockReturnValue(issue)

      const mockResult = { issue, pub: 'mwb' }
      vi.mocked(pubMediaRepository.fetchPublication).mockResolvedValue(mockResult)

      const result = await pubMediaService.getMeetingWorkbook({ date, langwritten })

      expect(result).toEqual(mockResult)
      expect(getWorkbookIssueMock).toHaveBeenCalledWith(date)
      expect(pubMediaRepository.fetchPublication).toHaveBeenCalledWith({
        issue,
        langwritten,
        pub: 'mwb'
      })
    })
  })

  describe('getWatchtowerArticles', () => {
    it('should fetch RTF files and extract articles', async () => {
      const date = { month: 1, year: 2024 }
      const langwritten = 'E'
      const issue = '202401'

      getStudyWatchtowerIssueMock.mockReturnValue(issue)

      const mockPub = {
        files: {
          E: {
            RTF: [
              { file: { url: 'article1.rtf' }, mimetype: 'application/rtf', title: 'Article 1' },
              { file: { url: 'other.txt' }, mimetype: 'text/plain', title: 'Ignored' }
            ]
          }
        },
        issue
      }
      vi.mocked(pubMediaRepository.fetchPublication).mockResolvedValue(mockPub)

      const result = await pubMediaService.getWatchtowerArticles({ date, langwritten })

      expect(result).toEqual({
        articles: [{ file: { url: 'article1.rtf' }, title: 'Article 1' }],
        issue
      })
    })
  })

  describe('getWatchtowerArticleContent', () => {
    it('should download text and parse RTF', async () => {
      const url = 'http://example.com/article.rtf'
      const rtfContent = '{\\rtf1...}'
      const parsedContent = 'Parsed Text'

      vi.mocked(downloadRepository.text).mockResolvedValue(rtfContent)
      parseRTF.mockReturnValue(parsedContent)

      const result = await pubMediaService.getWatchtowerArticleContent(url)

      expect(downloadRepository.text).toHaveBeenCalledWith(url)
      expect(parseRTF).toHaveBeenCalledWith(rtfContent)
      expect(result).toBe(parsedContent)
    })
  })

  describe('getMwbJwpub', () => {
    it('should return JWPUB url if exists', async () => {
      const date = { month: 1, year: 2024 }
      const langwritten = 'E'
      const issue = '202401'
      getWorkbookIssueMock.mockReturnValue(issue)

      const mockPub = {
        files: { E: { JWPUB: [{ file: { url: 'http://example.com/mwb.jwpub' } }] } },
        issue,
        pub: 'mwb'
      }
      vi.mocked(pubMediaRepository.fetchPublication).mockResolvedValue(mockPub)

      const result = await pubMediaService.getMwbJwpub({ date, langwritten })
      expect(result).toBe('http://example.com/mwb.jwpub')
    })

    it('should throw if JWPUB not found', async () => {
      const date = { month: 1, year: 2024 }
      const langwritten = 'E'
      const issue = '202401'
      getWorkbookIssueMock.mockReturnValue(issue)

      vi.mocked(pubMediaRepository.fetchPublication).mockResolvedValue({
        files: {},
        issue,
        pub: 'mwb'
      })

      await expect(pubMediaService.getMwbJwpub({ date, langwritten })).rejects.toThrow(
        'Meeting Workbook JWPUB not found'
      )
    })
  })

  describe('getWtJwpub', () => {
    it('should return JWPUB url if exists', async () => {
      const date = { month: 1, year: 2024 }
      const langwritten = 'E'
      const issue = '202401'
      getStudyWatchtowerIssueMock.mockReturnValue(issue)

      const mockPub = {
        files: { E: { JWPUB: [{ file: { url: 'http://example.com/w.jwpub' } }] } },
        issue,
        pub: 'w'
      }
      vi.mocked(pubMediaRepository.fetchPublication).mockResolvedValue(mockPub)

      const result = await pubMediaService.getWtJwpub({ date, langwritten })
      expect(result).toBe('http://example.com/w.jwpub')
    })

    it('should throw if JWPUB not found', async () => {
      const date = { month: 1, year: 2024 }
      const langwritten = 'E'
      const issue = '202401'
      getStudyWatchtowerIssueMock.mockReturnValue(issue)

      vi.mocked(pubMediaRepository.fetchPublication).mockResolvedValue({
        files: {},
        issue,
        pub: 'w'
      })

      await expect(pubMediaService.getWtJwpub({ date, langwritten })).rejects.toThrow(
        'Study Watchtower JWPUB not found'
      )
    })
  })
})
