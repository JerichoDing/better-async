# better-async

一个更好的 TypeScript 异步工具库，提供安全、可靠的异步操作处理能力。

## 特性

- 🛡️ **安全的异步操作** - 统一的错误处理机制
- ⏱️ **超时控制** - 内置超时支持
- 🔄 **重试机制** - 可配置的重试策略
- 🚫 **取消支持** - 基于 AbortSignal 的取消机制
- 📦 **TypeScript 支持** - 完整的类型定义
- 🎯 **零依赖** - 轻量级，无外部依赖

## 安装

```bash
npm install better-async
```

## 快速开始

### safeAsync - 安全的异步执行

`safeAsync` 是核心函数，提供了超时、重试、取消和错误处理等功能。

```typescript
import { safeAsync } from 'better-async'

// 基本用法
const result = await safeAsync(async () => {
  return await fetchData()
})

// 带超时
const result = await safeAsync(
  async () => await fetchData(),
  { timeout: 5000 } // 5秒超时
)

// 带重试
const result = await safeAsync(
  async () => await fetchData(),
  { retry: 3 } // 重试3次
)

// 带回退值
const result = await safeAsync(
  async () => await fetchData(),
  { fallback: 'default value' }
)

// 带取消信号
const controller = new AbortController()
const result = await safeAsync(
  async ({ signal }) => {
    return await fetchData({ signal })
  },
  { signal: controller.signal }
)

// 组合使用
const result = await safeAsync(
  async ({ signal }) => await fetchData({ signal }),
  {
    timeout: 5000,
    retry: 3,
    fallback: null,
    onError: (error) => console.error('操作失败:', error),
    mapError: (err) => new AppError(ErrorCode.NETWORK_ERROR, '网络错误', { cause: err })
  }
)
```

### asyncTry - Go 风格的错误处理

类似 Go 语言的错误处理模式，返回 `[error, result]` 元组。

```typescript
import { asyncTry } from 'better-async'

const [error, result] = await asyncTry(fetchData())

if (error) {
  console.error('错误:', error)
} else {
  console.log('结果:', result)
}
```

### safeAll - 安全执行多个异步操作

安全地执行多个异步函数，返回所有结果或第一个错误。

```typescript
import { safeAll } from 'better-async'

// 执行多个异步函数
const [error, results] = await safeAll([
  () => fetchUser(1),
  () => fetchUser(2),
  () => fetchUser(3)
])

if (error) {
  console.error('错误:', error)
} else {
  console.log('所有结果:', results) // [user1, user2, user3]
}

// 也可以传入 Promise 数组
const [error, results] = await safeAll([
  fetchUser(1),
  fetchUser(2),
  fetchUser(3)
])
```

### withAsyncCatch - 异步函数包装器

为异步函数添加错误捕获，避免未处理的异常。

```typescript
import { withAsyncCatch } from 'better-async'

const safeFetch = withAsyncCatch(
  async (url: string) => {
    const response = await fetch(url)
    return response.json()
  },
  (err) => console.error('请求失败:', err)
)

// 如果出错，返回 undefined 而不是抛出异常
const data = await safeFetch('https://api.example.com/data')
if (data) {
  console.log('数据:', data)
}
```

## API 参考

### safeAsync

执行异步函数，支持超时、重试、取消等功能。

```typescript
function safeAsync<T>(
  fn: (ctx: { signal?: AbortSignal }) => Promise<T>,
  options?: SafeAsyncOptions<T>
): Promise<T>
```

**选项：**

- `timeout?: number` - 超时时间（毫秒）
- `signal?: AbortSignal` - 取消信号
- `retry?: number` - 重试次数（默认 0）
- `fallback?: T` - 失败时的回退值
- `onError?: (error: AppError) => void` - 错误回调
- `mapError?: (err: unknown) => AppError` - 错误映射函数

### asyncTry

Go 风格的错误处理，返回 `[error, result]` 元组。

```typescript
function asyncTry<T, E = unknown>(
  promise: Promise<T>
): Promise<[E | null, T | null]>
```

### safeAll

安全执行多个异步操作。

```typescript
function safeAll<T>(
  promises: Array<(() => Promise<T>) | Promise<T>>
): Promise<[Error | null, T[] | null]>
```

### withAsyncCatch

为异步函数添加错误捕获。

```typescript
function withAsyncCatch<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  onError?: (err: unknown) => void
): (...args: T) => Promise<R | undefined>
```

### 工具函数

#### mergeAbortSignals

合并多个 AbortSignal。

```typescript
function mergeAbortSignals(signals: AbortSignal[]): AbortSignal
```

#### createTimeoutSignal

创建超时信号。

```typescript
function createTimeoutSignal(
  ms: number,
  controller?: AbortController
): AbortSignal
```

### 错误处理

#### AppError

应用错误类，包含错误代码、消息和元数据。

```typescript
class AppError extends Error {
  code: ErrorCodeType
  cause?: unknown
  meta?: Record<string, unknown>
}
```

#### ErrorCode

预定义的错误代码常量。

```typescript
const ErrorCode = {
  UNKNOWN: 'BA-000-0000',
  TIMEOUT: 'BA-001-0001',
  ABORTED: 'BA-001-0002',
  NETWORK_ERROR: 'NET-001-0001',
  VALIDATION_ERROR: 'SYS-001-0001',
} as const
```

## 使用示例

### 示例 1: 带超时的 API 请求

```typescript
import { safeAsync, ErrorCode, AppError } from 'better-async'

const fetchUser = async (id: number) => {
  return await safeAsync(
    async ({ signal }) => {
      const response = await fetch(`/api/users/${id}`, { signal })
      if (!response.ok) {
        throw new AppError(ErrorCode.NETWORK_ERROR, '请求失败')
      }
      return response.json()
    },
    {
      timeout: 5000,
      onError: (error) => console.error('获取用户失败:', error)
    }
  )
}
```

### 示例 2: 带重试的数据获取

```typescript
import { safeAsync } from 'better-async'

const fetchDataWithRetry = async () => {
  return await safeAsync(
    async () => {
      const response = await fetch('/api/data')
      return response.json()
    },
    {
      retry: 3,
      fallback: { data: [] }
    }
  )
}
```

### 示例 3: 批量操作

```typescript
import { safeAll } from 'better-async'

const fetchMultipleUsers = async (ids: number[]) => {
  const [error, users] = await safeAll(
    ids.map(id => () => fetch(`/api/users/${id}`).then(r => r.json()))
  )
  
  if (error) {
    throw error
  }
  
  return users
}
```

### 示例 4: 可取消的操作

```typescript
import { safeAsync } from 'better-async'

const controller = new AbortController()

// 5秒后自动取消
setTimeout(() => controller.abort(), 5000)

try {
  const result = await safeAsync(
    async ({ signal }) => {
      // 执行长时间运行的操作
      return await longRunningOperation({ signal })
    },
    { signal: controller.signal }
  )
} catch (error) {
  if (error.code === ErrorCode.ABORTED) {
    console.log('操作已取消')
  }
}
```

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 测试
npm test

# 测试（监听模式）
npm run test:watch

# 测试覆盖率
npm run test:coverage
```

## 许可证

MIT
