/**
 * 预算管理服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError } from '../types';
import {
  BudgetQueryDto,
  BudgetListItemDto,
  BudgetUsageDto,
  BudgetAlertDto
} from '../types/dto/budget.dto';

export class BudgetService {
  async findAll(params: BudgetQueryDto): Promise<PaginatedResult<BudgetListItemDto>> {
    const { page = 1, pageSize = 20, projectId, status } = params;

    const where: any = {};
    if (projectId) where.projectId = projectId;

    const now = new Date();
    if (status === 'active') {
      where.status = 'active';
      where.endDate = { gte: now };
    } else if (status === 'expired') {
      where.OR = [
        { status: { not: 'active' } },
        { endDate: { lt: now } }
      ];
    }

    const total = await prisma.budget.count({ where });
    const budgets = await prisma.budget.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, name: true } }
      }
    });

    const items: BudgetListItemDto[] = budgets.map(b => {
      const plannedAmount = Number(b.plannedAmount);
      const usedAmount = Number(b.usedAmount);
      const remainingAmount = plannedAmount - usedAmount;
      const usageRate = plannedAmount > 0 ? Math.round((usedAmount / plannedAmount) * 100 * 100) / 100 : 0;
      const alertRate = Number(b.alertRate);

      return {
        id: b.id,
        projectId: b.projectId,
        project: b.project ? { id: b.project.id, name: b.project.name } : null,
        name: b.name,
        totalAmount: plannedAmount,
        usedAmount,
        period: b.category, // 使用 category 作为 period
        startDate: b.startDate,
        endDate: b.endDate,
        alertRate,
        description: null,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        remainingAmount,
        usageRate,
        isOverBudget: usedAmount > plannedAmount,
        isAlert: usageRate >= alertRate
      };
    });

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async findById(id: number): Promise<BudgetListItemDto> {
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } }
      }
    });

    if (!budget) throw new NotFoundError('预算不存在');

    const plannedAmount = Number(budget.plannedAmount);
    const usedAmount = Number(budget.usedAmount);
    const remainingAmount = plannedAmount - usedAmount;
    const usageRate = plannedAmount > 0 ? Math.round((usedAmount / plannedAmount) * 100 * 100) / 100 : 0;
    const alertRate = Number(budget.alertRate);

    return {
      id: budget.id,
      projectId: budget.projectId,
      project: budget.project ? { id: budget.project.id, name: budget.project.name } : null,
      name: budget.name,
      totalAmount: plannedAmount,
      usedAmount,
      period: budget.category,
      startDate: budget.startDate,
      endDate: budget.endDate,
      alertRate,
      description: null,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
      remainingAmount,
      usageRate,
      isOverBudget: usedAmount > plannedAmount,
      isAlert: usageRate >= alertRate
    };
  }

  async create(userId: number, data: {
    projectId?: number;
    category: string;
    name: string;
    plannedAmount: number;
    startDate: string;
    endDate: string;
    alertRate?: number;
  }): Promise<BudgetListItemDto> {
    const budget = await prisma.budget.create({
      data: {
        projectId: data.projectId,
        category: data.category as any,
        name: data.name,
        plannedAmount: data.plannedAmount,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        alertRate: data.alertRate || 80,
        createdBy: userId
      },
      include: {
        project: { select: { id: true, name: true } }
      }
    });

    const plannedAmount = Number(budget.plannedAmount);
    const usedAmount = Number(budget.usedAmount);

    return {
      id: budget.id,
      projectId: budget.projectId,
      project: budget.project ? { id: budget.project.id, name: budget.project.name } : null,
      name: budget.name,
      totalAmount: plannedAmount,
      usedAmount,
      period: budget.category,
      startDate: budget.startDate,
      endDate: budget.endDate,
      alertRate: Number(budget.alertRate),
      description: null,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
      remainingAmount: plannedAmount - usedAmount,
      usageRate: 0,
      isOverBudget: false,
      isAlert: false
    };
  }

  async update(id: number, data: {
    name?: string;
    plannedAmount?: number;
    startDate?: string;
    endDate?: string;
    alertRate?: number;
    status?: string;
  }): Promise<BudgetListItemDto> {
    const existing = await prisma.budget.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('预算不存在');

    const budget = await prisma.budget.update({
      where: { id },
      data: {
        name: data.name,
        plannedAmount: data.plannedAmount,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        alertRate: data.alertRate,
        status: data.status as any
      },
      include: {
        project: { select: { id: true, name: true } }
      }
    });

    const plannedAmount = Number(budget.plannedAmount);
    const usedAmount = Number(budget.usedAmount);
    const remainingAmount = plannedAmount - usedAmount;
    const usageRate = plannedAmount > 0 ? Math.round((usedAmount / plannedAmount) * 100 * 100) / 100 : 0;
    const alertRate = Number(budget.alertRate);

    return {
      id: budget.id,
      projectId: budget.projectId,
      project: budget.project ? { id: budget.project.id, name: budget.project.name } : null,
      name: budget.name,
      totalAmount: plannedAmount,
      usedAmount,
      period: budget.category,
      startDate: budget.startDate,
      endDate: budget.endDate,
      alertRate,
      description: null,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
      remainingAmount,
      usageRate,
      isOverBudget: usedAmount > plannedAmount,
      isAlert: usageRate >= alertRate
    };
  }

  async getUsage(id: number): Promise<BudgetUsageDto> {
    const budget = await this.findById(id);

    // 获取关联的支出记录
    const expenses = await prisma.expense.findMany({
      where: {
        projectId: budget.projectId,
        category: budget.period as any,
        status: { in: ['approved', 'paid'] },
        expenseDate: {
          gte: budget.startDate,
          lte: budget.endDate
        }
      },
      orderBy: { expenseDate: 'desc' }
    });

    // 按分类统计
    const categoryMap = new Map<string, number>();
    for (const e of expenses) {
      const amount = Number(e.amount);
      categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + amount);
    }

    const totalUsed = budget.usedAmount;
    const byCategory = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalUsed > 0 ? Math.round((amount / totalUsed) * 100 * 100) / 100 : 0
    }));

    return {
      budget,
      expenses: expenses.map(e => ({
        id: e.id,
        category: e.category,
        amount: Number(e.amount),
        description: e.description,
        status: e.status,
        createdAt: e.createdAt
      })),
      byCategory
    };
  }

  async getAlerts(): Promise<BudgetAlertDto[]> {
    const now = new Date();

    const budgets = await prisma.budget.findMany({
      where: {
        status: 'active',
        endDate: { gte: now }
      },
      include: {
        project: { select: { name: true } }
      }
    });

    const alerts: BudgetAlertDto[] = [];

    for (const b of budgets) {
      const plannedAmount = Number(b.plannedAmount);
      const usedAmount = Number(b.usedAmount);
      const usageRate = plannedAmount > 0 ? Math.round((usedAmount / plannedAmount) * 100 * 100) / 100 : 0;
      const alertRate = Number(b.alertRate);

      if (usageRate >= alertRate) {
        const daysRemaining = Math.ceil((b.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        alerts.push({
          id: b.id,
          name: b.name,
          projectName: b.project?.name || null,
          totalAmount: plannedAmount,
          usedAmount,
          usageRate,
          alertRate,
          remainingAmount: plannedAmount - usedAmount,
          endDate: b.endDate,
          daysRemaining
        });
      }
    }

    return alerts.sort((a, b) => b.usageRate - a.usageRate);
  }
}

export const budgetService = new BudgetService();
