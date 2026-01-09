/**
 * 官网管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as controller from '../controllers/website.controller';

const router = Router();

// ==================== 公开接口（无需认证）====================
router.get('/public/banners', controller.getPublicBanners);
router.get('/public/cases', controller.getPublicCases);
router.get('/public/info', controller.getPublicInfo);

// ==================== 管理接口（需要认证）====================

// Banner 管理
router.get('/banners', authenticate, controller.getBanners);
router.post('/banners', authenticate, authorize('admin', 'manager'), controller.createBanner);
router.put('/banners/sort', authenticate, authorize('admin', 'manager'), controller.sortBanners);
router.put('/banners/:id', authenticate, authorize('admin', 'manager'), controller.updateBanner);
router.delete('/banners/:id', authenticate, authorize('admin', 'manager'), controller.deleteBanner);

// 案例管理
router.get('/cases', authenticate, controller.getCases);
router.post('/cases', authenticate, authorize('admin', 'manager'), controller.createCase);
router.put('/cases/:id', authenticate, authorize('admin', 'manager'), controller.updateCase);
router.delete('/cases/:id', authenticate, authorize('admin', 'manager'), controller.deleteCase);

// 公司信息管理
router.get('/info', authenticate, controller.getInfo);
router.put('/info/:key', authenticate, authorize('admin'), controller.updateInfo);

export default router;
