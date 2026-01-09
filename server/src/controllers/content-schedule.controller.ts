/**
 * 内容排期控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { contentScheduleService } from '../services/content-schedule.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

// ==================== 排期 CRUD ====================

export const getSchedules = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
    accountId: req.query.accountId ? Number(req.query.accountId) : undefined,
    status: req.query.status as string | undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined
  };
  const result = await contentScheduleService.findAll(query);
  return paginated(res, result);
});

export const getCalendar = catchAsync(async (req: AuthRequest, res: Response) => {
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
  const month = req.query.month ? Number(req.query.month) : new Date().getMonth() + 1;
  const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
  const calendar = await contentScheduleService.getCalendar(year, month, projectId);
  return success(res, calendar);
});

export const getScheduleById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的排期ID');
  const schedule = await contentScheduleService.findById(id);
  return success(res, schedule);
});

export const createSchedule = catchAsync(async (req: AuthRequest, res: Response) => {
  const { title, contentType, scheduledAt } = req.body;
  if (!title) return badRequest(res, '标题不能为空');
  if (!contentType) return badRequest(res, '内容类型不能为空');
  if (!scheduledAt) return badRequest(res, '排期时间不能为空');
  const schedule = await contentScheduleService.create(req.body);
  return created(res, schedule, '排期创建成功');
});

export const updateSchedule = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的排期ID');
  const schedule = await contentScheduleService.update(id, req.body);
  return success(res, schedule, '排期更新成功');
});

export const deleteSchedule = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的排期ID');
  await contentScheduleService.delete(id);
  return success(res, null, '排期删除成功');
});

export const updateScheduleStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的排期ID');
  const { status } = req.body;
  if (!status) return badRequest(res, '状态不能为空');
  const schedule = await contentScheduleService.updateStatus(id, status);
  return success(res, schedule, '状态更新成功');
});
