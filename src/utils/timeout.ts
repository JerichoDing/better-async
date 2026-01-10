// src/utils/timeout.ts
export function createTimeoutSignal(
  ms: number,
  controller = new AbortController()
): AbortSignal {
  const timer = setTimeout(() => controller.abort(), ms)

  controller.signal.addEventListener('abort', () => {
    clearTimeout(timer)
  })

  return controller.signal
}
