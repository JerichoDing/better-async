// src/core/withAsyncCatch.ts
export function withAsyncCatch<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  onError?: (err: unknown) => void
) {
  return async (...args: T): Promise<R | undefined> => {
    try {
      return await fn(...args)
    } catch (e) {
      onError?.(e)
      return undefined
    }
  }
}
