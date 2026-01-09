/**
 * 认证服务
 */

import { prisma } from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { UnauthorizedError, NotFoundError, BadRequestError } from '../types';
import { LoginResponseDto, UserInfoDto } from '../types/dto/auth.dto';
import { UserRole } from '../types';

/**
 * 将用户实体转换为用户信息 DTO
 */
function toUserInfoDto(user: {
  id: number;
  username: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: string;
  avatar: string | null;
  status: number;
  createdAt: Date;
}): UserInfoDto {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    status: user.status,
    createdAt: user.createdAt
  };
}

/**
 * 认证服务类
 */
export class AuthService {
  /**
   * 用户登录
   * @param username 用户名
   * @param password 密码
   * @returns 用户信息和 Token
   */
  async login(username: string, password: string): Promise<LoginResponseDto> {
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username }
    });

    // 用户不存在或密码错误 - 使用统一错误消息
    if (!user) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    // 验证密码
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    // 检查用户状态
    if (user.status !== 1) {
      throw new UnauthorizedError('账号已被禁用');
    }

    // 生成 Token
    const token = generateToken(
      user.id,
      user.username,
      user.role as UserRole
    );

    return {
      user: toUserInfoDto(user),
      token
    };
  }

  /**
   * 获取当前用户信息
   * @param userId 用户ID
   * @returns 用户信息
   */
  async getCurrentUser(userId: number): Promise<UserInfoDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    return toUserInfoDto(user);
  }

  /**
   * 修改密码
   * @param userId 用户ID
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   */
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    // 获取用户
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    // 验证旧密码
    const isValidPassword = await comparePassword(oldPassword, user.password);
    if (!isValidPassword) {
      throw new BadRequestError('原密码错误');
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      throw new BadRequestError('新密码长度不能少于6位');
    }

    // 加密新密码并更新
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
  }
}

// 导出单例
export const authService = new AuthService();
