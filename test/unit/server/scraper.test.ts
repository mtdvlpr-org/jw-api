import { beforeEach, describe, expect, it, vi } from 'vitest'

import { scrapeBibleDataUrl } from '../../../server/utils/scraper'

// Mock defineCachedFunction before imports
vi.hoisted(() => {
  vi.stubGlobal('defineCachedFunction', (fn: unknown) => fn)
})

const $fetch = vi.fn()
const createNotFoundError = vi.fn((msg) => new Error(msg))
const formatUrl = vi.fn((base, path) => new URL(path, base).toString())

vi.stubGlobal('$fetch', $fetch)
vi.stubGlobal('createNotFoundError', createNotFoundError)
vi.stubGlobal('formatUrl', formatUrl)

describe('scraper utils', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Note: We cannot easily clear the module-level bibleDataUrls cache
    // without reloading the module, so we use different locales for each test.
  })

  describe('scrapeBibleDataUrl', () => {
    it('should scrape English URL', async () => {
      const mockHtml = `
        <html>
          <head><base href="https://www.jw.org/" /></head>
          <body>
            <div id="pageConfig" data-bible_data_api="en/library/bible/nwt/books/json/data"></div>
          </body>
        </html>
      `
      vi.mocked($fetch).mockResolvedValue(mockHtml)

      // Use a unique locale to ensure no cache hit
      const url = await scrapeBibleDataUrl('en-test')
      expect(url).toBe('https://www.jw.org/en/library/bible/nwt/books/json/data')
      expect($fetch).toHaveBeenCalled()
    })

    it('should scrape URL for other locales', async () => {
      const mockHtml = `
        <html>
          <head><base href="https://www.jw.org/" /></head>
          <body>
            <div id="pageConfig" data-bible_data_api="es/biblioteca/biblia/nwt/libros/json/data"></div>
          </body>
        </html>
      `
      vi.mocked($fetch).mockResolvedValue(mockHtml)

      const url = await scrapeBibleDataUrl('es')
      expect(url).toBe('https://www.jw.org/es/biblioteca/biblia/nwt/libros/json/data')
      expect($fetch).toHaveBeenCalled()
    })

    it('should cache the scraped URL for subsequent calls', async () => {
      const mockHtml = `
        <html>
          <head><base href="https://www.jw.org/" /></head>
          <body>
            <div id="pageConfig" data-bible_data_api="pt/biblioteca/biblia/nwt/livros/json/data"></div>
          </body>
        </html>
      `
      vi.mocked($fetch).mockResolvedValue(mockHtml)

      // First call - should fetch
      const url1 = await scrapeBibleDataUrl('pt')
      expect(url1).toBe('https://www.jw.org/pt/biblioteca/biblia/nwt/livros/json/data')
      expect($fetch).toHaveBeenCalledTimes(1)

      // Second call - should return cached
      const url2 = await scrapeBibleDataUrl('pt')
      expect(url2).toBe('https://www.jw.org/pt/biblioteca/biblia/nwt/livros/json/data')
      expect($fetch).toHaveBeenCalledTimes(1)
    })

    it('should throw error if Bible data API is not found', async () => {
      const mockHtml = `
        <html>
          <head><base href="https://www.jw.org/" /></head>
          <body>
            <div>No config here</div>
          </body>
        </html>
      `
      vi.mocked($fetch).mockResolvedValue(mockHtml)

      await expect(scrapeBibleDataUrl('it')).rejects.toThrow('Failed to find Bible data API.')

      expect(createNotFoundError).toHaveBeenCalledWith('Failed to find Bible data API.', 'it')
    })
  })
})
