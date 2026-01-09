/**
 * 数据库种子脚本
 * 创建初始数据
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始填充种子数据...');

  // 1. 创建默认管理员账号
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      name: '系统管理员',
      role: 'admin',
      status: 1
    }
  });
  console.log('✅ 管理员账号已创建:', admin.username);

  // 2. 创建默认客户标签
  const tagCategories = [
    // 行业类
    { name: '制造业', category: '行业', color: '#1890ff' },
    { name: '服务业', category: '行业', color: '#1890ff' },
    { name: '零售业', category: '行业', color: '#1890ff' },
    { name: '互联网', category: '行业', color: '#1890ff' },
    // 需求类
    { name: '价格敏感', category: '需求', color: '#52c41a' },
    { name: '品质优先', category: '需求', color: '#52c41a' },
    { name: '服务导向', category: '需求', color: '#52c41a' },
    // 规模类
    { name: '小微企业', category: '规模', color: '#faad14' },
    { name: '中型企业', category: '规模', color: '#faad14' },
    { name: '大型企业', category: '规模', color: '#faad14' }
  ];

  for (const tag of tagCategories) {
    await prisma.customerTag.upsert({
      where: { id: tagCategories.indexOf(tag) + 1 },
      update: {},
      create: tag
    });
  }
  console.log('✅ 客户标签已创建');

  // 3. 创建默认话术模板分类示例
  const scriptTemplates = [
    { name: '开场白-通用', category: '开场白', scenario: '初次联系', content: '您好，我是XXX公司的销售顾问，请问您现在方便吗？' },
    { name: '产品介绍-核心', category: '产品介绍', scenario: '产品演示', content: '我们的产品主要有以下几个核心优势...' },
    { name: '异议处理-价格', category: '异议处理', scenario: '价格谈判', content: '我非常理解您对价格的关注，让我来给您分析一下我们产品的价值...' },
    { name: '成交话术-促单', category: '成交话术', scenario: '最终成交', content: '您看我们现在就把合作敲定下来，我这边马上为您安排...' },
    { name: '售后服务-回访', category: '售后服务', scenario: '客户回访', content: '您好，我是XXX公司的客服，想了解一下您使用我们产品的感受...' }
  ];

  for (const script of scriptTemplates) {
    await prisma.scriptTemplate.upsert({
      where: { id: scriptTemplates.indexOf(script) + 1 },
      update: {},
      create: script
    });
  }
  console.log('✅ 话术模板已创建');

  // 4. 创建系统配置
  const websiteConfigs = [
    { key: 'company_name', value: '公司名称' },
    { key: 'contact_phone', value: '400-XXX-XXXX' },
    { key: 'contact_email', value: 'contact@company.com' },
    { key: 'address', value: '公司地址' }
  ];

  for (const config of websiteConfigs) {
    await prisma.websiteInfo.upsert({
      where: { key: config.key },
      update: {},
      create: config
    });
  }
  console.log('✅ 系统配置已创建');

  console.log('🎉 种子数据填充完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据填充失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
