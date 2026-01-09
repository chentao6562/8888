/**
 * 线索管理控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { leadService } from '../services/lead.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

export const getLeads = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
    status: req.query.status as any,
    sourcePlatform: req.query.sourcePlatform as any,
    assignedTo: req.query.assignedTo ? Number(req.query.assignedTo) : undefined,
    keyword: req.query.keyword as string | undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined
  };
  const result = await leadService.findAll(query);
  return paginated(res, result);
});

export const getLeadById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的线索ID');
  const lead = await leadService.findById(id);
  return success(res, lead);
});

export const createLead = catchAsync(async (req: AuthRequest, res: Response) => {
  const { sourcePlatform, sourceType } = req.body;
  if (!sourcePlatform || !sourceType) return badRequest(res, '来源平台和来源类型不能为空');
  const lead = await leadService.create(req.body);
  return created(res, lead, '线索创建成功');
});

export const updateLead = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的线索ID');
  const lead = await leadService.update(id, req.body);
  return success(res, lead, '线索更新成功');
});

export const deleteLead = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的线索ID');
  await leadService.delete(id);
  return success(res, null, '线索删除成功');
});

export const addLog = catchAsync(async (req: AuthRequest, res: Response) => {
  const leadId = Number(req.params.id);
  if (isNaN(leadId)) return badRequest(res, '无效的线索ID');
  const { content } = req.body;
  if (!content) return badRequest(res, '跟进内容不能为空');
  const log = await leadService.addLog(leadId, req.user!.userId, req.body);
  return created(res, log, '跟进记录添加成功');
});

export const getLogs = catchAsync(async (req: AuthRequest, res: Response) => {
  const leadId = Number(req.params.id);
  if (isNaN(leadId)) return badRequest(res, '无效的线索ID');
  const logs = await leadService.getLogs(leadId);
  return success(res, logs);
});

export const assignLead = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的线索ID');
  const { assignedTo } = req.body;
  if (!assignedTo) return badRequest(res, '请选择负责人');
  const lead = await leadService.assign(id, assignedTo);
  return success(res, lead, '分配成功');
});

export const updateStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的线索ID');
  const { status } = req.body;
  if (!status) return badRequest(res, '状态不能为空');
  const lead = await leadService.updateStatus(id, status);
  return success(res, lead, '状态更新成功');
});

export const getFunnel = catchAsync(async (req: AuthRequest, res: Response) => {
  const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
  const funnel = await leadService.getFunnel(projectId);
  return success(res, funnel);
});
