/**
 * 全局错误处理中间件
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ApiResponse, ApiError } from '../types';

/**
 * 开发环境错误响应
 */
function sendDevError(err: AppError, res: Response): void {
  const apiError: ApiError = {
    code: err.code || 'INTERNAL_ERROR',
    message: err.message,
    details: {
      stack: err.stack,
      isOperational: err.isOperational
    }
  };

  const response: ApiResponse = {
    success: false,
    error: apiError
  };

  res.status(err.statusCode || 500).json(response);
}

/**
 * 生产环境错误响应
 */
function sendProdError(err: AppError, res: Response): void {
  // 可操作的错误：发送详细信息给客户端
  if (err.isOperational) {
    const apiError: ApiError = {
      code: err.code || 'ERROR',
      message: err.message
    };

    const response: ApiResponse = {
      success: false,
      error: apiError
    };

    res.status(err.statusCode || 500).json(response);
  } else {
    // 程序错误或未知错误：不泄露错误详情
    console.error('ERROR 💥:', err);

    const apiError: ApiError = {
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    };

    const response: ApiResponse = {
      success: false,
      error: apiError
    };

    res.status(500).json(response);
  }
}

/**
 * 处理 Prisma 错误
 */
function handlePrismaError(err: Error & { code?: string; meta?: unknown }): AppError {
  switch (err.code) {
    case 'P2002':
      // 唯一约束冲突
      return new AppError('数据已存在', 409, 'CONFLICT');
    case 'P2025':
      // 记录不存在
      return new AppError('记录不存在', 404, 'NOT_FOUND');
    case 'P2003':
      // 外键约束失败
      return new AppError('关联数据不存在', 400, 'FOREIGN_KEY_ERROR');
    case 'P2014':
      // 关系违规
      return new AppError('数据关系错误', 400, 'RELATION_ERROR');
    default:
      return new AppError('数据库操作错误', 500, 'DATABASE_ERROR');
  }
}

/**
 * 处理 JWT 错误
 */
function handleJWTError(): AppError {
  return new AppError('Token 无效', 401, 'INVALID_TOKEN');
}

/**
 * 处理 JWT 过期错误
 */
function handleJWTExpiredError(): AppError {
  return new AppError('Token 已过期', 401, 'TOKEN_EXPIRED');
}

/**
 * 处理验证错误
 */
function handleValidationError(err: Error & { errors?: unknown[] }): AppError {
  return new AppError('数据验证失败', 422, 'VALIDATION_ERROR');
}

/**
 * 全局错误处理中间件
 */
export function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // 确保是 AppError 类型
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else {
    // 转换各种错误类型
    const errWithCode = err as Error & { code?: string; name?: string };

    if (errWithCode.code && errWithCode.code.startsWith('P')) {
      // Prisma 错误
      error = handlePrismaError(errWithCode);
    } else if (errWithCode.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (errWithCode.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    } else if (errWithCode.name === 'ValidationError') {
      error = handleValidationError(errWithCode);
    } else {
      // 未知错误
      error = new AppError(
        err.message || '服务器内部错误',
        500,
        'INTERNAL_ERROR',
        false
      );
      error.stack = err.stack;
    }
  }

  // 记录错误日志
  console.error(`[${new Date().toISOString()}] ERROR:`, {
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });

  // 根据环境发送不同的错误响应
  if (process.env.NODE_ENV === 'development') {
    sendDevError(error, res);
  } else {
    sendProdError(error, res);
  }
}

/**
 * 404 处理中间件
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error: ApiError = {
    code: 'NOT_FOUND',
    message: `接口不存在: ${req.method} ${req.path}`
  };

  const response: ApiResponse = {
    success: false,
    error
  };

  res.status(404).json(response);
}

/**
 * 异步错误捕获包装器
 * 用于包装异步路由处理函数，自动捕获错误并传递给错误处理中间件
 */
export function catchAsync(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}

export default globalErrorHandler;
