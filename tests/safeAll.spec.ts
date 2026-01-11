import { safeAll } from '../src/core/safeAll';

describe('safeAll', () => {
  describe('成功情况', () => {
    it('应该返回所有结果当所有 Promise 成功时', async () => {
      const [error, results] = await safeAll([
        Promise.resolve(1),
        Promise.resolve(2),
        Promise.resolve(3),
      ]);

      expect(error).toBeNull();
      expect(results).toEqual([1, 2, 3]);
    });

    it('应该处理函数数组', async () => {
      const [error, results] = await safeAll([
        () => Promise.resolve('a'),
        () => Promise.resolve('b'),
        () => Promise.resolve('c'),
      ]);

      expect(error).toBeNull();
      expect(results).toEqual(['a', 'b', 'c']);
    });

    it('应该混合处理 Promise 和函数', async () => {
      const [error, results] = await safeAll([
        Promise.resolve(1),
        () => Promise.resolve(2),
        Promise.resolve(3),
      ]);

      expect(error).toBeNull();
      expect(results).toEqual([1, 2, 3]);
    });

    it('应该处理空数组', async () => {
      const [error, results] = await safeAll([]);

      expect(error).toBeNull();
      expect(results).toEqual([]);
    });

    it('应该处理单个 Promise', async () => {
      const [error, results] = await safeAll([Promise.resolve(42)]);

      expect(error).toBeNull();
      expect(results).toEqual([42]);
    });

    it('应该处理不同类型的返回值', async () => {
      const [error, results] = await safeAll([
        Promise.resolve(1),
        Promise.resolve('string'),
        Promise.resolve({ id: 3 }),
        Promise.resolve(null),
      ]);

      expect(error).toBeNull();
      expect(results).toEqual([1, 'string', { id: 3 }, null]);
    });
  });

  describe('错误情况', () => {
    it('应该返回第一个错误', async () => {
      const testError = new Error('first error');
      const [error, results] = await safeAll([
        Promise.resolve(1),
        Promise.reject(testError),
        Promise.resolve(3),
      ]);

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('first error');
      expect(results).toBeNull();
    });

    it('应该将非 Error 对象转换为 Error', async () => {
      const [error, results] = await safeAll([
        Promise.resolve(1),
        Promise.reject('string error'),
      ]);

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('string error');
      expect(results).toBeNull();
    });

    it('应该将数字错误转换为 Error', async () => {
      const [error, results] = await safeAll([
        Promise.reject(404),
      ]);

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('404');
      expect(results).toBeNull();
    });

    it('应该将 null 错误转换为 Error', async () => {
      const [error, results] = await safeAll([
        Promise.reject(null),
      ]);

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('null');
      expect(results).toBeNull();
    });

    it('应该处理函数中的错误', async () => {
      const testError = new Error('function error');
      const [error, results] = await safeAll([
        () => Promise.resolve(1),
        () => Promise.reject(testError),
        () => Promise.resolve(3),
      ]);

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('function error');
      expect(results).toBeNull();
    });

    it('应该处理所有 Promise 都失败的情况', async () => {
      const [error, results] = await safeAll([
        Promise.reject(new Error('error 1')),
        Promise.reject(new Error('error 2')),
      ]);

      expect(error).toBeInstanceOf(Error);
      expect(results).toBeNull();
    });
  });

  describe('异步行为', () => {
    it('应该等待所有 Promise 完成', async () => {
      const promises = [
        new Promise<number>(resolve => setTimeout(() => resolve(1), 10)),
        new Promise<number>(resolve => setTimeout(() => resolve(2), 20)),
        new Promise<number>(resolve => setTimeout(() => resolve(3), 30)),
      ];

      const start = Date.now();
      const [error, results] = await safeAll(promises);
      const duration = Date.now() - start;

      expect(error).toBeNull();
      expect(results).toEqual([1, 2, 3]);
      expect(duration).toBeGreaterThanOrEqual(25);
    });

    it('应该在第一个错误时立即返回', async () => {
      const promises = [
        new Promise<number>(resolve => setTimeout(() => resolve(1), 50)),
        new Promise<number>((_, reject) => 
          setTimeout(() => reject(new Error('fast error')), 10)
        ),
        new Promise<number>(resolve => setTimeout(() => resolve(3), 50)),
      ];

      const start = Date.now();
      const [error, results] = await safeAll(promises);
      const duration = Date.now() - start;

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('fast error');
      expect(results).toBeNull();
      // 应该快速失败，不需要等待所有 Promise
      expect(duration).toBeLessThan(100);
    });
  });

  describe('函数执行', () => {
    it('应该延迟执行函数直到需要时', async () => {
      let executed = false;
      const fn = () => {
        executed = true;
        return Promise.resolve(1);
      };

      const promise = safeAll([fn]);
      expect(executed).toBe(false);

      await promise;
      expect(executed).toBe(true);
    });

    it('应该为每个函数创建新的 Promise', async () => {
      let callCount = 0;
      const fn = () => {
        callCount++;
        return Promise.resolve(callCount);
      };

      const [error, results] = await safeAll([fn, fn, fn]);

      expect(error).toBeNull();
      expect(results).toEqual([1, 2, 3]);
      expect(callCount).toBe(3);
    });
  });

  describe('边界情况', () => {
    it('应该处理混合类型的返回值', async () => {
      const [error, results] = await safeAll([
        () => Promise.resolve(1),
        Promise.resolve('string'),
        () => Promise.resolve(true),
        Promise.resolve(null),
        () => Promise.resolve(undefined),
      ]);

      expect(error).toBeNull();
      expect(results).toEqual([1, 'string', true, null, undefined]);
    });

    it('应该处理 Promise 立即拒绝的情况', async () => {
      const [error, results] = await safeAll([
        Promise.reject(new Error('immediate error')),
      ]);

      expect(error).toBeInstanceOf(Error);
      expect(results).toBeNull();
    });

    it('应该处理函数立即抛出错误的情况', async () => {
      const [error, results] = await safeAll([
        () => {
          throw new Error('sync error');
        },
      ]);

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('sync error');
      expect(results).toBeNull();
    });

    it('应该处理对象错误', async () => {
      const errorObj = { code: 500, message: 'Server error' };
      const [error, results] = await safeAll([
        Promise.reject(errorObj),
      ]);

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('[object Object]');
      expect(results).toBeNull();
    });

    it('应该处理布尔值错误', async () => {
      const [error, results] = await safeAll([
        Promise.reject(false),
      ]);

      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('false');
      expect(results).toBeNull();
    });
  });
});
