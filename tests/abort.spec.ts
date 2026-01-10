import { describe, it, expect } from 'vitest';
import { withAbort, createAbortController } from '../src';

describe('withAbort', () => {
  it('应该成功执行未取消的操作', async () => {
    const controller = createAbortController();
    const result = await withAbort(async () => {
      return 'success';
    }, controller.signal);

    expect(result).toBe('success');
  });

  it('应该在取消时抛出错误', async () => {
    const controller = createAbortController();
    const promise = withAbort(async (signal) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (signal.aborted) {
        throw new Error('Aborted');
      }
      return 'success';
    }, controller.signal);

    controller.abort();

    await expect(promise).rejects.toThrow('Operation aborted');
  });

  it('应该处理已取消的信号', async () => {
    const controller = createAbortController();
    controller.abort();

    await expect(
      withAbort(async () => {
        return 'success';
      }, controller.signal)
    ).rejects.toThrow('Operation aborted');
  });
});

describe('createAbortController', () => {
  it('应该创建新的 AbortController', () => {
    const controller = createAbortController();
    expect(controller).toBeInstanceOf(AbortController);
    expect(controller.signal.aborted).toBe(false);
  });

  it('应该能够取消操作', () => {
    const controller = createAbortController();
    controller.abort();
    expect(controller.signal.aborted).toBe(true);
  });
});
