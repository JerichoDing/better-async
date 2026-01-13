// src/utils/timeout.ts

// 使用 WeakMap 跟踪每个 controller 的定时器，以便清理
const timerMap = new WeakMap<AbortController, NodeJS.Timeout>()

/**
 * 创建超时信号
 * @param ms 超时时间（毫秒）
 * @param controller 可选的 AbortController，如果不提供则创建新的
 * @returns AbortSignal
 */
export function createTimeoutSignal(
  ms: number,
  controller = new AbortController()
): AbortSignal {
  // Bug 5: 如果 controller 已经取消，直接返回，不创建定时器
  if (controller.signal.aborted) {
    return controller.signal
  }

  // Bug 4: 如果之前已经有定时器，先清理它
  const existingTimer = timerMap.get(controller)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }

  const timer = setTimeout(() => controller.abort(), ms)
  timerMap.set(controller, timer)

  // 使用 once 选项，确保监听器只执行一次后自动移除
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timer)
    timerMap.delete(controller)
  }, { once: true })

  return controller.signal
}

/**
 * 创建超时信号并返回 controller（用于需要清理的场景）
 * @param ms 超时时间（毫秒）
 * @param controller 可选的 AbortController，如果不提供则创建新的
 * @returns 包含 signal 和 controller 的对象
 */
export function createTimeoutSignalWithController(
  ms: number,
  controller = new AbortController()
): { signal: AbortSignal; controller: AbortController } {
  // Bug 5: 如果 controller 已经取消，直接返回
  if (controller.signal.aborted) {
    return { signal: controller.signal, controller }
  }

  // Bug 4: 如果之前已经有定时器，先清理它
  const existingTimer = timerMap.get(controller)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }

  const timer = setTimeout(() => controller.abort(), ms)
  timerMap.set(controller, timer)

  // 使用 once 选项，确保监听器只执行一次后自动移除
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timer)
    timerMap.delete(controller)
  }, { once: true })

  return { signal: controller.signal, controller }
}

// 导出清理函数，用于手动清理定时器
export function cleanupTimeoutSignal(controller: AbortController): void {
  const timer = timerMap.get(controller)
  if (timer) {
    clearTimeout(timer)
    timerMap.delete(controller)
  }
}
