// src/core/safeAsync.ts
import { AppError } from '../error/AppError'
import { ErrorCode } from '../error/ErrorCode'
import { defaultErrorMapper } from '../error/errorMapper'
import { createTimeoutSignalWithController, cleanupTimeoutSignal } from '../utils/timeout'
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
  let timeoutController: AbortController | null = null

  while (true) {
    try {
      // Bug 1: 在重试前清理旧的超时定时器
      if (timeoutController) {
        cleanupTimeoutSignal(timeoutController)
        timeoutController = null
      }

      const signals: AbortSignal[] = []
      if (signal) signals.push(signal)
      
      // Bug 1: 使用新的函数来跟踪 controller，以便清理
      if (timeout) {
        const timeoutResult = createTimeoutSignalWithController(timeout)
        timeoutController = timeoutResult.controller
        signals.push(timeoutResult.signal)
      }

      const mergedSignal =
        signals.length > 0 ? mergeAbortSignals(signals) : undefined

      return await fn({ signal: mergedSignal })
    } catch (err) {
      attempts++
      
      // Bug 2: 检查是否是超时错误（来自 timeout signal 的 AbortError）
      let appError: AppError
      if (
        timeout &&
        timeoutController &&
        timeoutController.signal.aborted &&
        err instanceof DOMException &&
        err.name === 'AbortError'
      ) {
        // 这是超时错误，不是用户取消
        appError = new AppError(ErrorCode.TIMEOUT, 'Operation timed out', { cause: err })
      } else {
        appError = mapError(err)
      }

      // 清理超时定时器
      if (timeoutController) {
        cleanupTimeoutSignal(timeoutController)
        timeoutController = null
      }

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
