/**
 * 用户管理模块 DTO
 */

import { UserRole } from '../common';

/**
 * 创建用户请求
 */
export interface CreateUserDto {
  username: string;
  password: string;
  name: string;
  phone?: string;
  email?: string;
  role: UserRole;
  avatar?: string;
}

/**
 * 更新用户请求
 */
export interface UpdateUserDto {
  name?: string;
  phone?: string;
  email?: string;
  role?: UserRole;
  avatar?: string;
}

/**
 * 用户查询参数
 */
export interface UserQueryDto {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: UserRole;
  status?: number;
}

/**
 * 用户列表项
 */
export interface UserListItemDto {
  id: number;
  username: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role: string;
  avatar?: string | null;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 更新用户状态请求
 */
export interface UpdateUserStatusDto {
  status: number;
}
