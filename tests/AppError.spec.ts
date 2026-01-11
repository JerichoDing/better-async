import { AppError } from '../src/error/AppError';
import { ErrorCode } from '../src/error/ErrorCode';

describe('AppError', () => {
  describe('基本功能', () => {
    it('应该创建 AppError 实例', () => {
      const error = new AppError(ErrorCode.UNKNOWN, 'Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('应该设置错误消息', () => {
      const error = new AppError(ErrorCode.UNKNOWN, 'Test error message');
      expect(error.message).toBe('Test error message');
    });

    it('应该设置错误代码', () => {
      const error = new AppError(ErrorCode.NETWORK_ERROR, 'Network error');
      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
    });

    it('应该设置错误名称', () => {
      const error = new AppError(ErrorCode.UNKNOWN, 'Test error');
      expect(error.name).toBe('AppError');
    });
  });

  describe('cause 属性', () => {
    it('应该支持 cause 选项', () => {
      const originalError = new Error('Original error');
      const error = new AppError(ErrorCode.UNKNOWN, 'Wrapped error', {
        cause: originalError,
      });

      expect(error.cause).toBe(originalError);
    });

    it('应该支持非 Error 类型的 cause', () => {
      const error = new AppError(ErrorCode.UNKNOWN, 'Error', {
        cause: 'string cause',
      });

      expect(error.cause).toBe('string cause');
    });

    it('应该支持对象类型的 cause', () => {
      const cause = { code: 500, message: 'Server error' };
      const error = new AppError(ErrorCode.UNKNOWN, 'Error', { cause });

      expect(error.cause).toEqual(cause);
    });

    it('应该在没有 cause 时返回 undefined', () => {
      const error = new AppError(ErrorCode.UNKNOWN, 'Error');
      expect(error.cause).toBeUndefined();
    });
  });

  describe('meta 属性', () => {
    it('应该支持 meta 选项', () => {
      const meta = { userId: 123, action: 'create' };
      const error = new AppError(ErrorCode.UNKNOWN, 'Error', { meta });

      expect(error.meta).toEqual(meta);
    });

    it('应该支持空的 meta 对象', () => {
      const error = new AppError(ErrorCode.UNKNOWN, 'Error', { meta: {} });
      expect(error.meta).toEqual({});
    });

    it('应该在没有 meta 时返回 undefined', () => {
      const error = new AppError(ErrorCode.UNKNOWN, 'Error');
      expect(error.meta).toBeUndefined();
    });

    it('应该支持复杂的 meta 对象', () => {
      const meta = {
        requestId: 'req-123',
        timestamp: Date.now(),
        details: {
          field: 'email',
          value: 'invalid@',
        },
      };
      const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Validation failed', {
        meta,
      });

      expect(error.meta).toEqual(meta);
    });
  });

  describe('组合选项', () => {
    it('应该同时支持 cause 和 meta', () => {
      const originalError = new Error('Original');
      const meta = { userId: 123 };
      const error = new AppError(ErrorCode.UNKNOWN, 'Error', {
        cause: originalError,
        meta,
      });

      expect(error.cause).toBe(originalError);
      expect(error.meta).toEqual(meta);
    });
  });

  describe('错误代码', () => {
    it('应该支持所有预定义的错误代码', () => {
      const codes = [
        ErrorCode.UNKNOWN,
        ErrorCode.TIMEOUT,
        ErrorCode.ABORTED,
        ErrorCode.NETWORK_ERROR,
        ErrorCode.VALIDATION_ERROR,
      ];

      codes.forEach(code => {
        const error = new AppError(code, 'Test error');
        expect(error.code).toBe(code);
      });
    });
  });

  describe('继承行为', () => {
    it('应该继承 Error 的所有属性', () => {
      const error = new AppError(ErrorCode.UNKNOWN, 'Test error');
      expect(error.stack).toBeDefined();
      expect(error.toString()).toContain('AppError');
      expect(error.toString()).toContain('Test error');
    });

    it('应该可以被 instanceof 检查', () => {
      const error = new AppError(ErrorCode.UNKNOWN, 'Test error');
      expect(error instanceof Error).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });
  });

  describe('实际使用场景', () => {
    it('应该用于包装网络错误', () => {
      const networkError = new Error('Network request failed');
      const error = new AppError(ErrorCode.NETWORK_ERROR, 'Failed to fetch data', {
        cause: networkError,
        meta: { url: 'https://api.example.com', method: 'GET' },
      });

      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(error.cause).toBe(networkError);
      expect(error.meta?.url).toBe('https://api.example.com');
    });

    it('应该用于验证错误', () => {
      const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid input', {
        meta: {
          field: 'email',
          value: 'invalid-email',
          rule: 'must be valid email format',
        },
      });

      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.meta?.field).toBe('email');
    });

    it('应该用于超时错误', () => {
      const error = new AppError(ErrorCode.TIMEOUT, 'Operation timed out', {
        meta: { timeout: 5000, operation: 'fetchData' },
      });

      expect(error.code).toBe(ErrorCode.TIMEOUT);
      expect(error.meta?.timeout).toBe(5000);
    });
  });
});
