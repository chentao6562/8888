/**
 * 官网管理控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { websiteService } from '../services/website.service';
import { success, created, badRequest } from '../utils/response';
import { catchAsync } from '../middlewares';

// ==================== Banner ====================

export const getBanners = catchAsync(async (req: AuthRequest, res: Response) => {
  const banners = await websiteService.getBanners(false);
  return success(res, banners);
});

export const createBanner = catchAsync(async (req: AuthRequest, res: Response) => {
  const { title, imageUrl } = req.body;
  if (!title) return badRequest(res, 'Banner标题不能为空');
  if (!imageUrl) return badRequest(res, '图片URL不能为空');
  const banner = await websiteService.createBanner(req.body);
  return created(res, banner, 'Banner创建成功');
});

export const updateBanner = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的Banner ID');
  const banner = await websiteService.updateBanner(id, req.body);
  return success(res, banner, 'Banner更新成功');
});

export const deleteBanner = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的Banner ID');
  await websiteService.deleteBanner(id);
  return success(res, null, 'Banner删除成功');
});

export const sortBanners = catchAsync(async (req: AuthRequest, res: Response) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) return badRequest(res, '请提供Banner ID列表');
  await websiteService.sortBanners(ids);
  return success(res, null, '排序更新成功');
});

// ==================== 案例 ====================

export const getCases = catchAsync(async (req: AuthRequest, res: Response) => {
  const cases = await websiteService.getCases(false);
  return success(res, cases);
});

export const createCase = catchAsync(async (req: AuthRequest, res: Response) => {
  const { title } = req.body;
  if (!title) return badRequest(res, '案例标题不能为空');
  const caseItem = await websiteService.createCase(req.body);
  return created(res, caseItem, '案例创建成功');
});

export const updateCase = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的案例ID');
  const caseItem = await websiteService.updateCase(id, req.body);
  return success(res, caseItem, '案例更新成功');
});

export const deleteCase = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的案例ID');
  await websiteService.deleteCase(id);
  return success(res, null, '案例删除成功');
});

// ==================== 公司信息 ====================

export const getInfo = catchAsync(async (req: AuthRequest, res: Response) => {
  const info = await websiteService.getInfo();
  return success(res, info);
});

export const updateInfo = catchAsync(async (req: AuthRequest, res: Response) => {
  const { key } = req.params;
  const { value } = req.body;
  if (!key) return badRequest(res, '配置键不能为空');
  if (value === undefined) return badRequest(res, '配置值不能为空');
  await websiteService.updateInfo(key, value);
  return success(res, null, '配置更新成功');
});

// ==================== 公开接口 ====================

export const getPublicBanners = catchAsync(async (req: AuthRequest, res: Response) => {
  const banners = await websiteService.getBanners(true);
  return success(res, banners);
});

export const getPublicCases = catchAsync(async (req: AuthRequest, res: Response) => {
  const cases = await websiteService.getCases(true);
  return success(res, cases);
});

export const getPublicInfo = catchAsync(async (req: AuthRequest, res: Response) => {
  const info = await websiteService.getInfo();
  return success(res, info);
});
