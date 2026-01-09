/**
 * 工作台路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as controller from '../controllers/dashboard.controller';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 工作台接口
router.get('/overview', controller.getOverview);
router.get('/my-tasks', controller.getMyTasks);
router.get('/my-projects', controller.getMyProjects);
router.get('/my-leads', controller.getMyLeads);
router.get('/recent-activities', controller.getRecentActivities);
router.get('/kpi', authorize('admin', 'manager'), controller.getKpi);
router.get('/notifications', controller.getUnreadNotifications);

export default router;
