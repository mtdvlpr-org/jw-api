import { beforeEach, describe, expect, it, vi } from 'vitest'

import { jwRepository } from '../../../server/repository/jw'
import { jwService } from '../../../server/utils/jw'

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
})
