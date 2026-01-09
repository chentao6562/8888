/**
 * 素材库路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as controller from '../controllers/material.controller';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 素材 CRUD
router.get('/', controller.getMaterials);
router.get('/categories', controller.getCategories);
router.get('/:id', controller.getMaterialById);
router.post('/upload', controller.uploadMaterial);
router.put('/:id', controller.updateMaterial);
router.delete('/:id', authorize('admin', 'manager'), controller.deleteMaterial);
router.post('/:id/use', controller.useMaterial);

export default router;
