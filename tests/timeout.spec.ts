import { describe, it, expect, vi } from 'vitest';
import { withTimeout, delay } from '../src';

describe('withTimeout', () => {
  it('应该在超时时间内成功执行', async () => {
    const result = await withTimeout(async () => {
      await delay(50);
      return 'success';
    }, 100);

    expect(result).toBe('success');
  });

  it('应该在超时时抛出错误', async () => {
    await expect(
      withTimeout(async () => {
        await delay(200);
        return 'success';
      }, 100)
    ).rejects.toThrow('Operation timed out');
  });

  it('应该使用自定义超时消息', async () => {
    await expect(
      withTimeout(
        async () => {
          await delay(200);
          return 'success';
        },
        100,
        'Custom timeout message'
      )
    ).rejects.toThrow('Custom timeout message');
  });
});

describe('delay', () => {
  it('应该延迟指定时间', async () => {
    const start = Date.now();
    await delay(100);
    const end = Date.now();

    expect(end - start).toBeGreaterThanOrEqual(90);
    expect(end - start).toBeLessThan(150);
  });
});
