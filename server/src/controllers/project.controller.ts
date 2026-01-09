/**
 * 项目管理控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { projectService } from '../services/project.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

/**
 * 获取项目列表
 * GET /api/projects
 */
export const getProjects = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    keyword: req.query.keyword as string | undefined,
    status: req.query.status as 'active' | 'completed' | 'paused' | undefined
  };

  const result = await projectService.findAll(query, req.user!.userId, req.user!.role);
  return paginated(res, result);
});

/**
 * 获取项目详情
 * GET /api/projects/:id
 */
export const getProjectById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的项目ID');

  const project = await projectService.findById(id, req.user!.userId, req.user!.role);
  return success(res, project);
});

/**
 * 创建项目
 * POST /api/projects
 */
export const createProject = catchAsync(async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name) return badRequest(res, '项目名称不能为空');

  const project = await projectService.create(req.body, req.user!.userId);
  return created(res, project, '项目创建成功');
});

/**
 * 更新项目
 * PUT /api/projects/:id
 */
export const updateProject = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的项目ID');

  const project = await projectService.update(id, req.body);
  return success(res, project, '项目更新成功');
});

/**
 * 删除项目
 * DELETE /api/projects/:id
 */
export const deleteProject = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的项目ID');

  await projectService.delete(id);
  return success(res, null, '项目删除成功');
});

/**
 * 添加成员
 * POST /api/projects/:id/members
 */
export const addMember = catchAsync(async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.id);
  if (isNaN(projectId)) return badRequest(res, '无效的项目ID');

  const { userId } = req.body;
  if (!userId) return badRequest(res, '用户ID不能为空');

  const member = await projectService.addMember(projectId, req.body);
  return created(res, member, '成员添加成功');
});

/**
 * 移除成员
 * DELETE /api/projects/:id/members/:userId
 */
export const removeMember = catchAsync(async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.id);
  const userId = Number(req.params.userId);
  if (isNaN(projectId) || isNaN(userId)) return badRequest(res, '无效的ID');

  await projectService.removeMember(projectId, userId);
  return success(res, null, '成员移除成功');
});

/**
 * 获取阶段列表
 * GET /api/projects/:id/stages
 */
export const getStages = catchAsync(async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.id);
  if (isNaN(projectId)) return badRequest(res, '无效的项目ID');

  const stages = await projectService.getStages(projectId);
  return success(res, stages);
});

/**
 * 创建阶段
 * POST /api/projects/:id/stages
 */
export const createStage = catchAsync(async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.id);
  if (isNaN(projectId)) return badRequest(res, '无效的项目ID');

  const { name } = req.body;
  if (!name) return badRequest(res, '阶段名称不能为空');

  const stage = await projectService.createStage(projectId, req.body);
  return created(res, stage, '阶段创建成功');
});

/**
 * 更新阶段
 * PUT /api/projects/:id/stages/:stageId
 */
export const updateStage = catchAsync(async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.id);
  const stageId = Number(req.params.stageId);
  if (isNaN(projectId) || isNaN(stageId)) return badRequest(res, '无效的ID');

  const stage = await projectService.updateStage(projectId, stageId, req.body);
  return success(res, stage, '阶段更新成功');
});

/**
 * 获取指标列表
 * GET /api/projects/:id/indicators
 */
export const getIndicators = catchAsync(async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.id);
  if (isNaN(projectId)) return badRequest(res, '无效的项目ID');

  const indicators = await projectService.getIndicators(projectId);
  return success(res, indicators);
});

/**
 * 创建指标
 * POST /api/projects/:id/indicators
 */
export const createIndicator = catchAsync(async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.id);
  if (isNaN(projectId)) return badRequest(res, '无效的项目ID');

  const { name, targetValue } = req.body;
  if (!name) return badRequest(res, '指标名称不能为空');
  if (targetValue === undefined) return badRequest(res, '目标值不能为空');

  const indicator = await projectService.createIndicator(projectId, req.body);
  return created(res, indicator, '指标创建成功');
});

/**
 * 更新指标
 * PUT /api/projects/:id/indicators/:indicatorId
 */
export const updateIndicator = catchAsync(async (req: AuthRequest, res: Response) => {
  const projectId = Number(req.params.id);
  const indicatorId = Number(req.params.indicatorId);
  if (isNaN(projectId) || isNaN(indicatorId)) return badRequest(res, '无效的ID');

  const indicator = await projectService.updateIndicator(projectId, indicatorId, req.body);
  return success(res, indicator, '指标更新成功');
});
