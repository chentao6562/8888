/**
 * 内容排期路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as controller from '../controllers/content-schedule.controller';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 排期 CRUD
router.get('/', controller.getSchedules);
router.get('/calendar', controller.getCalendar);
router.get('/:id', controller.getScheduleById);
router.post('/', authorize('admin', 'manager', 'operator'), controller.createSchedule);
router.put('/:id', authorize('admin', 'manager', 'operator'), controller.updateSchedule);
router.delete('/:id', authorize('admin', 'manager'), controller.deleteSchedule);
router.patch('/:id/status', authorize('admin', 'manager', 'operator'), controller.updateScheduleStatus);

export default router;
