# 测试说明

本项目使用 Jest 作为测试框架。

## 运行测试

### 安装依赖

```bash
npm install
```

### 运行所有测试

```bash
npm test
```

### 运行测试（监听模式）

```bash
npm run test:watch
```

### 运行测试并生成覆盖率报告

```bash
npm run test:coverage
```

### 查看测试结果报告

```bash
npm run test:result
```

## 测试结果报告

每次运行 Jest 测试时，测试结果会自动保存到 `tests/test-result.md` 文件中。

### 报告内容

报告包含以下信息：

1. **测试摘要** - 通过、失败、跳过的测试数量统计
2. **失败的测试** - 集中显示所有失败的测试，包括：
   - 测试名称和文件路径
   - 错误信息和堆栈跟踪
   - 执行时间
   - 测试套件信息
3. **通过的测试** - 按文件分组的通过测试列表
4. **跳过的测试** - 所有跳过的测试列表
5. **修复建议** - 针对失败测试的修复建议和快速定位信息

### 报告特点

- ✅ **失败测试集中显示** - 所有失败的测试都在报告顶部，方便快速定位问题
- 📝 **详细的错误信息** - 包含完整的错误消息和堆栈跟踪
- 🔍 **快速定位** - 列出所有失败的文件，方便快速找到问题所在
- 💡 **修复建议** - 提供调试命令和修复建议

### 使用场景

这个报告特别适合：

- **AI 辅助调试** - AI 可以读取报告，快速了解哪些测试失败，并针对性修复
- **CI/CD 集成** - 可以将报告作为构建产物保存
- **问题追踪** - 方便记录和追踪测试问题

## 覆盖率报告

运行 `npm run test:coverage` 后，覆盖率报告会生成在 `coverage/` 目录下：

- **文本报告**: 在终端输出
- **HTML 报告**: `coverage/index.html` - 可以在浏览器中打开查看详细报告
- **LCOV 报告**: `coverage/lcov.info` - 用于 CI/CD 集成
- **JSON 摘要**: `coverage/coverage-summary.json` - 机器可读的覆盖率数据

## 覆盖率阈值

项目配置了以下覆盖率阈值（在 `jest.config.js` 中）：

- **branches**: 80%
- **functions**: 80%
- **lines**: 80%
- **statements**: 80%

如果覆盖率低于这些阈值，测试将失败。

## 测试文件结构

所有测试文件位于 `tests/` 目录下，命名格式为 `*.spec.ts`：

- `safeAsync.spec.ts` - safeAsync 函数的测试
- `asyncTry.spec.ts` - asyncTry 函数的测试
- `safeAll.spec.ts` - safeAll 函数的测试
- `withAsyncCatch.spec.ts` - withAsyncCatch 函数的测试
- `AppError.spec.ts` - AppError 类的测试
- `ErrorCode.spec.ts` - ErrorCode 常量的测试
- `errorMapper.spec.ts` - errorMapper 函数的测试
- `abort.spec.ts` - mergeAbortSignals 函数的测试
- `timeout.spec.ts` - createTimeoutSignal 函数的测试

## 测试覆盖的功能

### safeAsync
- ✅ 基本功能（成功执行、异步处理）
- ✅ 超时功能（超时检测、超时信号创建）
- ✅ 取消功能（AbortSignal 支持、信号合并）
- ✅ 重试功能（重试次数、错误映射）
- ✅ 回退值功能（各种类型的回退值）
- ✅ 错误处理（默认映射器、自定义映射器、错误回调）
- ✅ 组合功能（超时+重试、超时+回退、取消+超时）
- ✅ 边界情况（无 signal/timeout、单独 signal/timeout）

### asyncTry
- ✅ 成功情况（各种类型的返回值）
- ✅ 错误情况（各种类型的错误）
- ✅ 类型泛型支持
- ✅ 异步行为

### safeAll
- ✅ 成功情况（Promise 数组、函数数组、混合类型）
- ✅ 错误情况（第一个错误、错误转换）
- ✅ 异步行为（等待所有 Promise、快速失败）
- ✅ 函数执行（延迟执行、多次调用）
- ✅ 边界情况（混合类型返回值、立即拒绝、同步错误）

### withAsyncCatch
- ✅ 成功情况（各种参数组合）
- ✅ 错误处理（返回 undefined、错误回调）
- ✅ 参数传递（正确传递所有参数）
- ✅ 返回值类型
- ✅ 实际使用场景

### AppError
- ✅ 基本功能（创建实例、设置属性）
- ✅ cause 属性（各种类型的 cause）
- ✅ meta 属性（简单和复杂对象）
- ✅ 组合选项
- ✅ 错误代码支持
- ✅ 继承行为
- ✅ 实际使用场景

### ErrorCode
- ✅ 常量定义
- ✅ 类型定义
- ✅ 错误代码分类
- ✅ 不可变性
- ✅ 使用场景

### errorMapper
- ✅ AppError 处理
- ✅ AbortError 处理
- ✅ 未知错误处理（各种类型）
- ✅ 错误类型识别
- ✅ 实际使用场景

### mergeAbortSignals
- ✅ 基本功能（合并多个 signal）
- ✅ 取消行为（任一 signal 取消、所有 signal 取消）
- ✅ 事件监听（abort 事件、多个监听器）
- ✅ 多个 signal 场景
- ✅ 清理行为
- ✅ 边界情况（大量 signal、重复 signal）

### createTimeoutSignal
- ✅ 基本功能（创建 signal、超时取消）
- ✅ 超时行为（精确控制、各种时间长度）
- ✅ 清理行为（定时器清理、防止重复触发）
- ✅ 事件监听（abort 事件、多个监听器）
- ✅ 边界情况（0 毫秒、负数、大值）
- ✅ 实际使用场景

## 查看覆盖率

### 在终端查看

运行 `npm run test:coverage` 后，终端会显示类似以下的覆盖率报告：

```
-------------------|---------|----------|---------|---------|
File               | % Stmts | % Branch | % Funcs  | % Lines  |
-------------------|---------|----------|---------|---------|
All files           |    95.45 |    90.91 |   100   |    95.45 |
 core               |    95.45 |    90.91 |   100   |    95.45 |
  safeAsync.ts      |    95.45 |    90.91 |   100   |    95.45 |
-------------------|---------|----------|---------|---------|
```

### 在浏览器查看

打开 `coverage/index.html` 文件，可以查看：
- 每个文件的详细覆盖率
- 未覆盖的代码行（红色高亮）
- 部分覆盖的分支（黄色高亮）
- 完全覆盖的代码（绿色高亮）

## CI/CD 集成

覆盖率报告可以集成到 CI/CD 流程中：

```yaml
# GitHub Actions 示例
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```
