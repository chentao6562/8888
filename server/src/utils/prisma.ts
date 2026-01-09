/**
 * Prisma 客户端单例
 * 确保整个应用使用同一个 Prisma 实例
 */

import { PrismaClient } from '@prisma/client';

// 使用全局变量避免开发时热重载创建多个实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma 客户端单例实例
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error']
  });

// 非生产环境下保存到全局变量
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * 数据库连接
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
}

/**
 * 数据库断开连接
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('数据库连接已断开');
  } catch (error) {
    console.error('数据库断开连接失败:', error);
    throw error;
  }
}

/**
 * 数据库健康检查
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('数据库健康检查失败:', error);
    return false;
  }
}

export default prisma;
