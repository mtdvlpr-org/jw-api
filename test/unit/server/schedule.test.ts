import { loadPub } from 'meeting-schedules-parser/dist/node/index.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getPublicationSchedule } from '../../../server/utils/schedule'

vi.mock('meeting-schedules-parser/dist/node/index.js', () => ({
  loadPub: vi.fn()
}))

describe('schedule utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getPublicationSchedule', () => {
    it('should call loadPub with the provided URL for mwb', async () => {
      const url = 'https://example.com/mwb'
      const mockSchedule = [{ week: '2024-01-01' }]
      vi.mocked(loadPub).mockResolvedValue(mockSchedule)

      const result = await getPublicationSchedule(url, 'mwb')

      expect(loadPub).toHaveBeenCalledWith({ url })
      expect(result).toEqual(mockSchedule)
    })

    it('should call loadPub with the provided URL for wt', async () => {
      const url = 'https://example.com/wt'
      const mockSchedule = [{ article: 'Article 1' }]
      vi.mocked(loadPub).mockResolvedValue(mockSchedule)

      const result = await getPublicationSchedule(url, 'wt')

      expect(loadPub).toHaveBeenCalledWith({ url })
      expect(result).toEqual(mockSchedule)
    })
  })
})
