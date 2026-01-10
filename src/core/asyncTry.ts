// src/core/asyncTry.ts
export async function asyncTry<T, E = unknown>(
  promise: Promise<T>
): Promise<[E | null, T | null]> {
  try {
    return [null, await promise]
  } catch (e) {
    return [e as E, null]
  }
}
