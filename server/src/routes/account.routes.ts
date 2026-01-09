/**
 * 账号管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as accountController from '../controllers/account.controller';

const router = Router();

router.use(authenticate);

router.get('/', accountController.getAccounts);
router.get('/:id', accountController.getAccountById);
router.post('/', authorize('admin', 'manager', 'operator'), accountController.createAccount);
router.put('/:id', authorize('admin', 'manager', 'operator'), accountController.updateAccount);
router.delete('/:id', authorize('admin', 'manager'), accountController.deleteAccount);

export default router;
