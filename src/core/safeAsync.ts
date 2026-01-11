// src/core/safeAsync.ts
import { AppError } from '../error/AppError'
import { defaultErrorMapper } from '../error/errorMapper'
import { createTimeoutSignal } from '../utils/timeout'
import { mergeAbortSignals } from '../utils/abort'

interface SafeAsyncOptions<T> {
  timeout?: number
  signal?: AbortSignal
  retry?: number
  fallback?: T
  onError?: (error: AppError) => void
  mapError?: (err: unknown) => AppError
}

export async function safeAsync<T>(
  fn: (ctx: { signal?: AbortSignal }) => Promise<T>,
  options: SafeAsyncOptions<T> = {}
): Promise<T> {
  const {
    timeout,
    signal,
    retry = 0,
    onError,
    mapError = defaultErrorMapper,
  } = options

  let attempts = 0

  while (true) {
    try {
      const signals: AbortSignal[] = []
      if (signal) signals.push(signal)
      if (timeout) signals.push(createTimeoutSignal(timeout))

      const mergedSignal =
        signals.length > 0 ? mergeAbortSignals(signals) : undefined

      return await fn({ signal: mergedSignal })
    } catch (err) {
      attempts++
      const appError = mapError(err)

      if (attempts > retry) {
        onError?.(appError)

        if (Object.prototype.hasOwnProperty.call(options, 'fallback')) {
          return options.fallback as T
        }

        throw appError
      }
    }
  }
}
