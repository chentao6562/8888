/**
 * 公告路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as controller from '../controllers/announcement.controller';

const router = Router();

// 所有路由需要认证
router.use(authenticate);

// 公告 CRUD
router.get('/', controller.getAnnouncements);
router.get('/:id', controller.getAnnouncementById);
router.post('/', authorize('admin', 'manager'), controller.createAnnouncement);
router.put('/:id', authorize('admin', 'manager'), controller.updateAnnouncement);
router.delete('/:id', authorize('admin'), controller.deleteAnnouncement);

export default router;
