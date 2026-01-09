/**
 * 角色权限中间件 (RBAC - Role-Based Access Control)
 */

import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { forbidden, unauthorized } from '../utils/response';

/**
 * 角色权限校验中间件
 * 检查用户是否具有指定角色之一
 *
 * @param allowedRoles 允许访问的角色列表
 * @returns Express 中间件函数
 *
 * @example
 * // 仅管理员可访问
 * router.get('/admin', authenticate, authorize('admin'), controller);
 *
 * // 管理员或经理可访问
 * router.get('/manage', authenticate, authorize('admin', 'manager'), controller);
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // 确保已通过认证
    if (!req.user) {
      unauthorized(res, '请先登录');
      return;
    }

    // 检查用户角色是否在允许列表中
    if (!allowedRoles.includes(req.user.role)) {
      forbidden(res, '无权限执行此操作');
      return;
    }

    next();
  };
}

/**
 * 检查是否为管理员
 */
export function isAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    unauthorized(res, '请先登录');
    return;
  }

  if (req.user.role !== 'admin') {
    forbidden(res, '需要管理员权限');
    return;
  }

  next();
}

/**
 * 检查是否为管理员或经理
 */
export function isAdminOrManager(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    unauthorized(res, '请先登录');
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    forbidden(res, '需要管理员或经理权限');
    return;
  }

  next();
}

/**
 * 检查是否为资源所有者或管理员
 * 用于检查用户是否有权访问特定资源
 *
 * @param getResourceUserId 获取资源所有者ID的函数
 */
export function isOwnerOrAdmin(getResourceUserId: (req: AuthRequest) => number | undefined) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorized(res, '请先登录');
      return;
    }

    // 管理员可以访问任何资源
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // 检查是否为资源所有者
    const resourceUserId = getResourceUserId(req);
    if (resourceUserId && resourceUserId === req.user.userId) {
      next();
      return;
    }

    forbidden(res, '无权访问此资源');
  };
}

/**
 * 角色等级定义（数值越大权限越高）
 */
const ROLE_LEVELS: Record<UserRole, number> = {
  staff: 1,
  sales: 2,
  operator: 2,
  manager: 3,
  admin: 4
};

/**
 * 检查用户角色等级是否大于等于指定等级
 *
 * @param minRole 最低要求的角色
 */
export function requireRoleLevel(minRole: UserRole) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      unauthorized(res, '请先登录');
      return;
    }

    const userLevel = ROLE_LEVELS[req.user.role] || 0;
    const minLevel = ROLE_LEVELS[minRole] || 0;

    if (userLevel < minLevel) {
      forbidden(res, '权限不足');
      return;
    }

    next();
  };
}

export default authorize;
