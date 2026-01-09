/**
 * 认证模块 DTO（数据传输对象）
 */

/**
 * 登录请求
 */
export interface LoginDto {
  username: string;
  password: string;
}

/**
 * 登录响应
 */
export interface LoginResponseDto {
  user: UserInfoDto;
  token: string;
}

/**
 * 用户信息（不含敏感数据）
 */
export interface UserInfoDto {
  id: number;
  username: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role: string;
  avatar?: string | null;
  status: number;
  createdAt: Date;
}

/**
 * 修改密码请求
 */
export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

/**
 * Token 验证响应
 */
export interface TokenValidationDto {
  valid: boolean;
  user?: UserInfoDto;
}
