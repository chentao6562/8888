/**
 * 支出管理控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { expenseService } from '../services/expense.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

export const getExpenses = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
    category: req.query.category as any,
    status: req.query.status as any,
    applicantId: req.query.applicantId ? Number(req.query.applicantId) : undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined
  };
  const result = await expenseService.findAll(query);
  return paginated(res, result);
});

export const getExpenseById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的支出ID');
  const expense = await expenseService.findById(id);
  return success(res, expense);
});

export const createExpense = catchAsync(async (req: AuthRequest, res: Response) => {
  const { category, amount, description, expenseDate } = req.body;
  if (!category) return badRequest(res, '支出分类不能为空');
  if (!amount || amount <= 0) return badRequest(res, '支出金额必须大于0');
  if (!description) return badRequest(res, '支出说明不能为空');
  if (!expenseDate) return badRequest(res, '支出日期不能为空');

  const expense = await expenseService.create(req.user!.userId, req.body);
  return created(res, expense, '支出申请提交成功');
});

export const updateExpense = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的支出ID');
  const expense = await expenseService.update(id, req.body);
  return success(res, expense, '支出更新成功');
});

export const approveExpense = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的支出ID');
  const { status, remark } = req.body;
  if (!status || !['approved', 'rejected'].includes(status)) {
    return badRequest(res, '请选择审批结果');
  }
  const expense = await expenseService.approve(id, req.user!.userId, status, remark);
  return success(res, expense, status === 'approved' ? '审批通过' : '审批拒绝');
});

export const getStatistics = catchAsync(async (req: AuthRequest, res: Response) => {
  const params = {
    projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined
  };
  const statistics = await expenseService.getStatistics(params);
  return success(res, statistics);
});
