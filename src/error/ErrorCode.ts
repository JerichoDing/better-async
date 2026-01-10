/**
 * 错误代码枚举
 * 
 * 
 * 
AA-BBB-CCCC
│  │    └─ 具体错误
│  └─ 模块
└─ 系统级

 */

export const ErrorCode = {
  UNKNOWN: 'BA-000-0000',

  TIMEOUT: 'BA-001-0001',
  ABORTED: 'BA-001-0002',

  NETWORK_ERROR: 'NET-001-0001',

  VALIDATION_ERROR: 'SYS-001-0001',
} as const

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode]
