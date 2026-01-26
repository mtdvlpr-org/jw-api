import type { $brand } from 'zod'

export type HTML = $brand<'HTML'> & string

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type RequiredFields<T, K extends keyof T> = Required<Pick<T, K>> & T
