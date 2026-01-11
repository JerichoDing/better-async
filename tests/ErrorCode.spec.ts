import { ErrorCode, ErrorCodeType } from '../src/error/ErrorCode';

describe('ErrorCode', () => {
  describe('常量定义', () => {
    it('应该定义所有错误代码常量', () => {
      expect(ErrorCode.UNKNOWN).toBe('BA-000-0000');
      expect(ErrorCode.TIMEOUT).toBe('BA-001-0001');
      expect(ErrorCode.ABORTED).toBe('BA-001-0002');
      expect(ErrorCode.NETWORK_ERROR).toBe('NET-001-0001');
      expect(ErrorCode.VALIDATION_ERROR).toBe('SYS-001-0001');
    });

    it('所有错误代码应该是字符串', () => {
      Object.values(ErrorCode).forEach(code => {
        expect(typeof code).toBe('string');
      });
    });

    it('所有错误代码应该遵循格式 AA-BBB-CCCC', () => {
      Object.values(ErrorCode).forEach(code => {
        expect(code).toMatch(/^[A-Z]{2,3}-\d{3}-\d{4}$/);
      });
    });
  });

  describe('类型定义', () => {
    it('ErrorCodeType 应该包含所有错误代码', () => {
      const codes: ErrorCodeType[] = [
        ErrorCode.UNKNOWN,
        ErrorCode.TIMEOUT,
        ErrorCode.ABORTED,
        ErrorCode.NETWORK_ERROR,
        ErrorCode.VALIDATION_ERROR,
      ];

      codes.forEach(code => {
        expect(typeof code).toBe('string');
      });
    });

    it('应该可以用于类型注解', () => {
      const code: ErrorCodeType = ErrorCode.UNKNOWN;
      expect(code).toBe(ErrorCode.UNKNOWN);
    });
  });

  describe('错误代码分类', () => {
    it('BA-* 应该是 better-async 模块的错误', () => {
      expect(ErrorCode.UNKNOWN).toMatch(/^BA-/);
      expect(ErrorCode.TIMEOUT).toMatch(/^BA-/);
      expect(ErrorCode.ABORTED).toMatch(/^BA-/);
    });

    it('NET-* 应该是网络相关错误', () => {
      expect(ErrorCode.NETWORK_ERROR).toMatch(/^NET-/);
    });

    it('SYS-* 应该是系统相关错误', () => {
      expect(ErrorCode.VALIDATION_ERROR).toMatch(/^SYS-/);
    });
  });

  describe('不可变性', () => {
    it('ErrorCode 对象应该是只读的', () => {
      expect(() => {
        // @ts-expect-error - 测试只读属性
        ErrorCode.UNKNOWN = 'NEW-CODE';
      }).toThrow();
    });
  });

  describe('使用场景', () => {
    it('应该可以用于 switch 语句', () => {
      const code: ErrorCodeType = ErrorCode.TIMEOUT;
      let handled = false;

      switch (code) {
        case ErrorCode.TIMEOUT:
          handled = true;
          break;
        case ErrorCode.ABORTED:
          break;
        default:
          break;
      }

      expect(handled).toBe(true);
    });

    it('应该可以用于错误映射', () => {
      const errorMap: Record<ErrorCodeType, string> = {
        [ErrorCode.UNKNOWN]: '未知错误',
        [ErrorCode.TIMEOUT]: '操作超时',
        [ErrorCode.ABORTED]: '操作已取消',
        [ErrorCode.NETWORK_ERROR]: '网络错误',
        [ErrorCode.VALIDATION_ERROR]: '验证失败',
      };

      expect(errorMap[ErrorCode.TIMEOUT]).toBe('操作超时');
      expect(errorMap[ErrorCode.NETWORK_ERROR]).toBe('网络错误');
    });
  });
});
