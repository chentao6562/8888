/**
 * 反馈控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { feedbackService } from '../services/feedback.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

export const getFeedbacks = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    category: req.query.category as string | undefined,
    status: req.query.status as string | undefined,
    userId: req.query.userId ? Number(req.query.userId) : undefined
  };
  const result = await feedbackService.findAll(query);
  return paginated(res, result);
});

export const getFeedbackById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的反馈ID');
  const feedback = await feedbackService.findById(id);
  return success(res, feedback);
});

export const createFeedback = catchAsync(async (req: AuthRequest, res: Response) => {
  const { category, title, content } = req.body;
  if (!category) return badRequest(res, '反馈类别不能为空');
  if (!title) return badRequest(res, '反馈标题不能为空');
  if (!content) return badRequest(res, '反馈内容不能为空');
  const feedback = await feedbackService.create(req.user!.userId, req.body);
  return created(res, feedback, '反馈提交成功');
});

export const replyFeedback = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的反馈ID');
  const { reply } = req.body;
  if (!reply) return badRequest(res, '回复内容不能为空');
  const feedback = await feedbackService.reply(id, reply);
  return success(res, feedback, '回复成功');
});
