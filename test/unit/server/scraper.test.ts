import { beforeEach, describe, expect, it, vi } from 'vitest'

import { scrapeBibleDataUrl } from '../../../server/utils/scraper'

const $fetch = vi.fn()
vi.stubGlobal('$fetch', $fetch)

describe('scraper utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('scrapeBibleDataUrl', () => {
    it('should return English URL directly', async () => {
      const url = await scrapeBibleDataUrl('en')
      expect(url).toBe('https://www.jw.org/en/library/bible/nwt/books/json/data')
      expect($fetch).not.toHaveBeenCalled()
    })

    it('should scrape URL for other locales', async () => {
      const mockHtml = `
        <html>
          <head>
            <link rel="alternate" hreflang="es" href="https://www.jw.org/es/biblioteca/biblia/nwt/libros/" />
          </head>
        </html>
      `
      vi.mocked($fetch).mockResolvedValue(mockHtml)

      const url = await scrapeBibleDataUrl('es')
      expect(url).toBe('https://www.jw.org/es/biblioteca/biblia/nwt/libros/json/data')
      expect($fetch).toHaveBeenCalledWith('https://www.jw.org/en/library/bible/nwt/books/')
    })

    it('should throw error if fetchText returns null', async () => {
      vi.mocked($fetch).mockResolvedValue(null)
      await expect(scrapeBibleDataUrl('ar')).rejects.toThrow('Failed to fetch html')
    })

    it('should throw error if alternate url is not found', async () => {
      const mockHtml = `
        <html>
          <head>
            <link rel="alternate" hreflang="fr" href="..." />
          </head>
        </html>
      `
      vi.mocked($fetch).mockResolvedValue(mockHtml)
      await expect(scrapeBibleDataUrl('pt')).rejects.toThrow('Failed to find alternate url')
    })
  })
})
