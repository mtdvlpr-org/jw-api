import { bibleRepository } from '#server/repository/bible'
import { jwRepository } from '#server/repository/jw'
import { mediatorRepository } from '#server/repository/mediator'
import { pubMediaRepository } from '#server/repository/pubMedia'
import { wolRepository } from '#server/repository/wol'
import { generateVerseId } from '#server/utils/general'
import { generateMediaKey } from '#server/utils/media'
import { scrapeBibleDataUrl } from '#server/utils/scraper'
import { describe, expect, it, vi } from 'vitest'

// Stub globals that might be missing in test environment
vi.hoisted(() => {
  vi.stubGlobal('defineCachedFunction', (fn: unknown) => fn)
})

// Stub globals for auto-imports that aren't present in test env for imported modules
vi.stubGlobal('generateMediaKey', generateMediaKey)
vi.stubGlobal('generateVerseId', generateVerseId)
vi.stubGlobal('scrapeBibleDataUrl', scrapeBibleDataUrl)

describe('jw api integration', { timeout: 10000 }, () => {
  it('should fetch real jw languages', async () => {
    const result = await jwRepository.fetchLanguages('en')
    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)

    // Check for a known language
    const hasEnglish = result.some((l) => l.symbol === 'en')
    expect(hasEnglish).toBe(true)
  })

  it('should fetch real yeartext', async () => {
    const result = await wolRepository.fetchYeartext('E', new Date().getFullYear())
    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)
  })

  it('should fetch real publication details (Watchtower)', async () => {
    const pubRequest = {
      issue: 202401,
      langwritten: 'E',
      pub: 'w'
    } as const

    const result = await pubMediaRepository.fetchPublication(pubRequest)
    expect(result).toBeDefined()
    expect(result.pub).toBe('w')
    expect(result.files).toBeDefined()
  })

  it('should fetch real bible data', async () => {
    const result = await bibleRepository.fetchBibleData('en')
    expect(result).toBeDefined()
    // Should have books in editionData
    const books = result.editionData?.books
    expect(books).toBeDefined()
    // There are 66 books in the standard bible
    expect(Object.keys(books || {}).length).toBeGreaterThan(0)
  })

  it('should fetch real media items', async () => {
    const pubRequest: PublicationFetcher = {
      fileformat: 'MP4',
      issue: 4,
      langwritten: 'E',
      pub: 'imv'
    }

    const result = await mediatorRepository.fetchMediaItem(pubRequest)
    expect(result).toBeDefined()
    expect(result.files).toBeDefined()
    expect(result.files.length).toBeGreaterThan(0)
  })

  it('should fetch real bible verse (Genesis 1:1)', async () => {
    const book = 1 // Genesis
    const chapter = 1
    const verse = 1
    const result = await bibleRepository.fetchBibleVerse(book, chapter, verse, 'en')

    expect(result).toBeDefined()
    expect(result.content).toContain('In the beginning')
  })
})
