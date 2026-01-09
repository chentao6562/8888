/**
 * 公告服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError } from '../types';

export interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  isTop: boolean;
  publishedAt: Date | null;
  expiredAt: Date | null;
  createdAt: Date;
}

export class AnnouncementService {
  async findAll(params: {
    page?: number;
    pageSize?: number;
    onlyActive?: boolean;
  }): Promise<PaginatedResult<AnnouncementItem>> {
    const { page = 1, pageSize = 20, onlyActive } = params;

    const where: any = {};
    if (onlyActive) {
      const now = new Date();
      where.publishedAt = { lte: now };
      where.OR = [
        { expiredAt: null },
        { expiredAt: { gt: now } }
      ];
    }

    const total = await prisma.announcement.count({ where });
    const announcements = await prisma.announcement.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ isTop: 'desc' }, { createdAt: 'desc' }]
    });

    const items: AnnouncementItem[] = announcements.map(a => ({
      id: a.id,
      title: a.title,
      content: a.content,
      isTop: a.isTop,
      publishedAt: a.publishedAt,
      expiredAt: a.expiredAt,
      createdAt: a.createdAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async findById(id: number): Promise<AnnouncementItem> {
    const announcement = await prisma.announcement.findUnique({ where: { id } });

    if (!announcement) throw new NotFoundError('公告不存在');

    return {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      isTop: announcement.isTop,
      publishedAt: announcement.publishedAt,
      expiredAt: announcement.expiredAt,
      createdAt: announcement.createdAt
    };
  }

  async create(data: {
    title: string;
    content: string;
    isTop?: boolean;
    publishedAt?: string;
    expiredAt?: string;
  }): Promise<AnnouncementItem> {
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        isTop: data.isTop ?? false,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        expiredAt: data.expiredAt ? new Date(data.expiredAt) : null
      }
    });

    return {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      isTop: announcement.isTop,
      publishedAt: announcement.publishedAt,
      expiredAt: announcement.expiredAt,
      createdAt: announcement.createdAt
    };
  }

  async update(id: number, data: {
    title?: string;
    content?: string;
    isTop?: boolean;
    publishedAt?: string;
    expiredAt?: string;
  }): Promise<AnnouncementItem> {
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('公告不存在');

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        isTop: data.isTop,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
        expiredAt: data.expiredAt ? new Date(data.expiredAt) : undefined
      }
    });

    return {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      isTop: announcement.isTop,
      publishedAt: announcement.publishedAt,
      expiredAt: announcement.expiredAt,
      createdAt: announcement.createdAt
    };
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('公告不存在');
    await prisma.announcement.delete({ where: { id } });
  }
}

export const announcementService = new AnnouncementService();
