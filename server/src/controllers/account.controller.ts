/**
 * 账号管理控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { accountService } from '../services/account.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

export const getAccounts = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
    platform: req.query.platform as any,
    keyword: req.query.keyword as string | undefined,
    status: req.query.status !== undefined ? Number(req.query.status) : undefined
  };
  const result = await accountService.findAll(query);
  return paginated(res, result);
});

export const getAccountById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的账号ID');
  const account = await accountService.findById(id);
  return success(res, account);
});

export const createAccount = catchAsync(async (req: AuthRequest, res: Response) => {
  const { platform, accountName } = req.body;
  if (!platform || !accountName) return badRequest(res, '平台和账号名称不能为空');
  const account = await accountService.create(req.body);
  return created(res, account, '账号创建成功');
});

export const updateAccount = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的账号ID');
  const account = await accountService.update(id, req.body);
  return success(res, account, '账号更新成功');
});

export const deleteAccount = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的账号ID');
  await accountService.delete(id);
  return success(res, null, '账号删除成功');
});
