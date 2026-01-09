/**
 * 项目管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as projectController from '../controllers/project.controller';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

// 项目 CRUD
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', authorize('admin', 'manager'), projectController.createProject);
router.put('/:id', authorize('admin', 'manager'), projectController.updateProject);
router.delete('/:id', authorize('admin'), projectController.deleteProject);

// 成员管理
router.post('/:id/members', authorize('admin', 'manager'), projectController.addMember);
router.delete('/:id/members/:userId', authorize('admin', 'manager'), projectController.removeMember);

// 阶段管理
router.get('/:id/stages', projectController.getStages);
router.post('/:id/stages', authorize('admin', 'manager'), projectController.createStage);
router.put('/:id/stages/:stageId', authorize('admin', 'manager'), projectController.updateStage);

// 指标管理
router.get('/:id/indicators', projectController.getIndicators);
router.post('/:id/indicators', authorize('admin', 'manager'), projectController.createIndicator);
router.put('/:id/indicators/:indicatorId', projectController.updateIndicator);

export default router;
