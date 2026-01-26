/**
 * Gets the Monday of the week.
 * @param date The week to get the Monday for. Defaults to the current week.
 * @returns The Monday of the week.
 */
export const getMondayOfWeek = (date?: { week: number; year: number }): Date => {
  if (!date) date = getWeekOfYear()

  const { week, year } = date

  // January 4th is always in week 1
  const monday = new Date(Date.UTC(year, 0, 4))

  // Get the day of the week for January 4th
  const day = monday.getUTCDay() || 7 // Sunday = 7

  // Set the date to the Monday of the desired week
  monday.setUTCDate(monday.getUTCDate() - day + 1 + (week - 1) * 7)
  return monday
}

/**
 * Gets the week of the year.
 * @param date The date to get the week of the year for. Defaults to the current date.
 * @returns The week of the year.
 */
export const getWeekOfYear = (date?: { day: number; month: number; year: number }) => {
  const utcDate = date ? new Date(Date.UTC(date.year, date.month - 1, date.day)) : new Date()

  // Get the day of the week
  const dayOfWeek = utcDate.getUTCDay() || 7 // Sunday = 7

  // Set the date to the Thursday of the week
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayOfWeek)

  // Get the start of the week year
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1))

  // Calculate the week number
  const weekNumber = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)

  return { week: weekNumber, year: yearStart.getUTCFullYear() }
}

/**
 * Formats a date.
 * @param date - The date to format. Defaults to the current date.
 * @param format - The format to use. Defaults to 'YYYY-MM-DD'.
 * @returns The formatted date.
 */
export const formatDate = (
  date?: Date | string,
  format: 'YYYY-MM-DD' | 'YYYY/MM/DD' | 'YYYYMMDD' = 'YYYY-MM-DD'
): string => {
  if (!date) date = new Date()
  if (typeof date === 'string') date = parseDate(date)

  const year = date.getFullYear()
  const day = pad(date.getDate()) // 01 - 31
  const month = pad(date.getMonth() + 1) // 01 - 12

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`
    case 'YYYYMMDD':
      return `${year}${month}${day}`
    default:
      throw new Error(`Invalid date format: ${format}`)
  }
}

/**
 * Parses a date string into a Date object.
 * @param date The date to parse.
 * @returns The parsed date.
 *
 * @example
 * parseDate('2024-01-30') // 2024-01-30
 * parseDate('2024/01/30') // 2024-01-30
 * parseDate('20240130') // 2024-01-30
 */
export const parseDate = (date: string): Date => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return new Date(date)
  }
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
    return new Date(date.replace(/\//g, '-'))
  }
  if (/^\d{8}$/.test(date)) {
    const year = +date.slice(0, 4)
    const month = +date.slice(4, 6)
    const day = +date.slice(6, 8)
    return new Date(Date.UTC(year, month - 1, day))
  }
  throw new Error(`Invalid date format: ${date}`)
}
