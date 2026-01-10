// src/error/errorMapper.ts
import { AppError } from './AppError'
import { ErrorCode } from './ErrorCode'

export function defaultErrorMapper(err: unknown): AppError {
  if (err instanceof AppError) return err

  if (err instanceof DOMException && err.name === 'AbortError') {
    return new AppError(ErrorCode.ABORTED, 'Operation aborted', { cause: err })
  }

  return new AppError(
    ErrorCode.UNKNOWN,
    'Unknown error',
    { cause: err }
  )
}
