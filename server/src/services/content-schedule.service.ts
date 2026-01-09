/**
 * 内容排期服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError } from '../types';

export interface ContentScheduleListItem {
  id: number;
  projectId: number | null;
  projectName?: string;
  accountId: number | null;
  accountName?: string;
  title: string;
  contentType: string;
  description: string | null;
  scheduledAt: Date;
  publishedAt: Date | null;
  status: string;
  assigneeId: number | null;
  assigneeName?: string;
  createdAt: Date;
}

export class ContentScheduleService {
  async findAll(params: {
    page?: number;
    pageSize?: number;
    projectId?: number;
    accountId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResult<ContentScheduleListItem>> {
    const { page = 1, pageSize = 20, projectId, accountId, status, startDate, endDate } = params;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (accountId) where.accountId = accountId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(startDate);
      if (endDate) where.scheduledAt.lte = new Date(endDate);
    }

    const total = await prisma.contentSchedule.count({ where });
    const schedules = await prisma.contentSchedule.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { scheduledAt: 'asc' },
      include: {
        project: { select: { name: true } },
        account: { select: { accountName: true } },
        assignee: { select: { name: true } }
      }
    });

    const items: ContentScheduleListItem[] = schedules.map(s => ({
      id: s.id,
      projectId: s.projectId,
      projectName: s.project?.name,
      accountId: s.accountId,
      accountName: s.account?.accountName,
      title: s.title,
      contentType: s.contentType,
      description: s.description,
      scheduledAt: s.scheduledAt,
      publishedAt: s.publishedAt,
      status: s.status,
      assigneeId: s.assigneeId,
      assigneeName: s.assignee?.name,
      createdAt: s.createdAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async getCalendar(year: number, month: number, projectId?: number): Promise<{ [date: string]: ContentScheduleListItem[] }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const where: any = {
      scheduledAt: { gte: startDate, lte: endDate }
    };
    if (projectId) where.projectId = projectId;

    const schedules = await prisma.contentSchedule.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      include: {
        project: { select: { name: true } },
        account: { select: { accountName: true } },
        assignee: { select: { name: true } }
      }
    });

    const calendar: { [date: string]: ContentScheduleListItem[] } = {};
    for (const s of schedules) {
      const dateKey = s.scheduledAt.toISOString().slice(0, 10);
      if (!calendar[dateKey]) calendar[dateKey] = [];
      calendar[dateKey].push({
        id: s.id,
        projectId: s.projectId,
        projectName: s.project?.name,
        accountId: s.accountId,
        accountName: s.account?.accountName,
        title: s.title,
        contentType: s.contentType,
        description: s.description,
        scheduledAt: s.scheduledAt,
        publishedAt: s.publishedAt,
        status: s.status,
        assigneeId: s.assigneeId,
        assigneeName: s.assignee?.name,
        createdAt: s.createdAt
      });
    }

    return calendar;
  }

  async findById(id: number): Promise<ContentScheduleListItem> {
    const schedule = await prisma.contentSchedule.findUnique({
      where: { id },
      include: {
        project: { select: { name: true } },
        account: { select: { accountName: true } },
        assignee: { select: { name: true } }
      }
    });

    if (!schedule) throw new NotFoundError('排期不存在');

    return {
      id: schedule.id,
      projectId: schedule.projectId,
      projectName: schedule.project?.name,
      accountId: schedule.accountId,
      accountName: schedule.account?.accountName,
      title: schedule.title,
      contentType: schedule.contentType,
      description: schedule.description,
      scheduledAt: schedule.scheduledAt,
      publishedAt: schedule.publishedAt,
      status: schedule.status,
      assigneeId: schedule.assigneeId,
      assigneeName: schedule.assignee?.name,
      createdAt: schedule.createdAt
    };
  }

  async create(data: {
    projectId?: number;
    accountId?: number;
    title: string;
    contentType: string;
    description?: string;
    scheduledAt: string;
    assigneeId?: number;
  }): Promise<ContentScheduleListItem> {
    const schedule = await prisma.contentSchedule.create({
      data: {
        projectId: data.projectId,
        accountId: data.accountId,
        title: data.title,
        contentType: data.contentType as any,
        description: data.description,
        scheduledAt: new Date(data.scheduledAt),
        assigneeId: data.assigneeId
      },
      include: {
        project: { select: { name: true } },
        account: { select: { accountName: true } },
        assignee: { select: { name: true } }
      }
    });

    return {
      id: schedule.id,
      projectId: schedule.projectId,
      projectName: schedule.project?.name,
      accountId: schedule.accountId,
      accountName: schedule.account?.accountName,
      title: schedule.title,
      contentType: schedule.contentType,
      description: schedule.description,
      scheduledAt: schedule.scheduledAt,
      publishedAt: schedule.publishedAt,
      status: schedule.status,
      assigneeId: schedule.assigneeId,
      assigneeName: schedule.assignee?.name,
      createdAt: schedule.createdAt
    };
  }

  async update(id: number, data: {
    title?: string;
    contentType?: string;
    description?: string;
    scheduledAt?: string;
    assigneeId?: number;
  }): Promise<ContentScheduleListItem> {
    const existing = await prisma.contentSchedule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('排期不存在');

    const schedule = await prisma.contentSchedule.update({
      where: { id },
      data: {
        title: data.title,
        contentType: data.contentType as any,
        description: data.description,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        assigneeId: data.assigneeId
      },
      include: {
        project: { select: { name: true } },
        account: { select: { accountName: true } },
        assignee: { select: { name: true } }
      }
    });

    return {
      id: schedule.id,
      projectId: schedule.projectId,
      projectName: schedule.project?.name,
      accountId: schedule.accountId,
      accountName: schedule.account?.accountName,
      title: schedule.title,
      contentType: schedule.contentType,
      description: schedule.description,
      scheduledAt: schedule.scheduledAt,
      publishedAt: schedule.publishedAt,
      status: schedule.status,
      assigneeId: schedule.assigneeId,
      assigneeName: schedule.assignee?.name,
      createdAt: schedule.createdAt
    };
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.contentSchedule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('排期不存在');
    await prisma.contentSchedule.delete({ where: { id } });
  }

  async updateStatus(id: number, status: string): Promise<ContentScheduleListItem> {
    const existing = await prisma.contentSchedule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('排期不存在');

    const updateData: any = { status: status as any };
    if (status === 'published') {
      updateData.publishedAt = new Date();
    }

    const schedule = await prisma.contentSchedule.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { name: true } },
        account: { select: { accountName: true } },
        assignee: { select: { name: true } }
      }
    });

    return {
      id: schedule.id,
      projectId: schedule.projectId,
      projectName: schedule.project?.name,
      accountId: schedule.accountId,
      accountName: schedule.account?.accountName,
      title: schedule.title,
      contentType: schedule.contentType,
      description: schedule.description,
      scheduledAt: schedule.scheduledAt,
      publishedAt: schedule.publishedAt,
      status: schedule.status,
      assigneeId: schedule.assigneeId,
      assigneeName: schedule.assignee?.name,
      createdAt: schedule.createdAt
    };
  }
}

export const contentScheduleService = new ContentScheduleService();
