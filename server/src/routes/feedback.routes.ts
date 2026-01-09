/**
 * 反馈路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as controller from '../controllers/feedback.controller';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 反馈 CRUD
router.get('/', controller.getFeedbacks);
router.get('/:id', controller.getFeedbackById);
router.post('/', controller.createFeedback);
router.put('/:id/reply', authorize('admin', 'manager'), controller.replyFeedback);

export default router;
