/**
 * 客户管理控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { customerService } from '../services/customer.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

// ==================== 客户 CRUD ====================

export const getCustomers = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    keyword: req.query.keyword as string | undefined,
    level: req.query.level as any,
    assignedTo: req.query.assignedTo ? Number(req.query.assignedTo) : undefined,
    tagId: req.query.tagId ? Number(req.query.tagId) : undefined
  };
  const result = await customerService.findAll(query);
  return paginated(res, result);
});

export const getCustomerById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的客户ID');
  const customer = await customerService.findById(id);
  return success(res, customer);
});

export const createCustomer = catchAsync(async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name) return badRequest(res, '客户名称不能为空');
  const customer = await customerService.create(req.body);
  return created(res, customer, '客户创建成功');
});

export const updateCustomer = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的客户ID');
  const customer = await customerService.update(id, req.body);
  return success(res, customer, '客户更新成功');
});

export const deleteCustomer = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的客户ID');
  await customerService.delete(id);
  return success(res, null, '客户删除成功');
});

// ==================== 跟进记录 ====================

export const addFollowLog = catchAsync(async (req: AuthRequest, res: Response) => {
  const customerId = Number(req.params.id);
  if (isNaN(customerId)) return badRequest(res, '无效的客户ID');
  const { type, content } = req.body;
  if (!type || !content) return badRequest(res, '跟进类型和内容不能为空');
  const log = await customerService.addFollowLog(customerId, req.user!.userId, req.body);
  return created(res, log, '跟进记录添加成功');
});

export const getFollowLogs = catchAsync(async (req: AuthRequest, res: Response) => {
  const customerId = Number(req.params.id);
  if (isNaN(customerId)) return badRequest(res, '无效的客户ID');
  const logs = await customerService.getFollowLogs(customerId);
  return success(res, logs);
});

// ==================== 标签关联 ====================

export const addTag = catchAsync(async (req: AuthRequest, res: Response) => {
  const customerId = Number(req.params.id);
  if (isNaN(customerId)) return badRequest(res, '无效的客户ID');
  const { tagId } = req.body;
  if (!tagId) return badRequest(res, '请选择标签');
  await customerService.addTag(customerId, tagId);
  return success(res, null, '标签添加成功');
});

export const removeTag = catchAsync(async (req: AuthRequest, res: Response) => {
  const customerId = Number(req.params.id);
  const tagId = Number(req.params.tagId);
  if (isNaN(customerId) || isNaN(tagId)) return badRequest(res, '无效的ID');
  await customerService.removeTag(customerId, tagId);
  return success(res, null, '标签移除成功');
});

// ==================== 标签 CRUD ====================

export const getTags = catchAsync(async (req: AuthRequest, res: Response) => {
  const category = req.query.category as string | undefined;
  const tags = await customerService.getTags(category);
  return success(res, tags);
});

export const createTag = catchAsync(async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name) return badRequest(res, '标签名称不能为空');
  const tag = await customerService.createTag(req.body);
  return created(res, tag, '标签创建成功');
});

export const updateTag = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的标签ID');
  const tag = await customerService.updateTag(id, req.body);
  return success(res, tag, '标签更新成功');
});

export const deleteTag = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的标签ID');
  await customerService.deleteTag(id);
  return success(res, null, '标签删除成功');
});
