/**
 * 通知系统控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { notificationService } from '../services/notification.service';
import { success, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

export const getNotifications = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    type: req.query.type as any,
    isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined
  };
  const result = await notificationService.findAll(req.user!.userId, query);
  return paginated(res, result);
});

export const getUnreadCount = catchAsync(async (req: AuthRequest, res: Response) => {
  const count = await notificationService.getUnreadCount(req.user!.userId);
  return success(res, count);
});

export const markAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的通知ID');
  const notification = await notificationService.markAsRead(id, req.user!.userId);
  return success(res, notification, '已标记为已读');
});

export const markAllAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
  const count = await notificationService.markAllAsRead(req.user!.userId);
  return success(res, { count }, `已将 ${count} 条通知标记为已读`);
});

export const deleteNotification = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的通知ID');
  await notificationService.delete(id, req.user!.userId);
  return success(res, null, '通知已删除');
});
