/**
 * 用户管理服务
 */

import { prisma } from '../utils/prisma';
import { hashPassword } from '../utils/password';
import { PaginatedResult, NotFoundError, ConflictError, BadRequestError } from '../types';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  UserListItemDto
} from '../types/dto/user.dto';

/**
 * 将用户实体转换为列表项 DTO
 */
function toUserListItemDto(user: {
  id: number;
  username: string;
  name: string;
  phone: string | null;
  email: string | null;
  role: string;
  avatar: string | null;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}): UserListItemDto {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

/**
 * 用户管理服务类
 */
export class UserService {
  /**
   * 获取用户列表（分页）
   */
  async findAll(params: UserQueryDto): Promise<PaginatedResult<UserListItemDto>> {
    const { page = 1, pageSize = 20, keyword, role, status } = params;

    // 构建查询条件
    const where: {
      OR?: Array<{ username?: { contains: string }; name?: { contains: string }; phone?: { contains: string }; email?: { contains: string } }>;
      role?: string;
      status?: number;
    } = {};

    if (keyword) {
      where.OR = [
        { username: { contains: keyword } },
        { name: { contains: keyword } },
        { phone: { contains: keyword } },
        { email: { contains: keyword } }
      ];
    }

    if (role) {
      where.role = role;
    }

    if (status !== undefined) {
      where.status = status;
    }

    // 查询总数
    const total = await prisma.user.count({ where });

    // 查询数据
    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return {
      items: users.map(toUserListItemDto),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  /**
   * 获取用户详情
   */
  async findById(id: number): Promise<UserListItemDto> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    return toUserListItemDto(user);
  }

  /**
   * 创建用户
   */
  async create(data: CreateUserDto): Promise<UserListItemDto> {
    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username }
    });

    if (existingUser) {
      throw new ConflictError('用户名已存在');
    }

    // 验证密码长度
    if (data.password.length < 6) {
      throw new BadRequestError('密码长度不能少于6位');
    }

    // 加密密码
    const hashedPassword = await hashPassword(data.password);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        status: 1
      },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return toUserListItemDto(user);
  }

  /**
   * 更新用户
   */
  async update(id: number, data: UpdateUserDto): Promise<UserListItemDto> {
    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new NotFoundError('用户不存在');
    }

    // 更新用户
    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        role: data.role,
        avatar: data.avatar
      },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return toUserListItemDto(user);
  }

  /**
   * 删除用户
   */
  async delete(id: number, currentUserId: number): Promise<void> {
    // 不能删除自己
    if (id === currentUserId) {
      throw new BadRequestError('不能删除自己');
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new NotFoundError('用户不存在');
    }

    // 删除用户
    await prisma.user.delete({
      where: { id }
    });
  }

  /**
   * 更新用户状态（启用/禁用）
   */
  async updateStatus(id: number, status: number, currentUserId: number): Promise<UserListItemDto> {
    // 不能禁用自己
    if (id === currentUserId && status === 0) {
      throw new BadRequestError('不能禁用自己');
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new NotFoundError('用户不存在');
    }

    // 更新状态
    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        username: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        avatar: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return toUserListItemDto(user);
  }

  /**
   * 重置用户密码
   */
  async resetPassword(id: number, newPassword: string): Promise<void> {
    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new NotFoundError('用户不存在');
    }

    // 验证密码长度
    if (newPassword.length < 6) {
      throw new BadRequestError('密码长度不能少于6位');
    }

    // 加密并更新密码
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });
  }
}

// 导出单例
export const userService = new UserService();
