import type pino from 'pino'

import { AsyncLocalStorage } from 'async_hooks'

type StorageT = { logger: pino.Logger }
export const asyncLocalStorage = new AsyncLocalStorage<StorageT>()
