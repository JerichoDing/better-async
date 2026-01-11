import { asyncTry } from '../src/core/asyncTry';

describe('asyncTry', () => {
  describe('成功情况', () => {
    it('应该返回 [null, result] 当 Promise 成功时', async () => {
      const [error, result] = await asyncTry(Promise.resolve(123));
      expect(error).toBeNull();
      expect(result).toBe(123);
    });

    it('应该处理字符串结果', async () => {
      const [error, result] = await asyncTry(Promise.resolve('success'));
      expect(error).toBeNull();
      expect(result).toBe('success');
    });

    it('应该处理对象结果', async () => {
      const data = { id: 1, name: 'test' };
      const [error, result] = await asyncTry(Promise.resolve(data));
      expect(error).toBeNull();
      expect(result).toEqual(data);
    });

    it('应该处理 null 结果', async () => {
      const [error, result] = await asyncTry(Promise.resolve(null));
      expect(error).toBeNull();
      expect(result).toBeNull();
    });

    it('应该处理 undefined 结果', async () => {
      const [error, result] = await asyncTry(Promise.resolve(undefined));
      expect(error).toBeNull();
      expect(result).toBeUndefined();
    });

    it('应该处理数组结果', async () => {
      const data = [1, 2, 3];
      const [error, result] = await asyncTry(Promise.resolve(data));
      expect(error).toBeNull();
      expect(result).toEqual(data);
    });
  });

  describe('错误情况', () => {
    it('应该返回 [error, null] 当 Promise 失败时', async () => {
      const testError = new Error('test error');
      const [error, result] = await asyncTry(Promise.reject(testError));
      expect(error).toBe(testError);
      expect(result).toBeNull();
    });

    it('应该处理字符串错误', async () => {
      const [error, result] = await asyncTry(Promise.reject('string error'));
      expect(error).toBe('string error');
      expect(result).toBeNull();
    });

    it('应该处理数字错误', async () => {
      const [error, result] = await asyncTry(Promise.reject(404));
      expect(error).toBe(404);
      expect(result).toBeNull();
    });

    it('应该处理对象错误', async () => {
      const errorObj = { code: 500, message: 'Server error' };
      const [error, result] = await asyncTry(Promise.reject(errorObj));
      expect(error).toEqual(errorObj);
      expect(result).toBeNull();
    });

    it('应该处理 null 错误', async () => {
      const [error, result] = await asyncTry(Promise.reject(null));
      expect(error).toBeNull();
      expect(result).toBeNull();
    });
  });

  describe('类型泛型', () => {
    it('应该支持自定义错误类型', async () => {
      interface CustomError {
        code: number;
        message: string;
      }

      const customError: CustomError = { code: 500, message: 'Error' };
      const [error, result] = await asyncTry<number, CustomError>(
        Promise.reject(customError)
      );
      
      expect(error).toEqual(customError);
      expect(result).toBeNull();
    });

    it('应该支持不同的返回类型', async () => {
      const [error, result] = await asyncTry<string>(
        Promise.resolve('test')
      );
      
      expect(error).toBeNull();
      expect(result).toBe('test');
    });
  });

  describe('异步行为', () => {
    it('应该等待 Promise 完成', async () => {
      let resolved = false;
      const promise = new Promise<string>(resolve => {
        setTimeout(() => {
          resolved = true;
          resolve('delayed');
        }, 10);
      });

      const [error, result] = await asyncTry(promise);
      
      expect(resolved).toBe(true);
      expect(error).toBeNull();
      expect(result).toBe('delayed');
    });

    it('应该正确处理延迟的错误', async () => {
      let rejected = false;
      const promise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          rejected = true;
          reject(new Error('delayed error'));
        }, 10);
      });

      const [error, result] = await asyncTry(promise);
      
      expect(rejected).toBe(true);
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('delayed error');
      expect(result).toBeNull();
    });
  });
});
