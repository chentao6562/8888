/**
 * 反馈服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError } from '../types';

export interface FeedbackItem {
  id: number;
  userId: number | null;
  userName?: string;
  category: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  status: string;
  reply: string | null;
  repliedAt: Date | null;
  createdAt: Date;
}

export class FeedbackService {
  async findAll(params: {
    page?: number;
    pageSize?: number;
    category?: string;
    status?: string;
    userId?: number;
  }): Promise<PaginatedResult<FeedbackItem>> {
    const { page = 1, pageSize = 20, category, status, userId } = params;

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const total = await prisma.feedback.count({ where });
    const feedbacks = await prisma.feedback.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });

    const items: FeedbackItem[] = feedbacks.map(f => ({
      id: f.id,
      userId: f.userId,
      userName: f.isAnonymous ? '匿名用户' : f.user?.name,
      category: f.category,
      title: f.title,
      content: f.content,
      isAnonymous: f.isAnonymous,
      status: f.status,
      reply: f.reply,
      repliedAt: f.repliedAt,
      createdAt: f.createdAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async findById(id: number): Promise<FeedbackItem> {
    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: { user: { select: { name: true } } }
    });

    if (!feedback) throw new NotFoundError('反馈不存在');

    return {
      id: feedback.id,
      userId: feedback.userId,
      userName: feedback.isAnonymous ? '匿名用户' : feedback.user?.name,
      category: feedback.category,
      title: feedback.title,
      content: feedback.content,
      isAnonymous: feedback.isAnonymous,
      status: feedback.status,
      reply: feedback.reply,
      repliedAt: feedback.repliedAt,
      createdAt: feedback.createdAt
    };
  }

  async create(userId: number, data: {
    category: string;
    title: string;
    content: string;
    isAnonymous?: boolean;
  }): Promise<FeedbackItem> {
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        category: data.category as any,
        title: data.title,
        content: data.content,
        isAnonymous: data.isAnonymous ?? false
      },
      include: { user: { select: { name: true } } }
    });

    return {
      id: feedback.id,
      userId: feedback.userId,
      userName: feedback.isAnonymous ? '匿名用户' : feedback.user?.name,
      category: feedback.category,
      title: feedback.title,
      content: feedback.content,
      isAnonymous: feedback.isAnonymous,
      status: feedback.status,
      reply: feedback.reply,
      repliedAt: feedback.repliedAt,
      createdAt: feedback.createdAt
    };
  }

  async reply(id: number, reply: string): Promise<FeedbackItem> {
    const existing = await prisma.feedback.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('反馈不存在');

    const feedback = await prisma.feedback.update({
      where: { id },
      data: {
        reply,
        repliedAt: new Date(),
        status: 'replied' as any
      },
      include: { user: { select: { name: true } } }
    });

    return {
      id: feedback.id,
      userId: feedback.userId,
      userName: feedback.isAnonymous ? '匿名用户' : feedback.user?.name,
      category: feedback.category,
      title: feedback.title,
      content: feedback.content,
      isAnonymous: feedback.isAnonymous,
      status: feedback.status,
      reply: feedback.reply,
      repliedAt: feedback.repliedAt,
      createdAt: feedback.createdAt
    };
  }
}

export const feedbackService = new FeedbackService();
