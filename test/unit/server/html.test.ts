import { describe, expect, it } from 'vitest'

import { parseHtml } from '../../../server/utils/html'

describe('html utils', () => {
  it('should parse HTML string', () => {
    const html = '<div><span>Test</span></div>'
    const root = parseHtml(html)

    expect(root).toBeDefined()
    expect(root.querySelector('span')?.text).toBe('Test')
  })
})
