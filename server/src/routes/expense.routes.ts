/**
 * 支出管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as expenseController from '../controllers/expense.controller';

const router = Router();

router.use(authenticate);

router.get('/', expenseController.getExpenses);
router.get('/statistics', expenseController.getStatistics);
router.get('/:id', expenseController.getExpenseById);
router.post('/', expenseController.createExpense);
router.put('/:id', expenseController.updateExpense);
router.patch('/:id/approve', authorize('admin', 'manager'), expenseController.approveExpense);

export default router;
