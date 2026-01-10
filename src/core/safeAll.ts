/**
 * 安全执行多个异步函数，返回所有结果或第一个错误
 * @param promises 异步函数数组或 Promise 数组
 * @returns Promise<[Error | null, T[] | null]>
 */
export async function safeAll<T>(
  promises: Array<(() => Promise<T>) | Promise<T>>
): Promise<[Error | null, T[] | null]> {
  try {
    const results = await Promise.all(
      promises.map((p) => (typeof p === 'function' ? p() : p))
    );
    return [null, results];
  } catch (error) {
    return [error instanceof Error ? error : new Error(String(error)), null];
  }
}
