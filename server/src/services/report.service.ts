/**
 * 工作报告服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError, BusinessError } from '../types';

// ==================== 日报 ====================

export interface DailyReportItem {
  id: number;
  userId: number;
  userName?: string;
  reportDate: Date;
  todayWork: string;
  tomorrowPlan: string | null;
  problems: string | null;
  createdAt: Date;
}

// ==================== 周报 ====================

export interface WeeklyReportItem {
  id: number;
  userId: number;
  userName?: string;
  weekStart: Date;
  weekEnd: Date;
  summary: string;
  achievements: string | null;
  nextWeekPlan: string | null;
  problems: string | null;
  createdAt: Date;
}

// ==================== 月报 ====================

export interface MonthlyReportItem {
  id: number;
  userId: number;
  userName?: string;
  reportMonth: Date;
  summary: string;
  achievements: string | null;
  kpiCompletion: any;
  nextMonthPlan: string | null;
  problems: string | null;
  createdAt: Date;
}

export class ReportService {
  // ==================== 日报 ====================

  async getDailyReports(params: {
    page?: number;
    pageSize?: number;
    userId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResult<DailyReportItem>> {
    const { page = 1, pageSize = 20, userId, startDate, endDate } = params;

    const where: any = {};
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.reportDate = {};
      if (startDate) where.reportDate.gte = new Date(startDate);
      if (endDate) where.reportDate.lte = new Date(endDate);
    }

    const total = await prisma.dailyReport.count({ where });
    const reports = await prisma.dailyReport.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { reportDate: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });

    const items: DailyReportItem[] = reports.map(r => ({
      id: r.id,
      userId: r.userId,
      userName: r.user.name,
      reportDate: r.reportDate,
      todayWork: r.todayWork,
      tomorrowPlan: r.tomorrowPlan,
      problems: r.problems,
      createdAt: r.createdAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async getDailyReportById(id: number): Promise<DailyReportItem> {
    const report = await prisma.dailyReport.findUnique({
      where: { id },
      include: { user: { select: { name: true } } }
    });

    if (!report) throw new NotFoundError('日报不存在');

    return {
      id: report.id,
      userId: report.userId,
      userName: report.user.name,
      reportDate: report.reportDate,
      todayWork: report.todayWork,
      tomorrowPlan: report.tomorrowPlan,
      problems: report.problems,
      createdAt: report.createdAt
    };
  }

  async createDailyReport(userId: number, data: {
    reportDate: string;
    todayWork: string;
    tomorrowPlan?: string;
    problems?: string;
  }): Promise<DailyReportItem> {
    const date = new Date(data.reportDate);

    // 检查是否已提交
    const existing = await prisma.dailyReport.findUnique({
      where: { userId_reportDate: { userId, reportDate: date } }
    });
    if (existing) throw new BusinessError('该日期的日报已提交');

    const report = await prisma.dailyReport.create({
      data: {
        userId,
        reportDate: date,
        todayWork: data.todayWork,
        tomorrowPlan: data.tomorrowPlan,
        problems: data.problems
      },
      include: { user: { select: { name: true } } }
    });

    return {
      id: report.id,
      userId: report.userId,
      userName: report.user.name,
      reportDate: report.reportDate,
      todayWork: report.todayWork,
      tomorrowPlan: report.tomorrowPlan,
      problems: report.problems,
      createdAt: report.createdAt
    };
  }

  async updateDailyReport(id: number, userId: number, data: {
    todayWork?: string;
    tomorrowPlan?: string;
    problems?: string;
  }): Promise<DailyReportItem> {
    const existing = await prisma.dailyReport.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('日报不存在');
    if (existing.userId !== userId) throw new BusinessError('无权修改他人日报');

    const report = await prisma.dailyReport.update({
      where: { id },
      data: {
        todayWork: data.todayWork,
        tomorrowPlan: data.tomorrowPlan,
        problems: data.problems
      },
      include: { user: { select: { name: true } } }
    });

    return {
      id: report.id,
      userId: report.userId,
      userName: report.user.name,
      reportDate: report.reportDate,
      todayWork: report.todayWork,
      tomorrowPlan: report.tomorrowPlan,
      problems: report.problems,
      createdAt: report.createdAt
    };
  }

  // ==================== 周报 ====================

  async getWeeklyReports(params: {
    page?: number;
    pageSize?: number;
    userId?: number;
  }): Promise<PaginatedResult<WeeklyReportItem>> {
    const { page = 1, pageSize = 20, userId } = params;

    const where: any = {};
    if (userId) where.userId = userId;

    const total = await prisma.weeklyReport.count({ where });
    const reports = await prisma.weeklyReport.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { weekStart: 'desc' },
      include: { user: { select: { name: true } } }
    });

    const items: WeeklyReportItem[] = reports.map(r => ({
      id: r.id,
      userId: r.userId,
      userName: r.user.name,
      weekStart: r.weekStart,
      weekEnd: r.weekEnd,
      summary: r.summary,
      achievements: r.achievements,
      nextWeekPlan: r.nextWeekPlan,
      problems: r.problems,
      createdAt: r.createdAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async createWeeklyReport(userId: number, data: {
    weekStart: string;
    weekEnd: string;
    summary: string;
    achievements?: string;
    nextWeekPlan?: string;
    problems?: string;
  }): Promise<WeeklyReportItem> {
    const start = new Date(data.weekStart);

    // 检查是否已提交
    const existing = await prisma.weeklyReport.findUnique({
      where: { userId_weekStart: { userId, weekStart: start } }
    });
    if (existing) throw new BusinessError('该周的周报已提交');

    const report = await prisma.weeklyReport.create({
      data: {
        userId,
        weekStart: start,
        weekEnd: new Date(data.weekEnd),
        summary: data.summary,
        achievements: data.achievements,
        nextWeekPlan: data.nextWeekPlan,
        problems: data.problems
      },
      include: { user: { select: { name: true } } }
    });

    return {
      id: report.id,
      userId: report.userId,
      userName: report.user.name,
      weekStart: report.weekStart,
      weekEnd: report.weekEnd,
      summary: report.summary,
      achievements: report.achievements,
      nextWeekPlan: report.nextWeekPlan,
      problems: report.problems,
      createdAt: report.createdAt
    };
  }

  // ==================== 月报 ====================

  async getMonthlyReports(params: {
    page?: number;
    pageSize?: number;
    userId?: number;
  }): Promise<PaginatedResult<MonthlyReportItem>> {
    const { page = 1, pageSize = 20, userId } = params;

    const where: any = {};
    if (userId) where.userId = userId;

    const total = await prisma.monthlyReport.count({ where });
    const reports = await prisma.monthlyReport.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { reportMonth: 'desc' },
      include: { user: { select: { name: true } } }
    });

    const items: MonthlyReportItem[] = reports.map(r => ({
      id: r.id,
      userId: r.userId,
      userName: r.user.name,
      reportMonth: r.reportMonth,
      summary: r.summary,
      achievements: r.achievements,
      kpiCompletion: r.kpiCompletion,
      nextMonthPlan: r.nextMonthPlan,
      problems: r.problems,
      createdAt: r.createdAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async createMonthlyReport(userId: number, data: {
    reportMonth: string;
    summary: string;
    achievements?: string;
    kpiCompletion?: any;
    nextMonthPlan?: string;
    problems?: string;
  }): Promise<MonthlyReportItem> {
    const monthDate = new Date(data.reportMonth);

    // 检查是否已提交
    const existing = await prisma.monthlyReport.findUnique({
      where: { userId_reportMonth: { userId, reportMonth: monthDate } }
    });
    if (existing) throw new BusinessError('该月的月报已提交');

    const report = await prisma.monthlyReport.create({
      data: {
        userId,
        reportMonth: monthDate,
        summary: data.summary,
        achievements: data.achievements,
        kpiCompletion: data.kpiCompletion,
        nextMonthPlan: data.nextMonthPlan,
        problems: data.problems
      },
      include: { user: { select: { name: true } } }
    });

    return {
      id: report.id,
      userId: report.userId,
      userName: report.user.name,
      reportMonth: report.reportMonth,
      summary: report.summary,
      achievements: report.achievements,
      kpiCompletion: report.kpiCompletion,
      nextMonthPlan: report.nextMonthPlan,
      problems: report.problems,
      createdAt: report.createdAt
    };
  }

  // ==================== 团队报告 ====================

  async getTeamReports(managerId: number, type: 'daily' | 'weekly' | 'monthly', date?: string): Promise<any[]> {
    // 获取团队成员（简化处理：返回所有用户的报告）
    // 实际应该根据组织架构获取下属
    const params: any = { page: 1, pageSize: 100 };
    if (date) {
      if (type === 'daily') {
        params.startDate = date;
        params.endDate = date;
      }
    }

    if (type === 'daily') {
      const result = await this.getDailyReports(params);
      return result.items;
    } else if (type === 'weekly') {
      const result = await this.getWeeklyReports(params);
      return result.items;
    } else {
      const result = await this.getMonthlyReports(params);
      return result.items;
    }
  }
}

export const reportService = new ReportService();
