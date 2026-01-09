/**
 * 通知系统服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError } from '../types';
import {
  NotificationQueryDto,
  NotificationListItemDto,
  UnreadCountDto,
  NotificationType
} from '../types/dto/notification.dto';
import { UserRole } from '@prisma/client';

export class NotificationService {
  // ==================== 用户通知管理 ====================

  async findAll(userId: number, params: NotificationQueryDto): Promise<PaginatedResult<NotificationListItemDto>> {
    const { page = 1, pageSize = 20, type, isRead } = params;

    const where: any = { userId };
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead;

    const total = await prisma.notification.count({ where });
    const notifications = await prisma.notification.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    });

    const items: NotificationListItemDto[] = notifications.map(n => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      title: n.title,
      content: n.content,
      isRead: n.isRead,
      relatedType: n.relatedType,
      relatedId: n.relatedId,
      createdAt: n.createdAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async getUnreadCount(userId: number): Promise<UnreadCountDto> {
    const unread = await prisma.notification.findMany({
      where: { userId, isRead: false },
      select: { type: true }
    });

    const total = unread.length;
    const typeMap = new Map<string, number>();
    for (const n of unread) {
      typeMap.set(n.type, (typeMap.get(n.type) || 0) + 1);
    }

    return {
      total,
      byType: Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }))
    };
  }

  async markAsRead(id: number, userId: number): Promise<NotificationListItemDto> {
    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) throw new NotFoundError('通知不存在');

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() }
    });

    return {
      id: updated.id,
      userId: updated.userId,
      type: updated.type,
      title: updated.title,
      content: updated.content,
      isRead: updated.isRead,
      relatedType: updated.relatedType,
      relatedId: updated.relatedId,
      createdAt: updated.createdAt
    };
  }

  async markAllAsRead(userId: number): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() }
    });
    return result.count;
  }

  async delete(id: number, userId: number): Promise<void> {
    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) throw new NotFoundError('通知不存在');

    await prisma.notification.delete({ where: { id } });
  }

  // ==================== 创建通知（供其他模块调用）====================

  async create(
    userId: number,
    type: NotificationType,
    title: string,
    content: string,
    relatedType?: string,
    relatedId?: number
  ): Promise<void> {
    await prisma.notification.create({
      data: {
        userId,
        type: type as any,
        title,
        content,
        relatedType,
        relatedId
      }
    });
  }

  async notifyUsers(
    userIds: number[],
    type: NotificationType,
    title: string,
    content: string,
    relatedType?: string,
    relatedId?: number
  ): Promise<void> {
    const data = userIds.map(userId => ({
      userId,
      type: type as any,
      title,
      content,
      relatedType,
      relatedId
    }));

    await prisma.notification.createMany({ data });
  }

  async notifyByRole(
    role: UserRole,
    type: NotificationType,
    title: string,
    content: string,
    relatedType?: string,
    relatedId?: number
  ): Promise<void> {
    const users = await prisma.user.findMany({
      where: { role, status: 1 },
      select: { id: true }
    });

    if (users.length > 0) {
      await this.notifyUsers(
        users.map(u => u.id),
        type,
        title,
        content,
        relatedType,
        relatedId
      );
    }
  }

  async notifyAll(
    type: NotificationType,
    title: string,
    content: string,
    relatedType?: string,
    relatedId?: number
  ): Promise<void> {
    const users = await prisma.user.findMany({
      where: { status: 1 },
      select: { id: true }
    });

    if (users.length > 0) {
      await this.notifyUsers(
        users.map(u => u.id),
        type,
        title,
        content,
        relatedType,
        relatedId
      );
    }
  }
}

export const notificationService = new NotificationService();
