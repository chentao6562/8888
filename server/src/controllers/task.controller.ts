/**
 * 任务管理控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { taskService } from '../services/task.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

export const getTasks = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
    assigneeId: req.query.assigneeId ? Number(req.query.assigneeId) : undefined,
    status: req.query.status as any,
    priority: req.query.priority as any,
    keyword: req.query.keyword as string | undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined
  };
  const result = await taskService.findAll(query);
  return paginated(res, result);
});

export const getMyTasks = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    status: req.query.status as any,
    priority: req.query.priority as any
  };
  const result = await taskService.findMyTasks(req.user!.userId, query);
  return paginated(res, result);
});

export const getTaskById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的任务ID');
  const task = await taskService.findById(id);
  return success(res, task);
});

export const createTask = catchAsync(async (req: AuthRequest, res: Response) => {
  const { title } = req.body;
  if (!title) return badRequest(res, '任务标题不能为空');
  const task = await taskService.create(req.user!.userId, req.body);
  return created(res, task, '任务创建成功');
});

export const updateTask = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的任务ID');
  const task = await taskService.update(id, req.body);
  return success(res, task, '任务更新成功');
});

export const deleteTask = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的任务ID');
  await taskService.delete(id);
  return success(res, null, '任务删除成功');
});

export const updateStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的任务ID');
  const { status } = req.body;
  if (!status) return badRequest(res, '状态不能为空');
  const task = await taskService.updateStatus(id, status);
  return success(res, task, '状态更新成功');
});

export const addComment = catchAsync(async (req: AuthRequest, res: Response) => {
  const taskId = Number(req.params.id);
  if (isNaN(taskId)) return badRequest(res, '无效的任务ID');
  const { content } = req.body;
  if (!content) return badRequest(res, '评论内容不能为空');
  const comment = await taskService.addComment(taskId, req.user!.userId, req.body);
  return created(res, comment, '评论添加成功');
});

export const getComments = catchAsync(async (req: AuthRequest, res: Response) => {
  const taskId = Number(req.params.id);
  if (isNaN(taskId)) return badRequest(res, '无效的任务ID');
  const comments = await taskService.getComments(taskId);
  return success(res, comments);
});

export const getSubtasks = catchAsync(async (req: AuthRequest, res: Response) => {
  const taskId = Number(req.params.id);
  if (isNaN(taskId)) return badRequest(res, '无效的任务ID');
  const subtasks = await taskService.getSubtasks(taskId);
  return success(res, subtasks);
});
