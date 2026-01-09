import { AsyncLocalStorage } from 'async_hooks'

export const asyncLocalStorage = new AsyncLocalStorage<RequestContext>()
