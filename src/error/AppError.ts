// src/error/AppError.ts
import type { ErrorCodeType } from './ErrorCode'

export class AppError extends Error {
  code: ErrorCodeType
  cause?: unknown
  meta?: Record<string, unknown>

  constructor(
    code: ErrorCodeType,
    message: string,
    options?: {
      cause?: unknown
      meta?: Record<string, unknown>
    }
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.cause = options?.cause
    this.meta = options?.meta
  }
}
