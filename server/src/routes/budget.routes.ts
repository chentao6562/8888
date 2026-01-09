/**
 * 预算管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as budgetController from '../controllers/budget.controller';

const router = Router();

router.use(authenticate);

router.get('/', budgetController.getBudgets);
router.get('/alerts', budgetController.getAlerts);
router.get('/:id', budgetController.getBudgetById);
router.get('/:id/usage', budgetController.getUsage);
router.post('/', authorize('admin', 'manager'), budgetController.createBudget);
router.put('/:id', authorize('admin', 'manager'), budgetController.updateBudget);

export default router;
