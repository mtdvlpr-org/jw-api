import { jwRepository } from '#server/repository/jw'
import { parse } from 'node-html-parser'

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

  // Find the Bible data URL
  const path = root.getElementById('pageConfig')?.getAttribute('data-bible_data_api')

  // If no Bible data API is found, throw an error
  if (!path) throw createNotFoundError('Failed to find Bible data API.', locale)

  // Construct the URL
  const url = new URL(path, base).toString()

  // Cache the URL
  bibleDataUrls.set(locale, url)

  // Return the URL
  return url
}
