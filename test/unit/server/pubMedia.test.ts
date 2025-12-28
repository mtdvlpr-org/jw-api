import { beforeEach, describe, expect, it, vi } from 'vitest'

import { pubMediaRepository } from '../../../server/repository/pubMedia'
import { pubMediaService } from '../../../server/utils/pubMedia'

vi.mock('../../../server/repository/pubMedia')

describe('pubMedia utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getPublication', () => {
    it('should call fetchPublication', async () => {
      const mockResult = { pub: 'w', title: 'Watchtower' }
      vi.mocked(pubMediaRepository.fetchPublication).mockResolvedValue(mockResult)
      const pubMock = { issue: 202401, langwritten: 'E', pub: 'w' } as const

      const result = await pubMediaService.getPublication(pubMock)

      expect(result).toEqual(mockResult)
      expect(pubMediaRepository.fetchPublication).toHaveBeenCalledWith(pubMock)
    })
  })
})
