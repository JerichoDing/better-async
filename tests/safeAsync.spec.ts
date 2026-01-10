// tests/safeAsync.spec.ts
import { describe, it, expect } from 'vitest'
import { safeAsync } from '../src/core/safeAsync'

describe('safeAsync', () => {
  it('returns value', async () => {
    const result = await safeAsync(async () => 123)
    expect(result).toBe(123)
  })

  it('timeout works', async () => {
    await expect(
      safeAsync(
        () => new Promise(r => setTimeout(r, 100)),
        { timeout: 10 }
      )
    ).rejects.toThrow()
  })

  it('fallback works', async () => {
    const result = await safeAsync(
      async () => { throw new Error('fail') },
      { fallback: 42 }
    )
    expect(result).toBe(42)
  })
})
