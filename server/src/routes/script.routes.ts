/**
 * 话术模板路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as controller from '../controllers/script.controller';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 话术 CRUD
router.get('/', controller.getScripts);
router.get('/categories', controller.getCategories);
router.get('/:id', controller.getScriptById);
router.post('/', controller.createScript);
router.put('/:id', controller.updateScript);
router.delete('/:id', authorize('admin', 'manager'), controller.deleteScript);
router.post('/:id/use', controller.useScript);

export default router;
