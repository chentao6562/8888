/**
 * 自动化规则路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as automationController from '../controllers/automation.controller';

const router = Router();

router.use(authenticate);

router.get('/', automationController.getAutomations);
router.get('/:id', automationController.getAutomationById);
router.get('/:id/logs', automationController.getLogs);
router.post('/', authorize('admin', 'manager'), automationController.createAutomation);
router.put('/:id', authorize('admin', 'manager'), automationController.updateAutomation);
router.delete('/:id', authorize('admin', 'manager'), automationController.deleteAutomation);
router.patch('/:id/toggle', authorize('admin', 'manager'), automationController.toggleAutomation);
router.post('/:id/execute', authorize('admin', 'manager'), automationController.executeAutomation);

export default router;
