import { wolRepository } from '#server/repository/wol'
import { parse } from 'node-html-parser'

export const wolService = {
  getYeartext: async (locale: JwLangCode, year?: number) => {
    const result = await wolRepository.fetchYeartext(locale, year ?? new Date().getFullYear())

    return result
  },
  getYeartextDetails: async (locale: JwLangCode, year?: number) => {
    const usedYear = year ?? new Date().getFullYear()

    const result = await wolRepository.fetchYeartextDetails(locale, usedYear)

    const html = parse(result.title)

    return { parsedTitle: html.innerText, result, year: usedYear }
  }
}
