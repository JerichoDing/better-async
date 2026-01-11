# Jest 测试结果报告

**生成时间**: 2026/01/11 17:24:27 (2026-01-11T09:24:27.138Z)
**执行耗时**: 1.49 秒

## 📊 测试摘要

| 指标 | 数量 |
|------|------|
| ✅ 通过 | 160 |
| ❌ 失败 | 0 |
| ⏭️  跳过 | 0 |
| 📝 总计 | 160 |
| 📁 测试套件 | 9 |
| ✅ 通过的套件 | 9 |
| ❌ 失败的套件 | 0 |

**测试状态**: ✅ 全部通过

## ✅ 通过的测试（160 个）

### tests/safeAsync.spec.ts

- ✅ safeAsync 基本功能 应该成功返回结果 (1ms)
- ✅ safeAsync 基本功能 应该处理异步函数 (11ms)
- ✅ safeAsync 基本功能 应该传递 signal 给函数 (1ms)
- ✅ safeAsync 超时功能 应该在超时时抛出错误 (25ms)
- ✅ safeAsync 超时功能 应该在超时时间内成功执行 (12ms)
- ✅ safeAsync 超时功能 超时应该创建 AbortSignal (102ms)
- ✅ safeAsync 取消功能 应该支持 AbortSignal 取消 (102ms)
- ✅ safeAsync 取消功能 应该合并多个 signal (101ms)
- ✅ safeAsync 重试功能 应该重试指定次数 (1ms)
- ✅ safeAsync 重试功能 应该在重试次数用完后抛出错误 (1ms)
- ✅ safeAsync 重试功能 重试应该使用 mapError 转换错误 (3ms)
- ✅ safeAsync 回退值功能 应该在失败时返回回退值 (0ms)
- ✅ safeAsync 回退值功能 回退值应该支持 undefined (0ms)
- ✅ safeAsync 回退值功能 回退值应该支持 null (1ms)
- ✅ safeAsync 回退值功能 回退值应该在重试失败后返回 (0ms)
- ✅ safeAsync 错误处理 应该使用默认错误映射器 (1ms)
- ✅ safeAsync 错误处理 应该使用自定义错误映射器 (1ms)
- ✅ safeAsync 错误处理 应该调用 onError 回调 (0ms)
- ✅ safeAsync 错误处理 onError 应该在抛出错误前调用 (1ms)
- ✅ safeAsync 错误处理 应该正确处理 AppError (0ms)
- ✅ safeAsync 错误处理 应该正确处理 DOMException AbortError (1ms)
- ✅ safeAsync 组合功能 应该同时支持超时和重试 (33ms)
- ✅ safeAsync 组合功能 应该同时支持超时和回退值 (11ms)
- ✅ safeAsync 组合功能 应该同时支持取消和超时 (101ms)
- ✅ safeAsync 边界情况 应该处理没有 signal 和 timeout 的情况 (1ms)
- ✅ safeAsync 边界情况 应该处理只有 signal 没有 timeout 的情况 (0ms)
- ✅ safeAsync 边界情况 应该处理只有 timeout 没有 signal 的情况 (0ms)
- ✅ safeAsync 边界情况 应该处理 retry 为 0 的情况 (1ms)
- ✅ safeAsync 边界情况 应该处理函数不使用 signal 的情况 (0ms)
- ✅ safeAsync 边界情况 应该处理 mapError 返回不同的错误 (0ms)
- ✅ safeAsync 错误映射场景 应该正确处理各种类型的错误 (0ms)

### tests/timeout.spec.ts

- ✅ createTimeoutSignal 基本功能 应该创建 AbortSignal (1ms)
- ✅ createTimeoutSignal 基本功能 应该在指定时间后取消 (11ms)
- ✅ createTimeoutSignal 基本功能 应该使用自定义 controller (0ms)
- ✅ createTimeoutSignal 超时行为 应该精确控制超时时间 (51ms)
- ✅ createTimeoutSignal 超时行为 应该处理很短的超时时间 (2ms)
- ✅ createTimeoutSignal 超时行为 应该处理较长的超时时间 (101ms)
- ✅ createTimeoutSignal 清理行为 应该在 signal 取消时清理定时器 (51ms)
- ✅ createTimeoutSignal 清理行为 应该防止重复触发 (62ms)
- ✅ createTimeoutSignal 事件监听 应该触发 abort 事件 (11ms)
- ✅ createTimeoutSignal 事件监听 应该支持多个监听器 (10ms)
- ✅ createTimeoutSignal 边界情况 应该处理 0 毫秒超时 (1ms)
- ✅ createTimeoutSignal 边界情况 应该处理负数超时（应该立即取消） (11ms)
- ✅ createTimeoutSignal 实际使用场景 应该用于超时控制 (52ms)
- ✅ createTimeoutSignal 实际使用场景 应该与其他 AbortSignal 配合使用 (0ms)
- ✅ createTimeoutSignal 边界情况 应该处理非常大的超时值 (12ms)
- ✅ createTimeoutSignal 边界情况 应该处理已取消的 controller (0ms)
- ✅ createTimeoutSignal 边界情况 应该正确处理多次调用 createTimeoutSignal 使用同一个 controller (1ms)

### tests/safeAll.spec.ts

- ✅ safeAll 成功情况 应该返回所有结果当所有 Promise 成功时 (1ms)
- ✅ safeAll 成功情况 应该处理函数数组 (0ms)
- ✅ safeAll 成功情况 应该混合处理 Promise 和函数 (1ms)
- ✅ safeAll 成功情况 应该处理空数组 (0ms)
- ✅ safeAll 成功情况 应该处理单个 Promise (0ms)
- ✅ safeAll 成功情况 应该处理不同类型的返回值 (0ms)
- ✅ safeAll 错误情况 应该返回第一个错误 (1ms)
- ✅ safeAll 错误情况 应该将非 Error 对象转换为 Error (0ms)
- ✅ safeAll 错误情况 应该将数字错误转换为 Error (0ms)
- ✅ safeAll 错误情况 应该将 null 错误转换为 Error (0ms)
- ✅ safeAll 错误情况 应该处理函数中的错误 (0ms)
- ✅ safeAll 错误情况 应该处理所有 Promise 都失败的情况 (0ms)
- ✅ safeAll 异步行为 应该等待所有 Promise 完成 (31ms)
- ✅ safeAll 异步行为 应该在第一个错误时立即返回 (11ms)
- ✅ safeAll 函数执行 应该立即执行函数（Promise.all 会立即调用） (0ms)
- ✅ safeAll 函数执行 应该为每个函数创建新的 Promise (1ms)
- ✅ safeAll 边界情况 应该处理混合类型的返回值 (0ms)
- ✅ safeAll 边界情况 应该处理 Promise 立即拒绝的情况 (0ms)
- ✅ safeAll 边界情况 应该处理函数立即抛出错误的情况 (0ms)
- ✅ safeAll 边界情况 应该处理对象错误 (0ms)
- ✅ safeAll 边界情况 应该处理布尔值错误 (1ms)

### tests/ErrorCode.spec.ts

- ✅ ErrorCode 常量定义 应该定义所有错误代码常量 (0ms)
- ✅ ErrorCode 常量定义 所有错误代码应该是字符串 (0ms)
- ✅ ErrorCode 常量定义 所有错误代码应该遵循格式 AA-BBB-CCCC (0ms)
- ✅ ErrorCode 类型定义 ErrorCodeType 应该包含所有错误代码 (1ms)
- ✅ ErrorCode 类型定义 应该可以用于类型注解 (0ms)
- ✅ ErrorCode 错误代码分类 BA-* 应该是 better-async 模块的错误 (0ms)
- ✅ ErrorCode 错误代码分类 NET-* 应该是网络相关错误 (0ms)
- ✅ ErrorCode 错误代码分类 SYS-* 应该是系统相关错误 (0ms)
- ✅ ErrorCode 不可变性 ErrorCode 对象应该是只读的 (0ms)
- ✅ ErrorCode 使用场景 应该可以用于 switch 语句 (0ms)
- ✅ ErrorCode 使用场景 应该可以用于错误映射 (0ms)

### tests/withAsyncCatch.spec.ts

- ✅ withAsyncCatch 成功情况 应该返回函数结果当没有错误时 (1ms)
- ✅ withAsyncCatch 成功情况 应该支持多个参数 (0ms)
- ✅ withAsyncCatch 成功情况 应该支持无参数函数 (0ms)
- ✅ withAsyncCatch 成功情况 应该保持原始函数的类型 (1ms)
- ✅ withAsyncCatch 错误处理 应该返回 undefined 当发生错误时 (0ms)
- ✅ withAsyncCatch 错误处理 应该调用 onError 回调 (0ms)
- ✅ withAsyncCatch 错误处理 应该处理不同类型的错误 (0ms)
- ✅ withAsyncCatch 错误处理 应该在没有 onError 时静默处理错误 (0ms)
- ✅ withAsyncCatch 错误处理 应该处理多个错误 (1ms)
- ✅ withAsyncCatch 参数传递 应该正确传递所有参数 (0ms)
- ✅ withAsyncCatch 参数传递 应该支持复杂参数 (0ms)
- ✅ withAsyncCatch 返回值类型 应该返回 R | undefined (0ms)
- ✅ withAsyncCatch 返回值类型 应该返回 undefined 当错误时 (1ms)
- ✅ withAsyncCatch 实际使用场景 应该用于 API 调用 (10ms)
- ✅ withAsyncCatch 实际使用场景 应该用于数据库操作 (0ms)

### tests/errorMapper.spec.ts

- ✅ defaultErrorMapper AppError 处理 应该直接返回 AppError 实例 (0ms)
- ✅ defaultErrorMapper AppError 处理 应该保持 AppError 的所有属性 (1ms)
- ✅ defaultErrorMapper AbortError 处理 应该将 DOMException AbortError 转换为 AppError (0ms)
- ✅ defaultErrorMapper AbortError 处理 应该保持 AbortError 作为 cause (0ms)
- ✅ defaultErrorMapper 未知错误处理 应该将普通 Error 转换为 AppError (0ms)
- ✅ defaultErrorMapper 未知错误处理 应该将字符串错误转换为 AppError (1ms)
- ✅ defaultErrorMapper 未知错误处理 应该将数字错误转换为 AppError (0ms)
- ✅ defaultErrorMapper 未知错误处理 应该将对象错误转换为 AppError (0ms)
- ✅ defaultErrorMapper 未知错误处理 应该将 null 转换为 AppError (1ms)
- ✅ defaultErrorMapper 未知错误处理 应该将 undefined 转换为 AppError (1ms)
- ✅ defaultErrorMapper 错误类型识别 应该正确识别 AppError (0ms)
- ✅ defaultErrorMapper 错误类型识别 应该正确识别 DOMException AbortError (0ms)
- ✅ defaultErrorMapper 错误类型识别 应该正确识别其他 DOMException (0ms)
- ✅ defaultErrorMapper 实际使用场景 应该用于 safeAsync 的错误映射 (1ms)
- ✅ defaultErrorMapper 实际使用场景 应该处理 AbortController 的取消 (0ms)

### tests/AppError.spec.ts

- ✅ AppError 基本功能 应该创建 AppError 实例 (0ms)
- ✅ AppError 基本功能 应该设置错误消息 (0ms)
- ✅ AppError 基本功能 应该设置错误代码 (0ms)
- ✅ AppError 基本功能 应该设置错误名称 (0ms)
- ✅ AppError cause 属性 应该支持 cause 选项 (0ms)
- ✅ AppError cause 属性 应该支持非 Error 类型的 cause (0ms)
- ✅ AppError cause 属性 应该支持对象类型的 cause (1ms)
- ✅ AppError cause 属性 应该在没有 cause 时返回 undefined (0ms)
- ✅ AppError meta 属性 应该支持 meta 选项 (0ms)
- ✅ AppError meta 属性 应该支持空的 meta 对象 (0ms)
- ✅ AppError meta 属性 应该在没有 meta 时返回 undefined (0ms)
- ✅ AppError meta 属性 应该支持复杂的 meta 对象 (0ms)
- ✅ AppError 组合选项 应该同时支持 cause 和 meta (0ms)
- ✅ AppError 错误代码 应该支持所有预定义的错误代码 (0ms)
- ✅ AppError 继承行为 应该继承 Error 的所有属性 (4ms)
- ✅ AppError 继承行为 应该可以被 instanceof 检查 (0ms)
- ✅ AppError 实际使用场景 应该用于包装网络错误 (1ms)
- ✅ AppError 实际使用场景 应该用于验证错误 (0ms)
- ✅ AppError 实际使用场景 应该用于超时错误 (0ms)

### tests/asyncTry.spec.ts

- ✅ asyncTry 成功情况 应该返回 [null, result] 当 Promise 成功时 (0ms)
- ✅ asyncTry 成功情况 应该处理字符串结果 (0ms)
- ✅ asyncTry 成功情况 应该处理对象结果 (0ms)
- ✅ asyncTry 成功情况 应该处理 null 结果 (0ms)
- ✅ asyncTry 成功情况 应该处理 undefined 结果 (0ms)
- ✅ asyncTry 成功情况 应该处理数组结果 (0ms)
- ✅ asyncTry 错误情况 应该返回 [error, null] 当 Promise 失败时 (1ms)
- ✅ asyncTry 错误情况 应该处理字符串错误 (0ms)
- ✅ asyncTry 错误情况 应该处理数字错误 (0ms)
- ✅ asyncTry 错误情况 应该处理对象错误 (0ms)
- ✅ asyncTry 错误情况 应该处理 null 错误 (0ms)
- ✅ asyncTry 类型泛型 应该支持自定义错误类型 (0ms)
- ✅ asyncTry 类型泛型 应该支持不同的返回类型 (1ms)
- ✅ asyncTry 异步行为 应该等待 Promise 完成 (10ms)
- ✅ asyncTry 异步行为 应该正确处理延迟的错误 (11ms)

### tests/abort.spec.ts

- ✅ mergeAbortSignals 基本功能 应该合并多个 AbortSignal (1ms)
- ✅ mergeAbortSignals 基本功能 应该处理单个 signal (0ms)
- ✅ mergeAbortSignals 基本功能 应该处理空数组 (0ms)
- ✅ mergeAbortSignals 取消行为 应该在任一 signal 取消时取消合并的 signal (0ms)
- ✅ mergeAbortSignals 取消行为 应该在所有 signal 取消时保持取消状态 (0ms)
- ✅ mergeAbortSignals 取消行为 应该处理已取消的 signal (0ms)
- ✅ mergeAbortSignals 取消行为 应该处理所有 signal 都已取消的情况 (0ms)
- ✅ mergeAbortSignals 事件监听 应该触发 abort 事件 (0ms)
- ✅ mergeAbortSignals 事件监听 应该在任一 signal 取消时触发事件 (1ms)
- ✅ mergeAbortSignals 事件监听 应该支持多个监听器 (0ms)
- ✅ mergeAbortSignals 多个 signal 场景 应该处理三个或更多 signal (0ms)
- ✅ mergeAbortSignals 多个 signal 场景 应该正确处理后续取消 (0ms)
- ✅ mergeAbortSignals 清理行为 应该在 signal 取消后移除监听器 (0ms)
- ✅ mergeAbortSignals 边界情况 应该处理大量 signal (1ms)
- ✅ mergeAbortSignals 边界情况 应该处理同一个 signal 多次传入 (0ms)
- ✅ mergeAbortSignals 边界情况 应该正确处理已取消的 signal 在后续取消时 (0ms)

