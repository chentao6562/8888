/**
 * 客户管理服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError } from '../types';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerQueryDto,
  CustomerListItemDto,
  CustomerDetailDto,
  CustomerTagDto,
  CreateTagDto,
  CustomerFollowLogDto,
  CreateFollowLogDto
} from '../types/dto/customer.dto';

export class CustomerService {
  // ==================== 客户 CRUD ====================

  async findAll(params: CustomerQueryDto): Promise<PaginatedResult<CustomerListItemDto>> {
    const { page = 1, pageSize = 20, keyword, level, assignedTo, tagId } = params;

    const where: any = {};
    if (level) where.level = level;
    if (assignedTo) where.assignedTo = assignedTo;
    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { phone: { contains: keyword } },
        { wechat: { contains: keyword } },
        { company: { contains: keyword } }
      ];
    }
    if (tagId) {
      where.tags = { some: { tagId } };
    }

    const total = await prisma.customer.count({ where });
    const customers = await prisma.customer.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: { select: { name: true } }
      }
    });

    const items: CustomerListItemDto[] = customers.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      wechat: c.wechat,
      email: c.email,
      company: c.company,
      level: c.level,
      assignedTo: c.assignedTo,
      assigneeName: c.assignee?.name,
      totalAmount: Number(c.totalAmount),
      orderCount: c.orderCount,
      lastContactAt: c.lastContactAt,
      createdAt: c.createdAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async findById(id: number): Promise<CustomerDetailDto> {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        assignee: { select: { name: true } },
        tags: {
          include: { tag: true }
        },
        followLogs: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } }
        },
        orders: {
          select: { id: true, amount: true }
        }
      }
    });

    if (!customer) throw new NotFoundError('客户不存在');

    const orderSummary = {
      total: customer.orders.length,
      amount: customer.orders.reduce((sum, o) => sum + Number(o.amount), 0)
    };

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      wechat: customer.wechat,
      email: customer.email,
      company: customer.company,
      address: customer.address,
      source: customer.source,
      level: customer.level,
      assignedTo: customer.assignedTo,
      assigneeName: customer.assignee?.name,
      totalAmount: Number(customer.totalAmount),
      orderCount: customer.orderCount,
      lastContactAt: customer.lastContactAt,
      remark: customer.remark,
      createdAt: customer.createdAt,
      tags: customer.tags.map(t => ({
        id: t.tag.id,
        name: t.tag.name,
        color: t.tag.color,
        category: t.tag.category
      })),
      recentFollowLogs: customer.followLogs.map(l => ({
        id: l.id,
        customerId: l.customerId,
        userId: l.userId,
        userName: l.user.name,
        type: l.type,
        content: l.content,
        nextFollowAt: l.nextFollowAt,
        createdAt: l.createdAt
      })),
      orderSummary
    };
  }

  async create(data: CreateCustomerDto): Promise<CustomerListItemDto> {
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        wechat: data.wechat,
        email: data.email,
        company: data.company,
        address: data.address,
        source: data.source as any,
        level: data.level as any || 'normal',
        assignedTo: data.assignedTo,
        remark: data.remark
      },
      include: {
        assignee: { select: { name: true } }
      }
    });

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      wechat: customer.wechat,
      email: customer.email,
      company: customer.company,
      level: customer.level,
      assignedTo: customer.assignedTo,
      assigneeName: customer.assignee?.name,
      totalAmount: Number(customer.totalAmount),
      orderCount: customer.orderCount,
      lastContactAt: customer.lastContactAt,
      createdAt: customer.createdAt
    };
  }

  async update(id: number, data: UpdateCustomerDto): Promise<CustomerListItemDto> {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('客户不存在');

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        wechat: data.wechat,
        email: data.email,
        company: data.company,
        address: data.address,
        source: data.source as any,
        level: data.level as any,
        assignedTo: data.assignedTo,
        remark: data.remark
      },
      include: {
        assignee: { select: { name: true } }
      }
    });

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      wechat: customer.wechat,
      email: customer.email,
      company: customer.company,
      level: customer.level,
      assignedTo: customer.assignedTo,
      assigneeName: customer.assignee?.name,
      totalAmount: Number(customer.totalAmount),
      orderCount: customer.orderCount,
      lastContactAt: customer.lastContactAt,
      createdAt: customer.createdAt
    };
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('客户不存在');

    await prisma.$transaction([
      prisma.customerFollowLog.deleteMany({ where: { customerId: id } }),
      prisma.customerTagRelation.deleteMany({ where: { customerId: id } }),
      prisma.customer.delete({ where: { id } })
    ]);
  }

  // ==================== 跟进记录 ====================

  async addFollowLog(customerId: number, userId: number, data: CreateFollowLogDto): Promise<CustomerFollowLogDto> {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundError('客户不存在');

    const log = await prisma.customerFollowLog.create({
      data: {
        customerId,
        userId,
        type: data.type as any,
        content: data.content,
        nextFollowAt: data.nextFollowAt ? new Date(data.nextFollowAt) : null
      },
      include: { user: { select: { name: true } } }
    });

    // 更新客户最后联系时间
    await prisma.customer.update({
      where: { id: customerId },
      data: { lastContactAt: new Date() }
    });

    return {
      id: log.id,
      customerId: log.customerId,
      userId: log.userId,
      userName: log.user.name,
      type: log.type,
      content: log.content,
      nextFollowAt: log.nextFollowAt,
      createdAt: log.createdAt
    };
  }

  async getFollowLogs(customerId: number): Promise<CustomerFollowLogDto[]> {
    const logs = await prisma.customerFollowLog.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });

    return logs.map(l => ({
      id: l.id,
      customerId: l.customerId,
      userId: l.userId,
      userName: l.user.name,
      type: l.type,
      content: l.content,
      nextFollowAt: l.nextFollowAt,
      createdAt: l.createdAt
    }));
  }

  // ==================== 标签管理 ====================

  async addTag(customerId: number, tagId: number): Promise<void> {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundError('客户不存在');

    const tag = await prisma.customerTag.findUnique({ where: { id: tagId } });
    if (!tag) throw new NotFoundError('标签不存在');

    await prisma.customerTagRelation.upsert({
      where: { customerId_tagId: { customerId, tagId } },
      update: {},
      create: { customerId, tagId }
    });
  }

  async removeTag(customerId: number, tagId: number): Promise<void> {
    await prisma.customerTagRelation.deleteMany({
      where: { customerId, tagId }
    });
  }

  // ==================== 标签 CRUD ====================

  async getTags(category?: string): Promise<CustomerTagDto[]> {
    const where: any = {};
    if (category) where.category = category;

    const tags = await prisma.customerTag.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    });

    return tags.map(t => ({
      id: t.id,
      name: t.name,
      color: t.color,
      category: t.category
    }));
  }

  async createTag(data: CreateTagDto): Promise<CustomerTagDto> {
    const tag = await prisma.customerTag.create({
      data: {
        name: data.name,
        color: data.color,
        category: data.category,
        description: data.description
      }
    });

    return {
      id: tag.id,
      name: tag.name,
      color: tag.color,
      category: tag.category
    };
  }

  async updateTag(id: number, data: Partial<CreateTagDto>): Promise<CustomerTagDto> {
    const existing = await prisma.customerTag.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('标签不存在');

    const tag = await prisma.customerTag.update({
      where: { id },
      data
    });

    return {
      id: tag.id,
      name: tag.name,
      color: tag.color,
      category: tag.category
    };
  }

  async deleteTag(id: number): Promise<void> {
    const existing = await prisma.customerTag.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('标签不存在');

    await prisma.$transaction([
      prisma.customerTagRelation.deleteMany({ where: { tagId: id } }),
      prisma.customerTag.delete({ where: { id } })
    ]);
  }
}

export const customerService = new CustomerService();
