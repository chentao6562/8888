/**
 * 工作报告路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as controller from '../controllers/report.controller';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 日报
router.get('/daily', controller.getDailyReports);
router.get('/daily/:id', controller.getDailyReportById);
router.post('/daily', controller.createDailyReport);
router.put('/daily/:id', controller.updateDailyReport);

// 周报
router.get('/weekly', controller.getWeeklyReports);
router.post('/weekly', controller.createWeeklyReport);

// 月报
router.get('/monthly', controller.getMonthlyReports);
router.post('/monthly', controller.createMonthlyReport);

// 团队报告（管理员）
router.get('/team', authorize('admin', 'manager'), controller.getTeamReports);

export default router;
