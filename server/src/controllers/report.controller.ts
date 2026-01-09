/**
 * 工作报告控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { reportService } from '../services/report.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

// ==================== 日报 ====================

export const getDailyReports = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    userId: req.query.userId ? Number(req.query.userId) : undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined
  };
  const result = await reportService.getDailyReports(query);
  return paginated(res, result);
});

export const getDailyReportById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的日报ID');
  const report = await reportService.getDailyReportById(id);
  return success(res, report);
});

export const createDailyReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const { reportDate, todayWork } = req.body;
  if (!reportDate) return badRequest(res, '报告日期不能为空');
  if (!todayWork) return badRequest(res, '今日工作不能为空');
  const report = await reportService.createDailyReport(req.user!.userId, req.body);
  return created(res, report, '日报提交成功');
});

export const updateDailyReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的日报ID');
  const report = await reportService.updateDailyReport(id, req.user!.userId, req.body);
  return success(res, report, '日报更新成功');
});

// ==================== 周报 ====================

export const getWeeklyReports = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    userId: req.query.userId ? Number(req.query.userId) : undefined
  };
  const result = await reportService.getWeeklyReports(query);
  return paginated(res, result);
});

export const createWeeklyReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const { weekStart, weekEnd, summary } = req.body;
  if (!weekStart) return badRequest(res, '周开始日期不能为空');
  if (!weekEnd) return badRequest(res, '周结束日期不能为空');
  if (!summary) return badRequest(res, '周总结不能为空');
  const report = await reportService.createWeeklyReport(req.user!.userId, req.body);
  return created(res, report, '周报提交成功');
});

// ==================== 月报 ====================

export const getMonthlyReports = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    userId: req.query.userId ? Number(req.query.userId) : undefined
  };
  const result = await reportService.getMonthlyReports(query);
  return paginated(res, result);
});

export const createMonthlyReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const { reportMonth, summary } = req.body;
  if (!reportMonth) return badRequest(res, '报告月份不能为空');
  if (!summary) return badRequest(res, '月总结不能为空');
  const report = await reportService.createMonthlyReport(req.user!.userId, req.body);
  return created(res, report, '月报提交成功');
});

// ==================== 团队报告 ====================

export const getTeamReports = catchAsync(async (req: AuthRequest, res: Response) => {
  const type = (req.query.type as 'daily' | 'weekly' | 'monthly') || 'daily';
  const date = req.query.date as string | undefined;
  const reports = await reportService.getTeamReports(req.user!.userId, type, date);
  return success(res, reports);
});
