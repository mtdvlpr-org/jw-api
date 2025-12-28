import { AsyncLocalStorage } from 'async_hooks'
import { describe, expect, it } from 'vitest'

import { asyncLocalStorage } from '../../../server/utils/async-storage'

describe('async-storage utils', () => {
  it('should export an instance of AsyncLocalStorage', () => {
    expect(asyncLocalStorage).toBeInstanceOf(AsyncLocalStorage)
  })
})
