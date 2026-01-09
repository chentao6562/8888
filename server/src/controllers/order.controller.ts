/**
 * 订单与回款控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { orderService } from '../services/order.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

// ==================== 订单 CRUD ====================

export const getOrders = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    projectId: req.query.projectId ? Number(req.query.projectId) : undefined,
    customerId: req.query.customerId ? Number(req.query.customerId) : undefined,
    salesId: req.query.salesId ? Number(req.query.salesId) : undefined,
    paymentStatus: req.query.paymentStatus as any,
    status: req.query.status as any,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined
  };
  const result = await orderService.findAll(query);
  return paginated(res, result);
});

export const getOrderById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的订单ID');
  const order = await orderService.findById(id);
  return success(res, order);
});

export const createOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const { productName, amount } = req.body;
  if (!productName) return badRequest(res, '产品名称不能为空');
  if (!amount || amount <= 0) return badRequest(res, '订单金额必须大于0');
  const order = await orderService.create(req.body);
  return created(res, order, '订单创建成功');
});

export const updateOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的订单ID');
  const order = await orderService.update(id, req.body);
  return success(res, order, '订单更新成功');
});

export const deleteOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的订单ID');
  await orderService.delete(id);
  return success(res, null, '订单删除成功');
});

export const updateStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的订单ID');
  const { status } = req.body;
  if (!status) return badRequest(res, '状态不能为空');
  const order = await orderService.updateStatus(id, status);
  return success(res, order, '状态更新成功');
});

// ==================== 回款管理 ====================

export const addPayment = catchAsync(async (req: AuthRequest, res: Response) => {
  const orderId = Number(req.params.id);
  if (isNaN(orderId)) return badRequest(res, '无效的订单ID');
  const { amount, paymentMethod, paidAt } = req.body;
  if (!amount || amount <= 0) return badRequest(res, '回款金额必须大于0');
  if (!paymentMethod) return badRequest(res, '请选择支付方式');
  if (!paidAt) return badRequest(res, '请选择回款日期');
  const payment = await orderService.addPayment(orderId, req.user!.userId, req.body);
  return created(res, payment, '回款记录添加成功');
});

export const getPayments = catchAsync(async (req: AuthRequest, res: Response) => {
  const orderId = Number(req.params.id);
  if (isNaN(orderId)) return badRequest(res, '无效的订单ID');
  const payments = await orderService.getPayments(orderId);
  return success(res, payments);
});

// ==================== 统计 ====================

export const getStatistics = catchAsync(async (req: AuthRequest, res: Response) => {
  const params = {
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined
  };
  const statistics = await orderService.getStatistics(params);
  return success(res, statistics);
});
