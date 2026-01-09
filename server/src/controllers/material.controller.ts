/**
 * 素材库控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { materialService } from '../services/material.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

// ==================== 素材 CRUD ====================

export const getMaterials = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    type: req.query.type as string | undefined,
    category: req.query.category as string | undefined,
    keyword: req.query.keyword as string | undefined
  };
  const result = await materialService.findAll(query);
  return paginated(res, result);
});

export const getMaterialById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的素材ID');
  const material = await materialService.findById(id);
  return success(res, material);
});

export const uploadMaterial = catchAsync(async (req: AuthRequest, res: Response) => {
  const { name, type, fileUrl } = req.body;
  if (!name) return badRequest(res, '素材名称不能为空');
  if (!type) return badRequest(res, '素材类型不能为空');
  if (!fileUrl) return badRequest(res, '文件URL不能为空');

  const material = await materialService.create({
    ...req.body,
    uploadedBy: req.user!.userId
  });
  return created(res, material, '素材上传成功');
});

export const updateMaterial = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的素材ID');
  const material = await materialService.update(id, req.body);
  return success(res, material, '素材更新成功');
});

export const deleteMaterial = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的素材ID');
  await materialService.delete(id);
  return success(res, null, '素材删除成功');
});

export const useMaterial = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的素材ID');
  await materialService.incrementUsage(id);
  return success(res, null, '使用记录已更新');
});

export const getCategories = catchAsync(async (req: AuthRequest, res: Response) => {
  const categories = await materialService.getCategories();
  return success(res, categories);
});
