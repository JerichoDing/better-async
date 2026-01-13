# Bug 报告

## 1. safeAsync - 超时定时器资源泄漏（严重）

**位置**: `src/core/safeAsync.ts`

**问题描述**:
在 `safeAsync` 函数中，当启用重试机制时，每次重试都会创建新的超时定时器（通过 `createTimeoutSignal(timeout)`），但旧的定时器没有被清理。这会导致：

- 如果第一次尝试因为超时失败，重试时会创建新的超时定时器
- 旧的定时器可能仍在运行，造成资源泄漏
- 多个定时器可能同时触发，导致意外的行为

**代码位置**: 第 30-39 行

```typescript
while (true) {
  try {
    const signals: AbortSignal[] = []
    if (signal) signals.push(signal)
    if (timeout) signals.push(createTimeoutSignal(timeout))  // 每次重试都创建新定时器
    // ...
  }
}
```

**影响**: 高 - 可能导致内存泄漏和意外的超时行为

---

## 2. safeAsync - 超时错误被错误映射为 ABORTED（中等）

**位置**: `src/core/safeAsync.ts` 和 `src/error/errorMapper.ts`

**问题描述**:
当超时发生时，`createTimeoutSignal` 创建的 signal 会被取消，函数内部可能抛出 `DOMException('Aborted', 'AbortError')`。这个错误会被 `defaultErrorMapper` 映射为 `ErrorCode.ABORTED`（取消错误），而不是 `ErrorCode.TIMEOUT`（超时错误）。

**代码位置**:

- `src/core/safeAsync.ts` 第 34 行
- `src/error/errorMapper.ts` 第 8-10 行

**影响**: 中等 - 用户无法区分超时和取消操作，错误信息不准确

---

## 3. mergeAbortSignals - 事件监听器内存泄漏（中等）

**位置**: `src/utils/abort.ts`

**问题描述**:
`mergeAbortSignals` 函数为每个 signal 添加了 `abort` 事件监听器，但当 signal 被取消后，这些监听器没有被移除。虽然这不会导致功能问题，但会造成内存泄漏，特别是在长期运行的应用程序中。

**代码位置**: 第 9-15 行

```typescript
signals.forEach((signal) => {
  if (signal.aborted) {
    controller.abort();
  } else {
    signal.addEventListener("abort", onAbort); // 监听器从未被移除
  }
});
```

**影响**: 中等 - 长期运行的应用可能出现内存泄漏

---

## 4. createTimeoutSignal - 多次调用同一 controller 导致定时器泄漏（中等）

**位置**: `src/utils/timeout.ts`

**问题描述**:
如果同一个 `AbortController` 被多次调用 `createTimeoutSignal`，会创建多个定时器，但只有最后一个会被清理（因为只有一个 abort 监听器）。之前的定时器会继续运行，造成资源泄漏。

**代码位置**: 第 2-13 行

```typescript
export function createTimeoutSignal(
  ms: number,
  controller = new AbortController()
): AbortSignal {
  const timer = setTimeout(() => controller.abort(), ms); // 如果多次调用，会创建多个定时器

  controller.signal.addEventListener("abort", () => {
    clearTimeout(timer); // 只清理最后一个定时器
  });
  // ...
}
```

**影响**: 中等 - 如果用户错误地多次调用，会导致定时器泄漏

---

## 5. createTimeoutSignal - 已取消的 controller 仍创建定时器（轻微）

**位置**: `src/utils/timeout.ts`

**问题描述**:
如果传入的 `controller` 已经被取消（`controller.signal.aborted === true`），函数仍然会创建定时器，虽然会在 abort 事件中清理，但这是不必要的操作。

**代码位置**: 第 2-13 行

**影响**: 轻微 - 性能浪费，但不影响功能

---

## 6. safeAll - 同步错误可能导致部分函数已执行（轻微）

**位置**: `src/core/safeAll.ts`

**问题描述**:
如果传入的是函数数组，函数会立即执行（通过 `Promise.all` 和 `map`）。如果其中一个函数抛出同步错误，`Promise.all` 会立即拒绝，这可能导致其他函数已经开始执行但结果被忽略。虽然这是 `Promise.all` 的预期行为，但对于 `safeAll` 来说，可能需要更好的错误处理。

**代码位置**: 第 10-12 行

```typescript
const results = await Promise.all(
  promises.map((p) => (typeof p === "function" ? p() : p)) // 函数立即执行
);
```

**影响**: 轻微 - 可能是预期行为，但文档中未明确说明

---

## 7. safeAsync - 重试时未重置超时时间（轻微）

**位置**: `src/core/safeAsync.ts`

**问题描述**:
当启用重试机制时，每次重试都会使用相同的超时时间。这意味着如果第一次尝试因为超时失败，重试时仍然使用相同的超时时间，可能导致立即再次超时。虽然这可能是有意的设计，但可能不是用户期望的行为。

**代码位置**: 第 30-39 行

**影响**: 轻微 - 可能是设计选择，但可能不符合用户期望

---

## 总结

- **严重**: 1 个（资源泄漏）
- **中等**: 3 个（错误映射、内存泄漏、定时器泄漏）
- **轻微**: 3 个（性能优化、行为说明）

建议优先修复严重和中等严重性的 bug。
