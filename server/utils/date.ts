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
  date?: Date,
  format: 'YYYY-MM-DD' | 'YYYY/MM/DD' | 'YYYYMMDD' = 'YYYY-MM-DD'
): string => {
  if (!date) date = new Date()
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
      throw createInternalServerError(`Unsupported date format: ${format}`)
  }
}
