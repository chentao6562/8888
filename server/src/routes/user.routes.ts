/**
 * 用户管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as userController from '../controllers/user.controller';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

/**
 * GET /api/users
 * 获取用户列表（分页）
 * 权限：admin, manager
 */
router.get('/', authorize('admin', 'manager'), userController.getUsers);

/**
 * GET /api/users/:id
 * 获取用户详情
 * 权限：admin, manager
 */
router.get('/:id', authorize('admin', 'manager'), userController.getUserById);

/**
 * POST /api/users
 * 创建用户
 * 权限：admin
 */
router.post('/', authorize('admin'), userController.createUser);

/**
 * PUT /api/users/:id
 * 更新用户
 * 权限：admin
 */
router.put('/:id', authorize('admin'), userController.updateUser);

/**
 * DELETE /api/users/:id
 * 删除用户
 * 权限：admin
 */
router.delete('/:id', authorize('admin'), userController.deleteUser);

/**
 * PATCH /api/users/:id/status
 * 启用/禁用用户
 * 权限：admin
 */
router.patch('/:id/status', authorize('admin'), userController.updateUserStatus);

/**
 * POST /api/users/:id/reset-password
 * 重置用户密码
 * 权限：admin
 */
router.post('/:id/reset-password', authorize('admin'), userController.resetPassword);

export default router;
