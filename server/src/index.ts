import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// 加载环境变量
dotenv.config();

// 初始化 Prisma 客户端
export const prisma = new PrismaClient();

// 创建 Express 应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: '公司管理系统 API'
  });
});

// API 路由
app.get('/api', (req, res) => {
  res.json({
    message: '欢迎使用公司管理系统 API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      projects: '/api/projects',
      indicators: '/api/indicators',
      accounts: '/api/accounts',
      traffic: '/api/traffic',
      leads: '/api/leads',
      reports: '/api/reports',
      feedback: '/api/feedback',
      website: '/api/website',
      ai: '/api/ai'
    }
  });
});

// TODO: 引入路由
// import authRoutes from './routes/auth';
// import userRoutes from './routes/users';
// import projectRoutes from './routes/projects';
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/projects', projectRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

async function main() {
  try {
    // 连接数据库
    await prisma.$connect();
    console.log('数据库连接成功');

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`API 文档: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
