/**
 * 工作台服务
 */

import { prisma } from '../utils/prisma';

export interface OverviewData {
  projects: { active: number; completed: number; total: number };
  leads: { pending: number; following: number; converted: number; total: number };
  orders: { thisMonth: number; totalAmount: number };
  finance: { income: number; expense: number };
  tasks: { pending: number; inProgress: number; completed: number };
}

export interface KpiData {
  cac: number;  // 获客成本
  atv: number;  // 客单价
  roi: number;  // 投入产出比
  efficiency: number;  // 人效
}

export interface RecentActivity {
  type: 'lead' | 'order' | 'task' | 'project';
  title: string;
  description: string;
  time: Date;
  relatedId: number;
}

export class DashboardService {
  async getOverview(userId: number): Promise<OverviewData> {
    // 项目统计
    const [activeProjects, completedProjects] = await Promise.all([
      prisma.project.count({ where: { status: 'active' } }),
      prisma.project.count({ where: { status: 'completed' } })
    ]);

    // 线索统计
    const [pendingLeads, followingLeads, convertedLeads] = await Promise.all([
      prisma.lead.count({ where: { status: 'pending' } }),
      prisma.lead.count({ where: { status: 'following' } }),
      prisma.lead.count({ where: { status: 'converted' } })
    ]);

    // 本月订单
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: monthStart } },
      select: { amount: true }
    });
    const thisMonthOrders = orders.length;
    const totalOrderAmount = orders.reduce((sum, o) => sum + Number(o.amount), 0);

    // 财务统计（本月）
    const [incomeData, expenseData] = await Promise.all([
      prisma.payment.aggregate({
        where: { paidAt: { gte: monthStart } },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { status: 'paid', createdAt: { gte: monthStart } },
        _sum: { amount: true }
      })
    ]);

    // 任务统计
    const [pendingTasks, inProgressTasks, completedTasks] = await Promise.all([
      prisma.task.count({ where: { status: 'pending' } }),
      prisma.task.count({ where: { status: 'in_progress' } }),
      prisma.task.count({ where: { status: 'completed' } })
    ]);

    return {
      projects: {
        active: activeProjects,
        completed: completedProjects,
        total: activeProjects + completedProjects
      },
      leads: {
        pending: pendingLeads,
        following: followingLeads,
        converted: convertedLeads,
        total: pendingLeads + followingLeads + convertedLeads
      },
      orders: {
        thisMonth: thisMonthOrders,
        totalAmount: totalOrderAmount
      },
      finance: {
        income: Number(incomeData._sum.amount) || 0,
        expense: Number(expenseData._sum.amount) || 0
      },
      tasks: {
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks
      }
    };
  }

  async getMyTasks(userId: number, limit: number = 10): Promise<any[]> {
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { in: ['pending', 'in_progress'] }
      },
      take: limit,
      orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
      include: {
        project: { select: { name: true } }
      }
    });

    return tasks.map(t => ({
      id: t.id,
      title: t.title,
      projectName: t.project?.name,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate
    }));
  }

  async getMyProjects(userId: number, limit: number = 5): Promise<any[]> {
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      take: limit,
      include: {
        project: {
          select: { id: true, name: true, status: true, startDate: true, endDate: true }
        }
      }
    });

    return memberships.map(m => ({
      id: m.project.id,
      name: m.project.name,
      status: m.project.status,
      role: m.role,
      startDate: m.project.startDate,
      endDate: m.project.endDate
    }));
  }

  async getMyLeads(userId: number, limit: number = 10): Promise<any[]> {
    const leads = await prisma.lead.findMany({
      where: {
        assignedTo: userId,
        status: { in: ['pending', 'following'] }
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerName: true,
        phone: true,
        status: true,
        sourcePlatform: true,
        createdAt: true
      }
    });

    return leads.map(l => ({
      id: l.id,
      name: l.customerName,
      phone: l.phone,
      status: l.status,
      sourcePlatform: l.sourcePlatform,
      createdAt: l.createdAt
    }));
  }

  async getRecentActivities(userId: number, limit: number = 20): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // 获取最近的线索
    const recentLeads = await prisma.lead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, customerName: true, createdAt: true }
    });
    recentLeads.forEach(l => {
      activities.push({
        type: 'lead',
        title: '新线索',
        description: `线索 "${l.customerName || '未命名'}" 已创建`,
        time: l.createdAt,
        relatedId: l.id
      });
    });

    // 获取最近的订单
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, orderNo: true, amount: true, createdAt: true }
    });
    recentOrders.forEach(o => {
      activities.push({
        type: 'order',
        title: '新订单',
        description: `订单 ${o.orderNo} 金额 ¥${o.amount}`,
        time: o.createdAt,
        relatedId: o.id
      });
    });

    // 获取最近的任务更新
    const recentTasks = await prisma.task.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, status: true, updatedAt: true }
    });
    recentTasks.forEach(t => {
      activities.push({
        type: 'task',
        title: '任务更新',
        description: `任务 "${t.title}" 状态: ${t.status}`,
        time: t.updatedAt,
        relatedId: t.id
      });
    });

    // 按时间排序
    activities.sort((a, b) => b.time.getTime() - a.time.getTime());
    return activities.slice(0, limit);
  }

  async getKpi(): Promise<KpiData> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 本月广告支出
    const adExpense = await prisma.expense.aggregate({
      where: {
        category: 'ad_cost',
        status: 'paid',
        createdAt: { gte: monthStart }
      },
      _sum: { amount: true }
    });

    // 本月新增客户数
    const newCustomers = await prisma.customer.count({
      where: { createdAt: { gte: monthStart } }
    });

    // 本月订单统计
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: monthStart } },
      select: { amount: true }
    });
    const orderCount = orders.length;
    const totalAmount = orders.reduce((sum, o) => sum + Number(o.amount), 0);

    // 本月总支出
    const totalExpense = await prisma.expense.aggregate({
      where: { status: 'paid', createdAt: { gte: monthStart } },
      _sum: { amount: true }
    });

    // 计算指标
    const adCost = Number(adExpense._sum.amount) || 0;
    const expense = Number(totalExpense._sum.amount) || 1; // 避免除零

    return {
      cac: newCustomers > 0 ? Math.round(adCost / newCustomers) : 0,
      atv: orderCount > 0 ? Math.round(totalAmount / orderCount) : 0,
      roi: expense > 0 ? Math.round((totalAmount / expense) * 100) / 100 : 0,
      efficiency: totalAmount  // 简化处理：人效 = 总收入
    };
  }

  async getUnreadNotifications(userId: number, limit: number = 10): Promise<any[]> {
    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        createdAt: true
      }
    });

    return notifications;
  }
}

export const dashboardService = new DashboardService();
