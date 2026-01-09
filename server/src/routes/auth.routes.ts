/**
 * 认证路由
 */

import { Router } from 'express';
import { authenticate } from '../middlewares';
import * as authController from '../controllers/auth.controller';

const router = Router();

/**
 * POST /api/auth/login
 * 用户登录（无需认证）
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/logout
 * 用户登出（需认证）
 */
router.post('/logout', authenticate, authController.logout);

/**
 * GET /api/auth/me
 * 获取当前用户信息（需认证）
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * PUT /api/auth/password
 * 修改密码（需认证）
 */
router.put('/password', authenticate, authController.changePassword);

export default router;
