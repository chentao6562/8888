/**
 * AI 分析控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { aiService } from '../services/ai.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

export const getAnalyses = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    type: req.query.type as any
  };
  const result = await aiService.findAll(query);
  return paginated(res, result);
});

export const getAnalysisById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的分析ID');
  const analysis = await aiService.findById(id);
  return success(res, analysis);
});

export const trafficDiagnosis = catchAsync(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate } = req.body;
  if (!startDate || !endDate) return badRequest(res, '请选择分析日期范围');
  const analysis = await aiService.trafficDiagnosis(req.user!.userId, req.body);
  return created(res, analysis, '流量诊断完成');
});

export const contentSuggestion = catchAsync(async (req: AuthRequest, res: Response) => {
  const analysis = await aiService.contentSuggestion(req.user!.userId, req.body);
  return created(res, analysis, '内容建议生成完成');
});

export const salesAdvice = catchAsync(async (req: AuthRequest, res: Response) => {
  const analysis = await aiService.salesAdvice(req.user!.userId, req.body);
  return created(res, analysis, '销售建议生成完成');
});

export const projectReview = catchAsync(async (req: AuthRequest, res: Response) => {
  const { projectId } = req.body;
  if (!projectId) return badRequest(res, '请选择项目');
  const analysis = await aiService.projectReview(req.user!.userId, req.body);
  return created(res, analysis, '项目复盘完成');
});
