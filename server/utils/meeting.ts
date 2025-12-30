/**
 * Gets the meeting publications for a given date.
 * @param date The week to get the meeting publications for. Defaults to the current week.
 * @returns The meeting publications.
 */
const getMeetingPublications = async (date?: { week: number; year: number }) => {
  // Make sure the catalog is loaded
  await catalogService.getCatalog()

  // Get the Monday of the week
  const monday = getMondayOfWeek(date)

  // Get the meeting publications
  const [mwb, w] = await Promise.allSettled([
    catalogService.getPublicationForDate('mwb', 'E', monday),
    catalogService.getPublicationForDate('w', 'E', monday)
  ])

  // Either publication can be null if publication is not released yet or for the Memorial week.
  return {
    watchtower: w.status === 'fulfilled' ? w.value : null,
    workbook: mwb.status === 'fulfilled' ? mwb.value : null
  }
}

/**
 * A service providing meeting-related utilities.
 */
export const meetingService = { getMeetingPublications }
