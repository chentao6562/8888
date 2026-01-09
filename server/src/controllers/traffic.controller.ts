/**
 * 流量数据控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { trafficService } from '../services/traffic.service';
import { success, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

export const getTrafficData = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    accountId: req.query.accountId ? Number(req.query.accountId) : undefined,
    projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
    platform: req.query.platform as string | undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined
  };
  const result = await trafficService.findAll(query);
  return paginated(res, result);
});

export const getDashboard = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    accountId: req.query.accountId ? Number(req.query.accountId) : undefined,
    projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
    platform: req.query.platform as string | undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined
  };
  const result = await trafficService.getDashboard(query);
  return success(res, result);
});

export const getTrend = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    accountId: req.query.accountId ? Number(req.query.accountId) : undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    groupBy: (req.query.groupBy as 'day' | 'week' | 'month') || 'day'
  };
  const result = await trafficService.getTrend(query);
  return success(res, result);
});

export const importTrafficData = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.file) return badRequest(res, '请上传文件');
  const accountId = Number(req.body.accountId);
  if (!accountId) return badRequest(res, '请选择账号');

  const result = await trafficService.importFromExcel(req.file, accountId, req.user!.userId);
  return success(res, result, `导入完成：成功 ${result.successRows} 条，失败 ${result.failedRows} 条`);
});

/**
 * 智能CSV导入 - 自动识别账号和平台
 */
export const importCSV = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.file) return badRequest(res, '请上传CSV文件');

  const projectId = req.body.projectId ? Number(req.body.projectId) : null;

  const result = await trafficService.importFromCSV(req.file, projectId, req.user!.userId);
  return success(res, result, `导入完成：成功 ${result.successRows} 条，失败 ${result.failedRows} 条`);
});

export const getImportRecords = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20
  };
  const result = await trafficService.getImportRecords(query);
  return paginated(res, result);
});
