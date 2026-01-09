/**
 * 话术模板控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { scriptService } from '../services/script.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

// ==================== 话术 CRUD ====================

export const getScripts = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    category: req.query.category as string | undefined,
    scenario: req.query.scenario as string | undefined,
    keyword: req.query.keyword as string | undefined
  };
  const result = await scriptService.findAll(query);
  return paginated(res, result);
});

export const getScriptById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的话术ID');
  const script = await scriptService.findById(id);
  return success(res, script);
});

export const createScript = catchAsync(async (req: AuthRequest, res: Response) => {
  const { name, content } = req.body;
  if (!name) return badRequest(res, '话术名称不能为空');
  if (!content) return badRequest(res, '话术内容不能为空');

  const script = await scriptService.create({
    ...req.body,
    createdBy: req.user!.userId
  });
  return created(res, script, '话术创建成功');
});

export const updateScript = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的话术ID');
  const script = await scriptService.update(id, req.body);
  return success(res, script, '话术更新成功');
});

export const deleteScript = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的话术ID');
  await scriptService.delete(id);
  return success(res, null, '话术删除成功');
});

export const useScript = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的话术ID');
  await scriptService.incrementUsage(id);
  return success(res, null, '使用记录已更新');
});

export const getCategories = catchAsync(async (req: AuthRequest, res: Response) => {
  const categories = await scriptService.getCategories();
  return success(res, categories);
});
