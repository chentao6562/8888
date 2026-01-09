/**
 * 公告控制器
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import { announcementService } from '../services/announcement.service';
import { success, created, badRequest, paginated } from '../utils/response';
import { catchAsync } from '../middlewares';

export const getAnnouncements = catchAsync(async (req: AuthRequest, res: Response) => {
  const query = {
    page: req.query.page ? Number(req.query.page) : 1,
    pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    onlyActive: req.query.onlyActive === 'true'
  };
  const result = await announcementService.findAll(query);
  return paginated(res, result);
});

export const getAnnouncementById = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的公告ID');
  const announcement = await announcementService.findById(id);
  return success(res, announcement);
});

export const createAnnouncement = catchAsync(async (req: AuthRequest, res: Response) => {
  const { title, content } = req.body;
  if (!title) return badRequest(res, '公告标题不能为空');
  if (!content) return badRequest(res, '公告内容不能为空');
  const announcement = await announcementService.create(req.body);
  return created(res, announcement, '公告发布成功');
});

export const updateAnnouncement = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的公告ID');
  const announcement = await announcementService.update(id, req.body);
  return success(res, announcement, '公告更新成功');
});

export const deleteAnnouncement = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return badRequest(res, '无效的公告ID');
  await announcementService.delete(id);
  return success(res, null, '公告删除成功');
});
