// src/utils/abort.ts
export function mergeAbortSignals(
  signals: AbortSignal[]
): AbortSignal {
  const controller = new AbortController()

  // 存储所有添加的监听器，以便后续清理
  const listeners: Array<{ signal: AbortSignal; listener: () => void }> = []

  const cleanupListeners = () => {
    listeners.forEach(({ signal, listener }) => {
      signal.removeEventListener('abort', listener)
    })
    listeners.length = 0
  }

  const onAbort = () => {
    controller.abort()
    // Bug 3: 清理所有监听器，防止内存泄漏
    cleanupListeners()
  }

  signals.forEach(signal => {
    if (signal.aborted) {
      controller.abort()
    } else if (!controller.signal.aborted) {
      // 只有当 controller 还没有被取消时，才添加监听器
      signal.addEventListener('abort', onAbort)
      listeners.push({ signal, listener: onAbort })
    }
  })

  // 如果 controller 已经被取消，立即清理
  if (controller.signal.aborted) {
    cleanupListeners()
  } else {
    // 当合并的 signal 被取消时，也清理监听器
    controller.signal.addEventListener('abort', cleanupListeners, { once: true })
  }

  return controller.signal
}
