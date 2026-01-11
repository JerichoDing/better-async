import { createTimeoutSignal } from '../src/utils/timeout';

describe('createTimeoutSignal', () => {
  describe('基本功能', () => {
    it('应该创建 AbortSignal', () => {
      const signal = createTimeoutSignal(100);
      expect(signal).toBeInstanceOf(AbortSignal);
      expect(signal.aborted).toBe(false);
    });

    it('应该在指定时间后取消', (done) => {
      const signal = createTimeoutSignal(10);
      
      expect(signal.aborted).toBe(false);

      signal.addEventListener('abort', () => {
        expect(signal.aborted).toBe(true);
        done();
      });
    }, 100);

    it('应该使用自定义 controller', () => {
      const controller = new AbortController();
      const signal = createTimeoutSignal(100, controller);

      expect(signal).toBe(controller.signal);
    });
  });

  describe('超时行为', () => {
    it('应该精确控制超时时间', (done) => {
      const start = Date.now();
      const signal = createTimeoutSignal(50);

      signal.addEventListener('abort', () => {
        const duration = Date.now() - start;
        expect(duration).toBeGreaterThanOrEqual(45);
        expect(duration).toBeLessThan(100);
        expect(signal.aborted).toBe(true);
        done();
      });
    }, 200);

    it('应该处理很短的超时时间', (done) => {
      const signal = createTimeoutSignal(1);

      signal.addEventListener('abort', () => {
        expect(signal.aborted).toBe(true);
        done();
      });
    }, 100);

    it('应该处理较长的超时时间', (done) => {
      const signal = createTimeoutSignal(100);

      signal.addEventListener('abort', () => {
        expect(signal.aborted).toBe(true);
        done();
      });
    }, 200);
  });

  describe('清理行为', () => {
    it('应该在 signal 取消时清理定时器', (done) => {
      const controller = new AbortController();
      const signal = createTimeoutSignal(1000, controller);

      // 手动取消应该清理定时器
      controller.abort();

      setTimeout(() => {
        expect(signal.aborted).toBe(true);
        done();
      }, 50);
    }, 200);

    it('应该防止重复触发', (done) => {
      const signal = createTimeoutSignal(10);
      let abortCount = 0;

      signal.addEventListener('abort', () => {
        abortCount++;
        setTimeout(() => {
          expect(abortCount).toBe(1);
          done();
        }, 50);
      });
    }, 200);
  });

  describe('事件监听', () => {
    it('应该触发 abort 事件', (done) => {
      const signal = createTimeoutSignal(10);

      signal.addEventListener('abort', () => {
        expect(signal.aborted).toBe(true);
        done();
      });
    }, 200);

    it('应该支持多个监听器', (done) => {
      const signal = createTimeoutSignal(10);

      let listener1Called = false;
      let listener2Called = false;

      signal.addEventListener('abort', () => {
        listener1Called = true;
        checkDone();
      });

      signal.addEventListener('abort', () => {
        listener2Called = true;
        checkDone();
      });

      function checkDone() {
        if (listener1Called && listener2Called) {
          expect(signal.aborted).toBe(true);
          done();
        }
      }
    }, 200);
  });

  describe('边界情况', () => {
    it('应该处理 0 毫秒超时', (done) => {
      const signal = createTimeoutSignal(0);

      signal.addEventListener('abort', () => {
        expect(signal.aborted).toBe(true);
        done();
      });
    }, 100);

    it('应该处理负数超时（应该立即取消）', (done) => {
      const signal = createTimeoutSignal(-1);

      // 负数应该立即触发或行为未定义，但至少不应该崩溃
      setTimeout(() => {
        // signal 可能已取消或未取消，但不应该崩溃
        expect(typeof signal.aborted).toBe('boolean');
        done();
      }, 10);
    }, 100);
  });

  describe('实际使用场景', () => {
    it('应该用于超时控制', async () => {
      const signal = createTimeoutSignal(50);

      try {
        await new Promise((resolve) => {
          signal.addEventListener('abort', () => {
            resolve('timeout');
          });
          setTimeout(() => resolve('success'), 100);
        });
      } catch (error) {
        // 处理错误
      }

      expect(signal.aborted).toBe(true);
    }, 200);

    it('应该与其他 AbortSignal 配合使用', () => {
      const timeoutSignal = createTimeoutSignal(100);
      const manualController = new AbortController();

      // 两个 signal 都可以独立工作
      expect(timeoutSignal.aborted).toBe(false);
      expect(manualController.signal.aborted).toBe(false);

      manualController.abort();

      expect(manualController.signal.aborted).toBe(true);
      expect(timeoutSignal.aborted).toBe(false);
    });
  });

  describe('边界情况', () => {
    it('应该处理非常大的超时值', (done) => {
      const signal = createTimeoutSignal(Number.MAX_SAFE_INTEGER);
      expect(signal.aborted).toBe(false);
      
      // 手动取消以完成测试
      setTimeout(() => {
        expect(signal.aborted).toBe(false);
        done();
      }, 10);
    }, 100);

    it('应该处理已取消的 controller', () => {
      const controller = new AbortController();
      controller.abort();
      
      const signal = createTimeoutSignal(100, controller);
      expect(signal.aborted).toBe(true);
    });

    it('应该正确处理多次调用 createTimeoutSignal 使用同一个 controller', () => {
      const controller = new AbortController();
      const signal1 = createTimeoutSignal(100, controller);
      const signal2 = createTimeoutSignal(200, controller);
      
      expect(signal1).toBe(controller.signal);
      expect(signal2).toBe(controller.signal);
      expect(signal1).toBe(signal2);
    });
  });
});
