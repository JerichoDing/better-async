// src/utils/abort.ts
export function mergeAbortSignals(
  signals: AbortSignal[]
): AbortSignal {
  const controller = new AbortController()

  const onAbort = () => controller.abort()

  signals.forEach(signal => {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', onAbort)
    }
  })

  return controller.signal
}
