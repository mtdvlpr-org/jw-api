import { parse } from 'node-html-parser'

const bibleDataUrls = new Map<JwLangSymbol, string>()

export const scrapeBibleDataUrl = async (locale: JwLangSymbol) => {
  const bibleDataPath = 'json/data'
  const enUrl = 'https://www.jw.org/en/library/bible/nwt/books/'
  if (locale === 'en') return enUrl + bibleDataPath
  if (bibleDataUrls.has(locale)) return bibleDataUrls.get(locale)!

  const html = await $fetch<string>(enUrl)

  const root = parse(html)
  const base = root
    .querySelector(`link[rel="alternate"][hreflang="${locale}"]`)
    ?.getAttribute('href')

  if (!base) throw createNotFoundError('Failed to find alternate url.', { locale })

  const url = base + bibleDataPath
  bibleDataUrls.set(locale, url)

  return url
}
