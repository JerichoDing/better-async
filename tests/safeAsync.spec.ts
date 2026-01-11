import { safeAsync } from '../src/core/safeAsync';
import { AppError } from '../src/error/AppError';
import { ErrorCode } from '../src/error/ErrorCode';

describe('safeAsync', () => {
  describe('基本功能', () => {
    it('应该成功返回结果', async () => {
      const result = await safeAsync(async () => 123);
      expect(result).toBe(123);
    });

    it('应该处理异步函数', async () => {
      const result = await safeAsync(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'success';
      });
      expect(result).toBe('success');
    });

    it('应该传递 signal 给函数', async () => {
      const controller = new AbortController();
      const signal = controller.signal;
      
      const result = await safeAsync(
        async ({ signal: receivedSignal }) => {
          expect(receivedSignal).toBe(signal);
          return 'success';
        },
        { signal }
      );
      
      expect(result).toBe('success');
    });
  });

  describe('超时功能', () => {
    it('应该在超时时抛出错误', async () => {
      await expect(
        safeAsync(
          () => new Promise(resolve => setTimeout(resolve, 100)),
          { timeout: 10 }
        )
      ).rejects.toThrow();
    });

    it('应该在超时时间内成功执行', async () => {
      const result = await safeAsync(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'success';
        },
        { timeout: 100 }
      );
      expect(result).toBe('success');
    });

    it('超时应该创建 AbortSignal', async () => {
      let receivedSignal: AbortSignal | undefined;
      
      try {
        await safeAsync(
          async ({ signal }) => {
            receivedSignal = signal;
            await new Promise(resolve => setTimeout(resolve, 100));
            return 'success';
          },
          { timeout: 10 }
        );
      } catch (error) {
        // 预期会超时
      }
      
      expect(receivedSignal).toBeDefined();
      expect(receivedSignal?.aborted).toBe(true);
    });
  });

  describe('取消功能', () => {
    it('应该支持 AbortSignal 取消', async () => {
      const controller = new AbortController();
      
      const promise = safeAsync(
        async ({ signal }) => {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
          }
          return 'success';
        },
        { signal: controller.signal }
      );

      controller.abort();

      await expect(promise).rejects.toThrow();
    });

    it('应该合并多个 signal', async () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      
      let receivedSignal: AbortSignal | undefined;
      
      try {
        await safeAsync(
          async ({ signal }) => {
            receivedSignal = signal;
            await new Promise(resolve => setTimeout(resolve, 100));
            return 'success';
          },
          { 
            signal: controller1.signal,
            timeout: 10 
          }
        );
      } catch (error) {
        // 预期会超时
      }
      
      expect(receivedSignal).toBeDefined();
    });
  });

  describe('重试功能', () => {
    it('应该重试指定次数', async () => {
      let attempts = 0;
      
      const result = await safeAsync(
        async () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('fail');
          }
          return 'success';
        },
        { retry: 3 }
      );
      
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('应该在重试次数用完后抛出错误', async () => {
      let attempts = 0;
      
      await expect(
        safeAsync(
          async () => {
            attempts++;
            throw new Error('fail');
          },
          { retry: 2 }
        )
      ).rejects.toThrow();
      
      expect(attempts).toBe(3); // 初始尝试 + 2次重试
    });

    it('重试应该使用 mapError 转换错误', async () => {
      const mapError = jest.fn((err: unknown) => {
        return new AppError(ErrorCode.UNKNOWN, 'Mapped error', { cause: err });
      });
      
      await expect(
        safeAsync(
          async () => {
            throw new Error('original error');
          },
          { retry: 1, mapError }
        )
      ).rejects.toThrow(AppError);
      
      expect(mapError).toHaveBeenCalledTimes(2); // 每次失败都会调用
    });
  });

  describe('回退值功能', () => {
    it('应该在失败时返回回退值', async () => {
      const result = await safeAsync(
        async () => {
          throw new Error('fail');
        },
        { fallback: 42 }
      );
      expect(result).toBe(42);
    });

    it('回退值应该支持 undefined', async () => {
      const result = await safeAsync(
        async () => {
          throw new Error('fail');
        },
        { fallback: undefined }
      );
      expect(result).toBeUndefined();
    });

    it('回退值应该支持 null', async () => {
      const result = await safeAsync(
        async () => {
          throw new Error('fail');
        },
        { fallback: null }
      );
      expect(result).toBeNull();
    });

    it('回退值应该在重试失败后返回', async () => {
      const result = await safeAsync(
        async () => {
          throw new Error('fail');
        },
        { retry: 2, fallback: 'default' }
      );
      expect(result).toBe('default');
    });
  });

  describe('错误处理', () => {
    it('应该使用默认错误映射器', async () => {
      await expect(
        safeAsync(async () => {
          throw new Error('test error');
        })
      ).rejects.toThrow(AppError);
    });

    it('应该使用自定义错误映射器', async () => {
      const customError = new AppError(ErrorCode.VALIDATION_ERROR, 'Custom error');
      const mapError = jest.fn(() => customError);
      
      await expect(
        safeAsync(
          async () => {
            throw new Error('original');
          },
          { mapError }
        )
      ).rejects.toThrow(customError);
      
      expect(mapError).toHaveBeenCalled();
    });

    it('应该调用 onError 回调', async () => {
      const onError = jest.fn();
      
      await safeAsync(
        async () => {
          throw new Error('fail');
        },
        { fallback: 'default', onError }
      );
      
      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toBeInstanceOf(AppError);
    });

    it('onError 应该在抛出错误前调用', async () => {
      const onError = jest.fn();
      
      await expect(
        safeAsync(
          async () => {
            throw new Error('fail');
          },
          { onError }
        )
      ).rejects.toThrow();
      
      expect(onError).toHaveBeenCalled();
    });

    it('应该正确处理 AppError', async () => {
      const appError = new AppError(ErrorCode.NETWORK_ERROR, 'Network error');
      
      await expect(
        safeAsync(async () => {
          throw appError;
        })
      ).rejects.toThrow(appError);
    });

    it('应该正确处理 DOMException AbortError', async () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      
      await expect(
        safeAsync(async () => {
          throw abortError;
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe('组合功能', () => {
    it('应该同时支持超时和重试', async () => {
      let attempts = 0;
      
      await expect(
        safeAsync(
          async () => {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 100));
            return 'success';
          },
          { timeout: 10, retry: 2 }
        )
      ).rejects.toThrow();
      
      expect(attempts).toBe(3); // 初始 + 2次重试
    });

    it('应该同时支持超时和回退值', async () => {
      const result = await safeAsync(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return 'success';
        },
        { timeout: 10, fallback: 'timeout' }
      );
      
      expect(result).toBe('timeout');
    });

    it('应该同时支持取消和超时', async () => {
      const controller = new AbortController();
      
      const promise = safeAsync(
        async ({ signal }) => {
          await new Promise(resolve => setTimeout(resolve, 100));
          if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
          }
          return 'success';
        },
        { signal: controller.signal, timeout: 50 }
      );

      controller.abort();

      await expect(promise).rejects.toThrow();
    });
  });

  describe('边界情况', () => {
    it('应该处理没有 signal 和 timeout 的情况', async () => {
      const result = await safeAsync(async () => {
        return 'success';
      });
      expect(result).toBe('success');
    });

    it('应该处理只有 signal 没有 timeout 的情况', async () => {
      const controller = new AbortController();
      const result = await safeAsync(
        async ({ signal }) => {
          expect(signal).toBe(controller.signal);
          return 'success';
        },
        { signal: controller.signal }
      );
      expect(result).toBe('success');
    });

    it('应该处理只有 timeout 没有 signal 的情况', async () => {
      const result = await safeAsync(
        async ({ signal }) => {
          expect(signal).toBeDefined();
          return 'success';
        },
        { timeout: 100 }
      );
      expect(result).toBe('success');
    });

    it('应该处理 retry 为 0 的情况', async () => {
      let attempts = 0;
      await expect(
        safeAsync(
          async () => {
            attempts++;
            throw new Error('fail');
          },
          { retry: 0 }
        )
      ).rejects.toThrow();
      
      expect(attempts).toBe(1);
    });

    it('应该处理函数不使用 signal 的情况', async () => {
      const result = await safeAsync(
        async () => {
          return 'success';
        },
        { timeout: 100, signal: new AbortController().signal }
      );
      expect(result).toBe('success');
    });

    it('应该处理 mapError 返回不同的错误', async () => {
      const mapError = jest.fn((err: unknown) => {
        return new AppError(ErrorCode.NETWORK_ERROR, 'Network failed', { cause: err });
      });
      
      await expect(
        safeAsync(
          async () => {
            throw new Error('original');
          },
          { mapError }
        )
      ).rejects.toThrow(AppError);
      
      expect(mapError).toHaveBeenCalled();
    });
  });

  describe('错误映射场景', () => {
    it('应该正确处理各种类型的错误', async () => {
      const errors = [
        new Error('Error instance'),
        'string error',
        404,
        null,
        undefined,
        { code: 500, message: 'Custom error' },
      ];

      for (const err of errors) {
        await expect(
          safeAsync(async () => {
            throw err;
          })
        ).rejects.toThrow(AppError);
      }
    });
  });
});
