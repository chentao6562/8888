/**
 * 客户管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as customerController from '../controllers/customer.controller';

const router = Router();

router.use(authenticate);

// ==================== 客户标签路由 (放在前面避免路由冲突) ====================
router.get('/tags', customerController.getTags);
router.post('/tags', authorize('admin', 'manager'), customerController.createTag);
router.put('/tags/:id', authorize('admin', 'manager'), customerController.updateTag);
router.delete('/tags/:id', authorize('admin', 'manager'), customerController.deleteTag);

// ==================== 客户 CRUD ====================
router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', authorize('admin', 'manager'), customerController.deleteCustomer);

// ==================== 跟进记录 ====================
router.post('/:id/follow-logs', customerController.addFollowLog);
router.get('/:id/follow-logs', customerController.getFollowLogs);

// ==================== 标签关联 ====================
router.post('/:id/tags', customerController.addTag);
router.delete('/:id/tags/:tagId', customerController.removeTag);

export default router;
