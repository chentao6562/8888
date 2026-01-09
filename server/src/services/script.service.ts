/**
 * 话术模板服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError } from '../types';

export interface ScriptListItem {
  id: number;
  name: string;  // 注意：字段是 name，不是 title
  category: string;
  scenario: string | null;
  content: string;
  tags: any;
  usageCount: number;
  rating: number | null;
  createdBy: number | null;
  creatorName?: string;
  createdAt: Date;
}

export class ScriptService {
  async findAll(params: {
    page?: number;
    pageSize?: number;
    category?: string;
    scenario?: string;
    keyword?: string;
  }): Promise<PaginatedResult<ScriptListItem>> {
    const { page = 1, pageSize = 20, category, scenario, keyword } = params;

    const where: any = {};
    if (category) where.category = category;
    if (scenario) where.scenario = scenario;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { content: { contains: keyword } }
      ];
    }

    const total = await prisma.scriptTemplate.count({ where });
    const scripts = await prisma.scriptTemplate.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ usageCount: 'desc' }, { createdAt: 'desc' }],
      include: {
        creator: { select: { name: true } }
      }
    });

    const items: ScriptListItem[] = scripts.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      scenario: s.scenario,
      content: s.content,
      tags: s.tags,
      usageCount: s.usageCount,
      rating: s.rating ? Number(s.rating) : null,
      createdBy: s.createdBy,
      creatorName: s.creator?.name,
      createdAt: s.createdAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async findById(id: number): Promise<ScriptListItem> {
    const script = await prisma.scriptTemplate.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true } }
      }
    });

    if (!script) throw new NotFoundError('话术模板不存在');

    return {
      id: script.id,
      name: script.name,
      category: script.category,
      scenario: script.scenario,
      content: script.content,
      tags: script.tags,
      usageCount: script.usageCount,
      rating: script.rating ? Number(script.rating) : null,
      createdBy: script.createdBy,
      creatorName: script.creator?.name,
      createdAt: script.createdAt
    };
  }

  async create(data: {
    name: string;
    category: string;
    scenario?: string;
    content: string;
    tags?: any;
    createdBy: number;
  }): Promise<ScriptListItem> {
    const script = await prisma.scriptTemplate.create({
      data: {
        name: data.name,
        category: data.category,
        scenario: data.scenario,
        content: data.content,
        tags: data.tags,
        createdBy: data.createdBy
      },
      include: {
        creator: { select: { name: true } }
      }
    });

    return {
      id: script.id,
      name: script.name,
      category: script.category,
      scenario: script.scenario,
      content: script.content,
      tags: script.tags,
      usageCount: script.usageCount,
      rating: script.rating ? Number(script.rating) : null,
      createdBy: script.createdBy,
      creatorName: script.creator?.name,
      createdAt: script.createdAt
    };
  }

  async update(id: number, data: {
    name?: string;
    category?: string;
    scenario?: string;
    content?: string;
    tags?: any;
  }): Promise<ScriptListItem> {
    const existing = await prisma.scriptTemplate.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('话术模板不存在');

    const script = await prisma.scriptTemplate.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        scenario: data.scenario,
        content: data.content,
        tags: data.tags
      },
      include: {
        creator: { select: { name: true } }
      }
    });

    return {
      id: script.id,
      name: script.name,
      category: script.category,
      scenario: script.scenario,
      content: script.content,
      tags: script.tags,
      usageCount: script.usageCount,
      rating: script.rating ? Number(script.rating) : null,
      createdBy: script.createdBy,
      creatorName: script.creator?.name,
      createdAt: script.createdAt
    };
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.scriptTemplate.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('话术模板不存在');
    await prisma.scriptTemplate.delete({ where: { id } });
  }

  async incrementUsage(id: number): Promise<void> {
    await prisma.scriptTemplate.update({
      where: { id },
      data: { usageCount: { increment: 1 } }
    });
  }

  async getCategories(): Promise<string[]> {
    const scripts = await prisma.scriptTemplate.findMany({
      select: { category: true },
      distinct: ['category']
    });
    return scripts.map(s => s.category);
  }
}

export const scriptService = new ScriptService();
