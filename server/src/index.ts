/**
 * 公司管理系统 - 后端 API 服务
 * 入口文件
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 导入工具和中间件
import { prisma, connectDatabase, disconnectDatabase } from './utils';
import { globalErrorHandler, notFoundHandler } from './middlewares';
import routes from './routes';

// 创建 Express 应用
const app = express();

// ==================== 基础中间件 ====================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志（开发环境）
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ==================== API 路由 ====================
app.use('/api', routes);

// ==================== 错误处理 ====================
// 404 处理
app.use(notFoundHandler);

// 全局错误处理
app.use(globalErrorHandler);

// ==================== 启动服务器 ====================
const PORT = process.env.PORT || 3000;

async function main() {
  try {
    // 连接数据库
    await connectDatabase();

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`========================================`);
      console.log(`🚀 公司管理系统 API 服务已启动`);
      console.log(`📡 服务地址: http://localhost:${PORT}`);
      console.log(`📖 API 文档: http://localhost:${PORT}/api`);
      console.log(`🏥 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`========================================`);
    });
  } catch (error) {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  }
}

// ==================== 优雅关闭 ====================
async function gracefulShutdown(signal: string) {
  console.log(`\n📴 收到 ${signal} 信号，正在优雅关闭...`);

  try {
    await disconnectDatabase();
    console.log('✅ 数据库连接已断开');
    process.exit(0);
  } catch (error) {
    console.error('❌ 关闭时出错:', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// 启动应用
main();

// 导出 app 实例（用于测试）
export { app, prisma };
