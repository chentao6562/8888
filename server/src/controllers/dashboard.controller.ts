/**
 * 工作台控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { dashboardService } from '../services/dashboard.service';
import { success } from '../utils/response';
import { catchAsync } from '../middlewares';

export const getOverview = catchAsync(async (req: AuthRequest, res: Response) => {
  const overview = await dashboardService.getOverview(req.user!.userId);
  return success(res, overview);
});

export const getMyTasks = catchAsync(async (req: AuthRequest, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const tasks = await dashboardService.getMyTasks(req.user!.userId, limit);
  return success(res, tasks);
});

export const getMyProjects = catchAsync(async (req: AuthRequest, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 5;
  const projects = await dashboardService.getMyProjects(req.user!.userId, limit);
  return success(res, projects);
});

export const getMyLeads = catchAsync(async (req: AuthRequest, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const leads = await dashboardService.getMyLeads(req.user!.userId, limit);
  return success(res, leads);
});

export const getRecentActivities = catchAsync(async (req: AuthRequest, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const activities = await dashboardService.getRecentActivities(req.user!.userId, limit);
  return success(res, activities);
});

export const getKpi = catchAsync(async (req: AuthRequest, res: Response) => {
  const kpi = await dashboardService.getKpi();
  return success(res, kpi);
});

export const getUnreadNotifications = catchAsync(async (req: AuthRequest, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const notifications = await dashboardService.getUnreadNotifications(req.user!.userId, limit);
  return success(res, notifications);
});
