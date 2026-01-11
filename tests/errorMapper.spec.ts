import { defaultErrorMapper } from '../src/error/errorMapper';
import { AppError } from '../src/error/AppError';
import { ErrorCode } from '../src/error/ErrorCode';

describe('defaultErrorMapper', () => {
  describe('AppError 处理', () => {
    it('应该直接返回 AppError 实例', () => {
      const appError = new AppError(ErrorCode.NETWORK_ERROR, 'Network error');
      const result = defaultErrorMapper(appError);

      expect(result).toBe(appError);
      expect(result).toBeInstanceOf(AppError);
    });

    it('应该保持 AppError 的所有属性', () => {
      const appError = new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', {
        cause: new Error('Original'),
        meta: { field: 'email' },
      });
      const result = defaultErrorMapper(appError);

      expect(result.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(result.message).toBe('Validation failed');
      expect(result.cause).toBeDefined();
      expect(result.meta).toEqual({ field: 'email' });
    });
  });

  describe('AbortError 处理', () => {
    it('应该将 DOMException AbortError 转换为 AppError', () => {
      const abortError = new DOMException('Operation aborted', 'AbortError');
      const result = defaultErrorMapper(abortError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.ABORTED);
      expect(result.message).toBe('Operation aborted');
      expect(result.cause).toBe(abortError);
    });

    it('应该保持 AbortError 作为 cause', () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      const result = defaultErrorMapper(abortError);

      expect(result.cause).toBe(abortError);
    });
  });

  describe('未知错误处理', () => {
    it('应该将普通 Error 转换为 AppError', () => {
      const error = new Error('Test error');
      const result = defaultErrorMapper(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.UNKNOWN);
      expect(result.message).toBe('Unknown error');
      expect(result.cause).toBe(error);
    });

    it('应该将字符串错误转换为 AppError', () => {
      const error = 'String error';
      const result = defaultErrorMapper(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.UNKNOWN);
      expect(result.message).toBe('Unknown error');
      expect(result.cause).toBe(error);
    });

    it('应该将数字错误转换为 AppError', () => {
      const error = 404;
      const result = defaultErrorMapper(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.UNKNOWN);
      expect(result.cause).toBe(error);
    });

    it('应该将对象错误转换为 AppError', () => {
      const error = { code: 500, message: 'Server error' };
      const result = defaultErrorMapper(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.UNKNOWN);
      expect(result.cause).toBe(error);
    });

    it('应该将 null 转换为 AppError', () => {
      const result = defaultErrorMapper(null);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.UNKNOWN);
      expect(result.cause).toBe(null);
    });

    it('应该将 undefined 转换为 AppError', () => {
      const result = defaultErrorMapper(undefined);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.UNKNOWN);
      expect(result.cause).toBe(undefined);
    });
  });

  describe('错误类型识别', () => {
    it('应该正确识别 AppError', () => {
      const appError = new AppError(ErrorCode.TIMEOUT, 'Timeout');
      const result = defaultErrorMapper(appError);

      expect(result).toBe(appError);
    });

    it('应该正确识别 DOMException AbortError', () => {
      const abortError = new DOMException('Aborted', 'AbortError');
      const result = defaultErrorMapper(abortError);

      expect(result.code).toBe(ErrorCode.ABORTED);
    });

    it('应该正确识别其他 DOMException', () => {
      const domError = new DOMException('Other error', 'OtherError');
      const result = defaultErrorMapper(domError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.UNKNOWN);
      expect(result.cause).toBe(domError);
    });
  });

  describe('实际使用场景', () => {
    it('应该用于 safeAsync 的错误映射', () => {
      const error = new Error('Network failure');
      const mapped = defaultErrorMapper(error);

      expect(mapped).toBeInstanceOf(AppError);
      expect(mapped.code).toBe(ErrorCode.UNKNOWN);
      expect(mapped.cause).toBe(error);
    });

    it('应该处理 AbortController 的取消', () => {
      const controller = new AbortController();
      controller.abort();

      // 模拟 AbortSignal 触发时的错误
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      const mapped = defaultErrorMapper(abortError);

      expect(mapped.code).toBe(ErrorCode.ABORTED);
    });
  });
});
