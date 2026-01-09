/**
 * JWT 工具
 * 用于生成和验证 JSON Web Token
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload, UserRole } from '../types';

// JWT 配置
const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7 天有效期

/**
 * 生成 JWT Token
 * @param userId 用户ID
 * @param username 用户名
 * @param role 用户角色
 * @returns JWT Token 字符串
 */
export function generateToken(
  userId: number,
  username: string,
  role: UserRole
): string {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    userId,
    username,
    role
  };

  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * 验证 JWT Token
 * @param token JWT Token 字符串
 * @returns 解析后的载荷数据，验证失败返回 null
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * 解析 JWT Token（不验证签名）
 * @param token JWT Token 字符串
 * @returns 解析后的载荷数据，解析失败返回 null
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * 从 Authorization Header 提取 Token
 * @param authHeader Authorization Header 值（格式：Bearer <token>）
 * @returns Token 字符串，提取失败返回 null
 */
export function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  // 检查 Bearer 前缀
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim(); // 移除 "Bearer " 前缀

  if (!token) {
    return null;
  }

  return token;
}

/**
 * 检查 Token 是否即将过期（用于刷新）
 * @param token JWT Token 字符串
 * @param thresholdSeconds 阈值秒数（默认 1 小时）
 * @returns 是否即将过期
 */
export function isTokenExpiringSoon(
  token: string,
  thresholdSeconds: number = 3600
): boolean {
  const decoded = decodeToken(token);

  if (!decoded || !decoded.exp) {
    return true; // 无法解析或没有过期时间，视为即将过期
  }

  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = decoded.exp - now;

  return timeUntilExpiry < thresholdSeconds;
}

/**
 * JWT 工具对象（统一导出）
 */
export const JwtUtil = {
  generate: generateToken,
  verify: verifyToken,
  decode: decodeToken,
  extract: extractToken,
  isExpiringSoon: isTokenExpiringSoon,
  JWT_SECRET,
  JWT_EXPIRES_IN
};
