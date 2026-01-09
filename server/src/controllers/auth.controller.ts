/**
 * 认证控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { authService } from '../services/auth.service';
import { success, badRequest } from '../utils/response';
import { catchAsync } from '../middlewares';
import { LoginDto, ChangePasswordDto } from '../types/dto/auth.dto';

/**
 * 用户登录
 * POST /api/auth/login
 */
export const login = catchAsync(async (req: AuthRequest, res: Response) => {
  const { username, password } = req.body as LoginDto;

  // 参数验证
  if (!username || !password) {
    return badRequest(res, '用户名和密码不能为空');
  }

  const result = await authService.login(username, password);
  return success(res, result, '登录成功');
});

/**
 * 用户登出
 * POST /api/auth/logout
 */
export const logout = catchAsync(async (req: AuthRequest, res: Response) => {
  // JWT 是无状态的，客户端删除 token 即可
  // 如需实现 token 黑名单，可在此处添加
  return success(res, null, '登出成功');
});

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
export const getCurrentUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const user = await authService.getCurrentUser(userId);
  return success(res, user);
});

/**
 * 修改密码
 * PUT /api/auth/password
 */
export const changePassword = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { oldPassword, newPassword } = req.body as ChangePasswordDto;

  // 参数验证
  if (!oldPassword || !newPassword) {
    return badRequest(res, '原密码和新密码不能为空');
  }

  await authService.changePassword(userId, oldPassword, newPassword);
  return success(res, null, '密码修改成功');
});
