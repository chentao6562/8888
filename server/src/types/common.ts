/**
 * 通用类型定义
 */

import { Request } from 'express';

// ==================== 用户角色枚举 ====================
export type UserRole = 'admin' | 'manager' | 'operator' | 'sales' | 'staff';

// ==================== JWT 载荷类型 ====================
export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ==================== 认证请求类型 ====================
export interface AuthUser {
  userId: number;
  username: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// ==================== API 响应类型 ====================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// ==================== 分页类型 ====================
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ==================== 查询参数类型 ====================
export interface QueryParams extends PaginationParams {
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

// ==================== 通用 ID 参数类型 ====================
export interface IdParams {
  id: string;
}

// ==================== 日期范围查询 ====================
export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

// ==================== 自定义错误类 ====================
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // 确保原型链正确
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ==================== 常见错误类型 ====================
export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权访问') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '无权限访问') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = '请求参数错误') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super(message, 409, 'CONFLICT');
  }
}

export class ValidationError extends AppError {
  constructor(message: string = '数据验证失败') {
    super(message, 422, 'VALIDATION_ERROR');
  }
}

export class BusinessError extends AppError {
  constructor(message: string = '业务逻辑错误') {
    super(message, 400, 'BUSINESS_ERROR');
  }
}
