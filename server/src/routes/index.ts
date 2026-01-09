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
      leads: '/api/leads'
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

// ==================== 注册路由 ====================

// P0 核心模块
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);

// P1 数据采集模块
router.use('/accounts', accountRoutes);
router.use('/traffic', trafficRoutes);
router.use('/leads', leadRoutes);

export default router;
