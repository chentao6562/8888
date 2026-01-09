/**
 * JWT 认证中间件
 */

import { Response, NextFunction } from 'express';
import { AuthRequest, UnauthorizedError } from '../types';
import { verifyToken, extractToken } from '../utils/jwt';
import { unauthorized } from '../utils/response';

/**
 * JWT 认证中间件
 * 从 Authorization header 提取并验证 JWT Token
 * 验证成功后将用户信息附加到 req.user
 */
export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // 从 Authorization header 提取 token
    const token = extractToken(req.headers.authorization);

    if (!token) {
      unauthorized(res, '请先登录');
      return;
    }

    // 验证 token
    const payload = verifyToken(token);

    if (!payload) {
      unauthorized(res, 'Token 无效或已过期');
      return;
    }

    // 将用户信息附加到请求对象
    req.user = {
      userId: payload.userId,
      username: payload.username,
      role: payload.role
    };

    next();
  } catch (error) {
    unauthorized(res, '认证失败');
  }
}

/**
 * 可选认证中间件
 * Token 存在时验证，不存在时也允许继续
 */
export function optionalAuthenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractToken(req.headers.authorization);

    if (token) {
      const payload = verifyToken(token);

      if (payload) {
        req.user = {
          userId: payload.userId,
          username: payload.username,
          role: payload.role
        };
      }
    }

    next();
  } catch (error) {
    // 可选认证，失败时继续执行
    next();
  }
}

export default authenticate;
