/**
 * 预算管理控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { budgetService } from '../services/budget.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

export const getBudgets = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
    status: req.query.status as any
  };
  const result = await budgetService.findAll(query);
  return paginated(res, result);
});

export const getBudgetById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的预算ID');
  const budget = await budgetService.findById(id);
  return success(res, budget);
});

export const createBudget = catchAsync(async (req: AuthRequest, res: Response) => {
  const { category, name, plannedAmount, startDate, endDate } = req.body;
  if (!category) return badRequest(res, '预算分类不能为空');
  if (!name) return badRequest(res, '预算名称不能为空');
  if (!plannedAmount || plannedAmount <= 0) return badRequest(res, '预算金额必须大于0');
  if (!startDate || !endDate) return badRequest(res, '预算周期不能为空');

  const budget = await budgetService.create(req.user!.userId, req.body);
  return created(res, budget, '预算创建成功');
});

export const updateBudget = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的预算ID');
  const budget = await budgetService.update(id, req.body);
  return success(res, budget, '预算更新成功');
});

export const getUsage = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的预算ID');
  const usage = await budgetService.getUsage(id);
  return success(res, usage);
});

export const getAlerts = catchAsync(async (req: AuthRequest, res: Response) => {
  const alerts = await budgetService.getAlerts();
  return success(res, alerts);
});
