/**
 * 自动化规则控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { automationService } from '../services/automation.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

export const getAutomations = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    triggerType: req.query.triggerType as any,
    actionType: req.query.actionType as any,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined
  };
  const result = await automationService.findAll(query);
  return paginated(res, result);
});

export const getAutomationById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的规则ID');
  const rule = await automationService.findById(id);
  return success(res, rule);
});

export const createAutomation = catchAsync(async (req: AuthRequest, res: Response) => {
  const { name, triggerType, triggerConfig, actionType, actionConfig } = req.body;
  if (!name) return badRequest(res, '规则名称不能为空');
  if (!triggerType) return badRequest(res, '触发类型不能为空');
  if (!triggerConfig) return badRequest(res, '触发配置不能为空');
  if (!actionType) return badRequest(res, '动作类型不能为空');
  if (!actionConfig) return badRequest(res, '动作配置不能为空');
  const rule = await automationService.create(req.user!.userId, req.body);
  return created(res, rule, '规则创建成功');
});

export const updateAutomation = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的规则ID');
  const rule = await automationService.update(id, req.body);
  return success(res, rule, '规则更新成功');
});

export const deleteAutomation = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的规则ID');
  await automationService.delete(id);
  return success(res, null, '规则删除成功');
});

export const toggleAutomation = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的规则ID');
  const rule = await automationService.toggle(id);
  return success(res, rule, rule.isActive ? '规则已启用' : '规则已禁用');
});

export const executeAutomation = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的规则ID');
  const log = await automationService.execute(id);
  return success(res, log, '规则执行完成');
});

export const getLogs = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的规则ID');
  const params = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20
  };
  const result = await automationService.getLogs(id, params);
  return paginated(res, result);
});
