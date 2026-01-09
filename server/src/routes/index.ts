/**
 * 路由注册器
 * 集中管理所有 API 路由
 */

import { Router } from 'express';

const router = Router();

// ==================== API 信息 ====================
router.get('/', (req, res) => {
  res.json({
    message: '欢迎使用公司管理系统 API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects',
      accounts: '/api/accounts',
      traffic: '/api/traffic',
      leads: '/api/leads',
      customers: '/api/customers',
      orders: '/api/orders',
      expenses: '/api/expenses',
      budgets: '/api/budgets',
      tasks: '/api/tasks',
      notifications: '/api/notifications',
      ai: '/api/ai',
      automations: '/api/automations',
      contentSchedules: '/api/content-schedules',
      materials: '/api/materials',
      scripts: '/api/scripts',
      website: '/api/website',
      reports: '/api/reports',
      feedbacks: '/api/feedbacks',
      announcements: '/api/announcements',
      dashboard: '/api/dashboard'
    }
  });
});

// ==================== 健康检查 ====================
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: '公司管理系统 API'
  });
});

// ==================== 模块路由 ====================

// P0 核心模块
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';

// P1 数据采集模块
import accountRoutes from './account.routes';
import trafficRoutes from './traffic.routes';
import leadRoutes from './lead.routes';

// P2 业务增强模块
// import customerRoutes from './customer.routes';
// import orderRoutes from './order.routes';
// import expenseRoutes from './expense.routes';
// import budgetRoutes from './budget.routes';
// import taskRoutes from './task.routes';
// import notificationRoutes from './notification.routes';

// P3 高级功能模块
// import aiRoutes from './ai.routes';
// import automationRoutes from './automation.routes';
// import contentScheduleRoutes from './content-schedule.routes';
// import materialRoutes from './material.routes';
// import scriptRoutes from './script.routes';
// import websiteRoutes from './website.routes';

// 辅助功能模块
// import reportRoutes from './report.routes';
// import feedbackRoutes from './feedback.routes';
// import announcementRoutes from './announcement.routes';
// import dashboardRoutes from './dashboard.routes';

// ==================== 注册路由 ====================

// P0 核心模块
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);

// P1 数据采集模块
router.use('/accounts', accountRoutes);
router.use('/traffic', trafficRoutes);
router.use('/leads', leadRoutes);

// P2 业务增强模块
// router.use('/customers', customerRoutes);
// router.use('/orders', orderRoutes);
// router.use('/expenses', expenseRoutes);
// router.use('/budgets', budgetRoutes);
// router.use('/tasks', taskRoutes);
// router.use('/notifications', notificationRoutes);

// P3 高级功能模块
// router.use('/ai', aiRoutes);
// router.use('/automations', automationRoutes);
// router.use('/content-schedules', contentScheduleRoutes);
// router.use('/materials', materialRoutes);
// router.use('/scripts', scriptRoutes);
// router.use('/website', websiteRoutes);

// 辅助功能模块
// router.use('/reports', reportRoutes);
// router.use('/feedbacks', feedbackRoutes);
// router.use('/announcements', announcementRoutes);
// router.use('/dashboard', dashboardRoutes);

export default router;
