/**
 * A duration string in hours, minutes and seconds.
 * @example '1:32:28'
 * @example '32:28'
 */
export type DurationHHMM = `${number}:${number}:${number}` | `${number}:${number}`

/**
 * A human readable duration string in hours, minutes and seconds.
 * @example '1h 32m 28s'
 * @example '32m 28s'
 */
export type DurationMinSec = `${number}h ${number}m ${number}s` | `${number}m ${number}s`

/**
 * A human readable date time string.
 * @example '2026-01-30 13:32:28'
 */
export type HumanReadableDateTime = `${number}-${string}-${number} ${number}:${number}:${number}`

/**
 * An ISO date time string.
 * @example '2026-01-30T13:32:28.886Z'
 */
export type ISODateTime = `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`

/**
 * An ISO date time string with an offset.
 * @example '2026-01-30T13:32:28.886+00:00'
 */
export type ISODateTimeOffset =
  `${number}-${number}-${number}T${number}:${number}:${number}+${number}:${number}`

/**
 * A timestamp string.
 * @example '13:32:28.886'
 */
export type Timestamp = `${number}:${number}:${number}.${number}`
