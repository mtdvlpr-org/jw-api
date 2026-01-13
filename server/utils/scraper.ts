import { jwRepository } from '#server/repository/jw'
import { parse } from 'node-html-parser'

import { downloadRepository } from '../repository/download'

const bibleDataUrls = new Map<JwLangSymbol, string>()

/**
 * Scrapes the Bible data URL for a given locale.
 * @param locale The locale to scrape the Bible data URL for. Defaults to English.
 * @returns The Bible data URL.
 */
export const scrapeBibleDataUrl = async (locale: JwLangSymbol = 'en'): Promise<string> => {
  // Check if the URL is already cached
  if (bibleDataUrls.has(locale)) return bibleDataUrls.get(locale)!

  // Fetch the HTML from the homepage
  const html = await jwRepository.fetchHomepage(locale)

  // Parse the HTML
  const root = parse(html)

  // Find the base URL
  const base = root.querySelector('head > base')?.getAttribute('href')
  if (!base) throw apiNotFoundError(`Failed to find base URL for locale '${locale}'`)

  // Find the Bible data URL
  const path = root.getElementById('pageConfig')?.getAttribute('data-bible_data_api')
  if (!path) throw apiNotFoundError(`Failed to find Bible data API for locale '${locale}'`)

  // Construct the URL
  const url = formatUrl(base, path)

  // Cache the URL
  bibleDataUrls.set(locale, url)

  // Return the URL
  return url
}

export const scrapeBibleChapter = async (
  book: BibleBookNr,
  chapter: number,
  locale: JwLangCode = 'E'
) => {
  const url = await wolService.getBibleChapterUrl(book, chapter, locale)
  const html = await downloadRepository.text(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JW-API/1.0)' }
  })

  const parsed = parseHtml(html)

  const outline = parsed.querySelectorAll('ul.outline li p').map((el) => el.text.trim())
  const chapterStudyNotes = parsed
    .querySelectorAll('div.section:not([data-key]) div.studyNoteGroup p')
    .map((el) => el.text.trim())

  const verses: Record<
    string,
    {
      crossReferences: string[]
      footnotes: string[]
      publicationIndex: { path?: string; title: string; url?: string }[]
      researchGuide: {
        content?: string
        path?: string
        pubTitle?: string
        title: string
        url?: string
      }[]
      studyNotes: string[]
    }
  > = {}

  const base = url.split('/').slice(0, 3).join('/')
  const langSymbol = url.split('/').slice(3, 4)[0]

  parsed.querySelectorAll('div.section[data-key]').forEach((section) => {
    const verseNumber = section.getAttribute('data-key')?.split('-').pop()
    if (!verseNumber) return

    const studyNotes = section.querySelectorAll('div.studyNoteGroup p').map((el) => el.text.trim())
    const footnotes = section.querySelectorAll('div.group.footnote p').map((el) => el.text.trim())
    const crossReferences = section
      .querySelectorAll('div.group.marginal span.marginal.title > span.scalableui')
      .flatMap((el) =>
        el.text
          .trim()
          .split(';')
          .map((r) => r.trim())
      )

    const researchGuide = section.querySelectorAll('li.item.ref-rsg a').map((el) => ({
      path: el.getAttribute('href')?.replace(`/${langSymbol}/`, '/'),
      title: el.text.trim(),
      url: el.getAttribute('href')?.replace(`/${langSymbol}/`, `${base}/`)
    }))

    const publicationIndex = section.querySelectorAll('li.item.ref-dx a').map((el) => ({
      path: el.getAttribute('href')?.replace(`/${langSymbol}/`, '/'),
      title: el.text.trim(),
      url: el.getAttribute('href')?.replace(`/${langSymbol}/`, `${base}/`)
    }))

    verses[verseNumber] = {
      crossReferences,
      footnotes,
      publicationIndex,
      researchGuide,
      studyNotes
    }
  })

  return { chapterStudyNotes, outline, verses }
}
