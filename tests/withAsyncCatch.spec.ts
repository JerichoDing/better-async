import { withAsyncCatch } from '../src/core/withAsyncCatch';

describe('withAsyncCatch', () => {
  describe('成功情况', () => {
    it('应该返回函数结果当没有错误时', async () => {
      const fn = async (x: number) => x * 2;
      const safeFn = withAsyncCatch(fn);

      const result = await safeFn(5);
      expect(result).toBe(10);
    });

    it('应该支持多个参数', async () => {
      const fn = async (a: number, b: number, c: string) => `${a + b}-${c}`;
      const safeFn = withAsyncCatch(fn);

      const result = await safeFn(1, 2, 'test');
      expect(result).toBe('3-test');
    });

    it('应该支持无参数函数', async () => {
      const fn = async () => 'success';
      const safeFn = withAsyncCatch(fn);

      const result = await safeFn();
      expect(result).toBe('success');
    });

    it('应该保持原始函数的类型', async () => {
      const fn = async (id: number) => ({ id, name: `user${id}` });
      const safeFn = withAsyncCatch(fn);

      const result = await safeFn(1);
      expect(result).toEqual({ id: 1, name: 'user1' });
    });
  });

  describe('错误处理', () => {
    it('应该返回 undefined 当发生错误时', async () => {
      const fn = async () => {
        throw new Error('test error');
      };
      const safeFn = withAsyncCatch(fn);

      const result = await safeFn();
      expect(result).toBeUndefined();
    });

    it('应该调用 onError 回调', async () => {
      const onError = jest.fn();
      const testError = new Error('test error');
      const fn = async () => {
        throw testError;
      };
      const safeFn = withAsyncCatch(fn, onError);

      await safeFn();

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(testError);
    });

    it('应该处理不同类型的错误', async () => {
      const onError = jest.fn();
      const fn = async () => {
        throw 'string error';
      };
      const safeFn = withAsyncCatch(fn, onError);

      await safeFn();

      expect(onError).toHaveBeenCalledWith('string error');
      expect(await safeFn()).toBeUndefined();
    });

    it('应该在没有 onError 时静默处理错误', async () => {
      const fn = async () => {
        throw new Error('test');
      };
      const safeFn = withAsyncCatch(fn);

      const result = await safeFn();
      expect(result).toBeUndefined();
    });

    it('应该处理多个错误', async () => {
      const onError = jest.fn();
      let shouldThrow = true;
      const fn = async () => {
        if (shouldThrow) {
          shouldThrow = false;
          throw new Error('error 1');
        }
        throw new Error('error 2');
      };
      const safeFn = withAsyncCatch(fn, onError);

      await safeFn();
      await safeFn();

      expect(onError).toHaveBeenCalledTimes(2);
    });
  });

  describe('参数传递', () => {
    it('应该正确传递所有参数', async () => {
      const fn = jest.fn(async (a: number, b: string, c: boolean) => {
        return `${a}-${b}-${c}`;
      });
      const safeFn = withAsyncCatch(fn);

      await safeFn(1, 'test', true);

      expect(fn).toHaveBeenCalledWith(1, 'test', true);
    });

    it('应该支持复杂参数', async () => {
      const fn = async (obj: { id: number }, arr: number[]) => {
        return { ...obj, items: arr };
      };
      const safeFn = withAsyncCatch(fn);

      const result = await safeFn({ id: 1 }, [2, 3]);
      expect(result).toEqual({ id: 1, items: [2, 3] });
    });
  });

  describe('返回值类型', () => {
    it('应该返回 R | undefined', async () => {
      const fn = async (): Promise<string> => 'result';
      const safeFn = withAsyncCatch(fn);

      const result = await safeFn();
      expect(typeof result).toBe('string');
    });

    it('应该返回 undefined 当错误时', async () => {
      const fn = async (): Promise<string> => {
        throw new Error('error');
      };
      const safeFn = withAsyncCatch(fn);

      const result = await safeFn();
      expect(result).toBeUndefined();
    });
  });

  describe('实际使用场景', () => {
    it('应该用于 API 调用', async () => {
      const fetchData = async (url: string) => {
        if (url === 'invalid') {
          throw new Error('Invalid URL');
        }
        return { data: 'result' };
      };

      const onError = jest.fn();
      const safeFetch = withAsyncCatch(fetchData, onError);

      const result1 = await safeFetch('valid');
      expect(result1).toEqual({ data: 'result' });
      expect(onError).not.toHaveBeenCalled();

      const result2 = await safeFetch('invalid');
      expect(result2).toBeUndefined();
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect((onError.mock.calls[0][0] as Error).message).toBe('Invalid URL');
    });

    it('应该用于数据库操作', async () => {
      const saveUser = async (id: number, name: string) => {
        if (id < 0) {
          throw new Error('Invalid ID');
        }
        return { id, name, saved: true };
      };

      const safeSave = withAsyncCatch(saveUser);

      const result1 = await safeSave(1, 'Alice');
      expect(result1).toEqual({ id: 1, name: 'Alice', saved: true });

      const result2 = await safeSave(-1, 'Bob');
      expect(result2).toBeUndefined();
    });
  });
});
