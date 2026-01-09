/**
 * 统一响应格式工具
 */

import { Response } from 'express';
import { ApiResponse, ApiError, PaginatedResult } from '../types';

/**
 * 成功响应
 */
export function success<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  return res.status(statusCode).json(response);
}

/**
 * 创建成功响应 (201)
 */
export function created<T>(res: Response, data?: T, message: string = '创建成功'): Response {
  return success(res, data, message, 201);
}

/**
 * 无内容响应 (204)
 */
export function noContent(res: Response): Response {
  return res.status(204).send();
}

/**
 * 错误响应
 */
export function error(
  res: Response,
  message: string,
  statusCode: number = 500,
  code: string = 'INTERNAL_ERROR',
  details?: unknown
): Response {
  const apiError: ApiError = {
    code,
    message,
    details
  };

  const response: ApiResponse = {
    success: false,
    error: apiError
  };

  return res.status(statusCode).json(response);
}

/**
 * 400 错误请求
 */
export function badRequest(res: Response, message: string = '请求参数错误', details?: unknown): Response {
  return error(res, message, 400, 'BAD_REQUEST', details);
}

/**
 * 401 未授权
 */
export function unauthorized(res: Response, message: string = '未授权访问'): Response {
  return error(res, message, 401, 'UNAUTHORIZED');
}

/**
 * 403 禁止访问
 */
export function forbidden(res: Response, message: string = '无权限访问'): Response {
  return error(res, message, 403, 'FORBIDDEN');
}

/**
 * 404 未找到
 */
export function notFound(res: Response, message: string = '资源不存在'): Response {
  return error(res, message, 404, 'NOT_FOUND');
}

/**
 * 409 冲突
 */
export function conflict(res: Response, message: string = '资源冲突'): Response {
  return error(res, message, 409, 'CONFLICT');
}

/**
 * 422 验证错误
 */
export function validationError(res: Response, message: string = '数据验证失败', details?: unknown): Response {
  return error(res, message, 422, 'VALIDATION_ERROR', details);
}

/**
 * 500 服务器内部错误
 */
export function serverError(res: Response, message: string = '服务器内部错误'): Response {
  return error(res, message, 500, 'INTERNAL_ERROR');
}

/**
 * 分页响应
 */
export function paginated<T>(res: Response, result: PaginatedResult<T>, message?: string): Response {
  const response: ApiResponse<PaginatedResult<T>> = {
    success: true,
    data: result,
    message
  };
  return res.status(200).json(response);
}

/**
 * 响应工具对象（统一导出）
 */
export const ResponseUtil = {
  success,
  created,
  noContent,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  validationError,
  serverError,
  paginated
};
