/**
 * 支出管理服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError } from '../types';
import {
  ExpenseQueryDto,
  ExpenseListItemDto,
  ExpenseStatisticsDto
} from '../types/dto/expense.dto';

export class ExpenseService {
  async findAll(params: ExpenseQueryDto): Promise<PaginatedResult<ExpenseListItemDto>> {
    const { page = 1, pageSize = 20, projectId, category, status, applicantId, startDate, endDate } = params;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (category) where.category = category;
    if (status) where.status = status;
    if (applicantId) where.applicantId = applicantId;
    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) where.expenseDate.lte = new Date(endDate);
    }

    const total = await prisma.expense.count({ where });
    const expenses = await prisma.expense.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, name: true } },
        applicant: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } }
      }
    });

    const items: ExpenseListItemDto[] = expenses.map(e => ({
      id: e.id,
      projectId: e.projectId,
      project: e.project ? { id: e.project.id, name: e.project.name } : null,
      budgetId: null,
      budget: null,
      category: e.category,
      amount: Number(e.amount),
      description: e.description,
      attachments: e.attachments ? JSON.stringify(e.attachments) : null,
      status: e.status,
      applicantId: e.applicantId!,
      applicant: { id: e.applicant!.id, name: e.applicant!.name },
      approverId: e.approverId,
      approver: e.approver ? { id: e.approver.id, name: e.approver.name } : null,
      approvalNote: e.remark,
      approvedAt: e.approvedAt,
      expectedDate: e.expenseDate,
      paidAt: e.status === 'paid' ? e.approvedAt : null,
      createdAt: e.createdAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async findById(id: number): Promise<ExpenseListItemDto> {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        applicant: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } }
      }
    });

    if (!expense) throw new NotFoundError('支出记录不存在');

    return {
      id: expense.id,
      projectId: expense.projectId,
      project: expense.project ? { id: expense.project.id, name: expense.project.name } : null,
      budgetId: null,
      budget: null,
      category: expense.category,
      amount: Number(expense.amount),
      description: expense.description,
      attachments: expense.attachments ? JSON.stringify(expense.attachments) : null,
      status: expense.status,
      applicantId: expense.applicantId!,
      applicant: { id: expense.applicant!.id, name: expense.applicant!.name },
      approverId: expense.approverId,
      approver: expense.approver ? { id: expense.approver.id, name: expense.approver.name } : null,
      approvalNote: expense.remark,
      approvedAt: expense.approvedAt,
      expectedDate: expense.expenseDate,
      paidAt: expense.status === 'paid' ? expense.approvedAt : null,
      createdAt: expense.createdAt
    };
  }

  async create(userId: number, data: {
    projectId?: number;
    category: string;
    subCategory?: string;
    amount: number;
    description: string;
    expenseDate: string;
    attachments?: any;
    remark?: string;
  }): Promise<ExpenseListItemDto> {
    const expense = await prisma.expense.create({
      data: {
        projectId: data.projectId,
        category: data.category as any,
        subCategory: data.subCategory,
        amount: data.amount,
        description: data.description,
        expenseDate: new Date(data.expenseDate),
        attachments: data.attachments,
        applicantId: userId,
        remark: data.remark
      },
      include: {
        project: { select: { id: true, name: true } },
        applicant: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } }
      }
    });

    return {
      id: expense.id,
      projectId: expense.projectId,
      project: expense.project ? { id: expense.project.id, name: expense.project.name } : null,
      budgetId: null,
      budget: null,
      category: expense.category,
      amount: Number(expense.amount),
      description: expense.description,
      attachments: expense.attachments ? JSON.stringify(expense.attachments) : null,
      status: expense.status,
      applicantId: expense.applicantId!,
      applicant: { id: expense.applicant!.id, name: expense.applicant!.name },
      approverId: expense.approverId,
      approver: expense.approver ? { id: expense.approver.id, name: expense.approver.name } : null,
      approvalNote: expense.remark,
      approvedAt: expense.approvedAt,
      expectedDate: expense.expenseDate,
      paidAt: null,
      createdAt: expense.createdAt
    };
  }

  async update(id: number, data: {
    category?: string;
    subCategory?: string;
    amount?: number;
    description?: string;
    expenseDate?: string;
    attachments?: any;
    remark?: string;
  }): Promise<ExpenseListItemDto> {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('支出记录不存在');
    if (existing.status !== 'pending') {
      throw new Error('只能修改待审批的支出记录');
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        category: data.category as any,
        subCategory: data.subCategory,
        amount: data.amount,
        description: data.description,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : undefined,
        attachments: data.attachments,
        remark: data.remark
      },
      include: {
        project: { select: { id: true, name: true } },
        applicant: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } }
      }
    });

    return {
      id: expense.id,
      projectId: expense.projectId,
      project: expense.project ? { id: expense.project.id, name: expense.project.name } : null,
      budgetId: null,
      budget: null,
      category: expense.category,
      amount: Number(expense.amount),
      description: expense.description,
      attachments: expense.attachments ? JSON.stringify(expense.attachments) : null,
      status: expense.status,
      applicantId: expense.applicantId!,
      applicant: { id: expense.applicant!.id, name: expense.applicant!.name },
      approverId: expense.approverId,
      approver: expense.approver ? { id: expense.approver.id, name: expense.approver.name } : null,
      approvalNote: expense.remark,
      approvedAt: expense.approvedAt,
      expectedDate: expense.expenseDate,
      paidAt: null,
      createdAt: expense.createdAt
    };
  }

  async approve(id: number, approverId: number, status: 'approved' | 'rejected', remark?: string): Promise<ExpenseListItemDto> {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('支出记录不存在');
    if (existing.status !== 'pending') {
      throw new Error('该支出已审批');
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        status,
        approverId,
        approvedAt: new Date(),
        remark: remark || existing.remark
      },
      include: {
        project: { select: { id: true, name: true } },
        applicant: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } }
      }
    });

    // 如果审批通过，更新相关预算的已使用金额
    if (status === 'approved' && expense.projectId) {
      const budget = await prisma.budget.findFirst({
        where: {
          projectId: expense.projectId,
          category: expense.category,
          status: 'active',
          startDate: { lte: expense.expenseDate },
          endDate: { gte: expense.expenseDate }
        }
      });

      if (budget) {
        await prisma.budget.update({
          where: { id: budget.id },
          data: {
            usedAmount: { increment: Number(expense.amount) }
          }
        });
      }
    }

    return {
      id: expense.id,
      projectId: expense.projectId,
      project: expense.project ? { id: expense.project.id, name: expense.project.name } : null,
      budgetId: null,
      budget: null,
      category: expense.category,
      amount: Number(expense.amount),
      description: expense.description,
      attachments: expense.attachments ? JSON.stringify(expense.attachments) : null,
      status: expense.status,
      applicantId: expense.applicantId!,
      applicant: { id: expense.applicant!.id, name: expense.applicant!.name },
      approverId: expense.approverId,
      approver: expense.approver ? { id: expense.approver.id, name: expense.approver.name } : null,
      approvalNote: expense.remark,
      approvedAt: expense.approvedAt,
      expectedDate: expense.expenseDate,
      paidAt: null,
      createdAt: expense.createdAt
    };
  }

  async getStatistics(params?: { projectId?: number; startDate?: string; endDate?: string }): Promise<ExpenseStatisticsDto> {
    const where: any = {};
    if (params?.projectId) where.projectId = params.projectId;
    if (params?.startDate || params?.endDate) {
      where.expenseDate = {};
      if (params?.startDate) where.expenseDate.gte = new Date(params.startDate);
      if (params?.endDate) where.expenseDate.lte = new Date(params.endDate);
    }

    const expenses = await prisma.expense.findMany({ where });

    let totalAmount = 0;
    let pendingAmount = 0;
    let approvedAmount = 0;
    let paidAmount = 0;
    let rejectedAmount = 0;

    const categoryMap = new Map<string, { amount: number; count: number }>();
    const monthMap = new Map<string, number>();

    for (const e of expenses) {
      const amount = Number(e.amount);
      totalAmount += amount;

      switch (e.status) {
        case 'pending': pendingAmount += amount; break;
        case 'approved': approvedAmount += amount; break;
        case 'paid': paidAmount += amount; break;
        case 'rejected': rejectedAmount += amount; break;
      }

      // 按分类统计
      const cat = categoryMap.get(e.category) || { amount: 0, count: 0 };
      cat.amount += amount;
      cat.count++;
      categoryMap.set(e.category, cat);

      // 按月统计
      const month = e.expenseDate.toISOString().slice(0, 7);
      monthMap.set(month, (monthMap.get(month) || 0) + amount);
    }

    return {
      totalAmount,
      pendingAmount,
      approvedAmount,
      paidAmount,
      rejectedAmount,
      byCategory: Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count
      })),
      byMonth: Array.from(monthMap.entries())
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month))
    };
  }
}

export const expenseService = new ExpenseService();
