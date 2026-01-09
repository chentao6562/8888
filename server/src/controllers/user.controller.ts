/**
 * 用户管理控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { userService } from '../services/user.service';
import { success, created, badRequest, noContent, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';
import { CreateUserDto, UpdateUserDto, UserQueryDto, UpdateUserStatusDto } from '../types/dto/user.dto';
import { UserRole } from '../types';

/**
 * 获取用户列表
 * GET /api/users
 */
export const getUsers = catchAsync(async (req: AuthRequest, res: Response) => {
  const query: UserQueryDto = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    keyword: req.query.keyword as string | undefined,
    role: req.query.role as UserRole | undefined,
    status: req.query.status !== undefined ? Number(req.query.status) : undefined
  };

  const result = await userService.findAll(query);
  return paginated(res, result);
});

/**
 * 获取用户详情
 * GET /api/users/:id
 */
export const getUserById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return badRequest(res, '无效的用户ID');
  }

  const user = await userService.findById(id);
  return success(res, user);
});

/**
 * 创建用户
 * POST /api/users
 */
export const createUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const data = req.body as CreateUserDto;

  // 参数验证
  if (!data.username || !data.password || !data.name || !data.role) {
    return badRequest(res, '用户名、密码、姓名和角色不能为空');
  }

  // 验证角色
  const validRoles: UserRole[] = ['admin', 'manager', 'operator', 'sales', 'staff'];
  if (!validRoles.includes(data.role)) {
    return badRequest(res, '无效的角色');
  }

  const user = await userService.create(data);
  return created(res, user, '用户创建成功');
});

/**
 * 更新用户
 * PUT /api/users/:id
 */
export const updateUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return badRequest(res, '无效的用户ID');
  }

  const data = req.body as UpdateUserDto;

  // 验证角色（如果提供）
  if (data.role) {
    const validRoles: UserRole[] = ['admin', 'manager', 'operator', 'sales', 'staff'];
    if (!validRoles.includes(data.role)) {
      return badRequest(res, '无效的角色');
    }
  }

  const user = await userService.update(id, data);
  return success(res, user, '用户更新成功');
});

/**
 * 删除用户
 * DELETE /api/users/:id
 */
export const deleteUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const currentUserId = req.user!.userId;

  if (isNaN(id)) {
    return badRequest(res, '无效的用户ID');
  }

  await userService.delete(id, currentUserId);
  return success(res, null, '用户删除成功');
});

/**
 * 更新用户状态（启用/禁用）
 * PATCH /api/users/:id/status
 */
export const updateUserStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const currentUserId = req.user!.userId;

  if (isNaN(id)) {
    return badRequest(res, '无效的用户ID');
  }

  const { status } = req.body as UpdateUserStatusDto;

  if (status !== 0 && status !== 1) {
    return badRequest(res, '无效的状态值');
  }

  const user = await userService.updateStatus(id, status, currentUserId);
  return success(res, user, status === 1 ? '用户已启用' : '用户已禁用');
});

/**
 * 重置用户密码
 * POST /api/users/:id/reset-password
 */
export const resetPassword = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return badRequest(res, '无效的用户ID');
  }

  const { newPassword } = req.body as { newPassword: string };

  if (!newPassword) {
    return badRequest(res, '新密码不能为空');
  }

  await userService.resetPassword(id, newPassword);
  return success(res, null, '密码重置成功');
});
