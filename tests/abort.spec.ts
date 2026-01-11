import { mergeAbortSignals } from '../src/utils/abort';

describe('mergeAbortSignals', () => {
  describe('基本功能', () => {
    it('应该合并多个 AbortSignal', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      
      const mergedSignal = mergeAbortSignals([
        controller1.signal,
        controller2.signal,
      ]);

      expect(mergedSignal).toBeInstanceOf(AbortSignal);
      expect(mergedSignal.aborted).toBe(false);
    });

    it('应该处理单个 signal', () => {
      const controller = new AbortController();
      const mergedSignal = mergeAbortSignals([controller.signal]);

      expect(mergedSignal).toBeInstanceOf(AbortSignal);
      expect(mergedSignal.aborted).toBe(false);
    });

    it('应该处理空数组', () => {
      const mergedSignal = mergeAbortSignals([]);

      expect(mergedSignal).toBeInstanceOf(AbortSignal);
      expect(mergedSignal.aborted).toBe(false);
    });
  });

  describe('取消行为', () => {
    it('应该在任一 signal 取消时取消合并的 signal', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      
      const mergedSignal = mergeAbortSignals([
        controller1.signal,
        controller2.signal,
      ]);

      controller1.abort();

      expect(mergedSignal.aborted).toBe(true);
    });

    it('应该在所有 signal 取消时保持取消状态', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      
      const mergedSignal = mergeAbortSignals([
        controller1.signal,
        controller2.signal,
      ]);

      controller1.abort();
      controller2.abort();

      expect(mergedSignal.aborted).toBe(true);
    });

    it('应该处理已取消的 signal', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      
      controller1.abort();

      const mergedSignal = mergeAbortSignals([
        controller1.signal,
        controller2.signal,
      ]);

      expect(mergedSignal.aborted).toBe(true);
    });

    it('应该处理所有 signal 都已取消的情况', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      
      controller1.abort();
      controller2.abort();

      const mergedSignal = mergeAbortSignals([
        controller1.signal,
        controller2.signal,
      ]);

      expect(mergedSignal.aborted).toBe(true);
    });
  });

  describe('事件监听', () => {
    it('应该触发 abort 事件', (done) => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      
      const mergedSignal = mergeAbortSignals([
        controller1.signal,
        controller2.signal,
      ]);

      mergedSignal.addEventListener('abort', () => {
        expect(mergedSignal.aborted).toBe(true);
        done();
      });

      controller1.abort();
    });

    it('应该在任一 signal 取消时触发事件', (done) => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      
      const mergedSignal = mergeAbortSignals([
        controller1.signal,
        controller2.signal,
      ]);

      let eventCount = 0;
      mergedSignal.addEventListener('abort', () => {
        eventCount++;
        if (eventCount === 1) {
          expect(mergedSignal.aborted).toBe(true);
          done();
        }
      });

      controller1.abort();
    });

    it('应该支持多个监听器', (done) => {
      const controller = new AbortController();
      const mergedSignal = mergeAbortSignals([controller.signal]);

      let listener1Called = false;
      let listener2Called = false;

      mergedSignal.addEventListener('abort', () => {
        listener1Called = true;
        checkDone();
      });

      mergedSignal.addEventListener('abort', () => {
        listener2Called = true;
        checkDone();
      });

      function checkDone() {
        if (listener1Called && listener2Called) {
          expect(mergedSignal.aborted).toBe(true);
          done();
        }
      }

      controller.abort();
    });
  });

  describe('多个 signal 场景', () => {
    it('应该处理三个或更多 signal', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      const controller3 = new AbortController();
      
      const mergedSignal = mergeAbortSignals([
        controller1.signal,
        controller2.signal,
        controller3.signal,
      ]);

      expect(mergedSignal.aborted).toBe(false);

      controller2.abort();

      expect(mergedSignal.aborted).toBe(true);
    });

    it('应该正确处理后续取消', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      
      const mergedSignal = mergeAbortSignals([
        controller1.signal,
        controller2.signal,
      ]);

      controller1.abort();
      expect(mergedSignal.aborted).toBe(true);

      controller2.abort();
      expect(mergedSignal.aborted).toBe(true);
    });
  });

  describe('清理行为', () => {
    it('应该在 signal 取消后移除监听器', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      
      const mergedSignal = mergeAbortSignals([
        controller1.signal,
        controller2.signal,
      ]);

      controller1.abort();

      // 再次取消不应该导致问题
      controller2.abort();
      expect(mergedSignal.aborted).toBe(true);
    });
  });

  describe('边界情况', () => {
    it('应该处理大量 signal', () => {
      const controllers = Array.from({ length: 10 }, () => new AbortController());
      const signals = controllers.map(c => c.signal);
      
      const mergedSignal = mergeAbortSignals(signals);
      expect(mergedSignal.aborted).toBe(false);
      
      controllers[5].abort();
      expect(mergedSignal.aborted).toBe(true);
    });

    it('应该处理同一个 signal 多次传入', () => {
      const controller = new AbortController();
      const signal = controller.signal;
      
      const mergedSignal = mergeAbortSignals([signal, signal, signal]);
      expect(mergedSignal.aborted).toBe(false);
      
      controller.abort();
      expect(mergedSignal.aborted).toBe(true);
    });

    it('应该正确处理已取消的 signal 在后续取消时', () => {
      const controller1 = new AbortController();
      const controller2 = new AbortController();
      
      controller1.abort();
      
      const mergedSignal = mergeAbortSignals([
        controller1.signal,
        controller2.signal,
      ]);
      
      expect(mergedSignal.aborted).toBe(true);
      
      // 后续取消不应该导致问题
      controller2.abort();
      expect(mergedSignal.aborted).toBe(true);
    });
  });
});
