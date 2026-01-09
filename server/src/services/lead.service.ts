/**
 * 线索管理服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError } from '../types';
import {
  CreateLeadDto,
  UpdateLeadDto,
  LeadQueryDto,
  LeadListItemDto,
  LeadLogDto,
  CreateLeadLogDto,
  LeadFunnelDto
} from '../types/dto/lead.dto';

export class LeadService {
  async findAll(params: LeadQueryDto): Promise<PaginatedResult<LeadListItemDto>> {
    const { page = 1, pageSize = 20, projectId, status, sourcePlatform, assignedTo, keyword, startDate, endDate } = params;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (sourcePlatform) where.sourcePlatform = sourcePlatform;
    if (assignedTo) where.assignedTo = assignedTo;
    if (keyword) {
      where.OR = [
        { customerName: { contains: keyword } },
        { phone: { contains: keyword } },
        { wechat: { contains: keyword } }
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const total = await prisma.lead.count({ where });
    const leads = await prisma.lead.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } }
      }
    });

    const items: LeadListItemDto[] = leads.map(l => ({
      id: l.id,
      projectId: l.projectId,
      projectName: l.project?.name,
      customerName: l.customerName,
      phone: l.phone,
      wechat: l.wechat,
      sourcePlatform: l.sourcePlatform,
      sourceType: l.sourceType,
      assignedTo: l.assignedTo,
      assigneeName: l.assignee?.name,
      status: l.status,
      amount: Number(l.amount),
      remark: l.remark,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async findById(id: number): Promise<LeadListItemDto> {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } }
      }
    });

    if (!lead) throw new NotFoundError('线索不存在');

    return {
      id: lead.id,
      projectId: lead.projectId,
      projectName: lead.project?.name,
      customerName: lead.customerName,
      phone: lead.phone,
      wechat: lead.wechat,
      sourcePlatform: lead.sourcePlatform,
      sourceType: lead.sourceType,
      assignedTo: lead.assignedTo,
      assigneeName: lead.assignee?.name,
      status: lead.status,
      amount: Number(lead.amount),
      remark: lead.remark,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt
    };
  }

  async create(data: CreateLeadDto): Promise<LeadListItemDto> {
    const lead = await prisma.lead.create({
      data: {
        projectId: data.projectId,
        customerName: data.customerName,
        phone: data.phone,
        wechat: data.wechat,
        sourcePlatform: data.sourcePlatform,
        sourceType: data.sourceType,
        assignedTo: data.assignedTo,
        amount: data.amount || 0,
        remark: data.remark
      },
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } }
      }
    });

    return {
      id: lead.id,
      projectId: lead.projectId,
      projectName: lead.project?.name,
      customerName: lead.customerName,
      phone: lead.phone,
      wechat: lead.wechat,
      sourcePlatform: lead.sourcePlatform,
      sourceType: lead.sourceType,
      assignedTo: lead.assignedTo,
      assigneeName: lead.assignee?.name,
      status: lead.status,
      amount: Number(lead.amount),
      remark: lead.remark,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt
    };
  }

  async update(id: number, data: UpdateLeadDto): Promise<LeadListItemDto> {
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('线索不存在');

    const lead = await prisma.lead.update({
      where: { id },
      data,
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } }
      }
    });

    return {
      id: lead.id,
      projectId: lead.projectId,
      projectName: lead.project?.name,
      customerName: lead.customerName,
      phone: lead.phone,
      wechat: lead.wechat,
      sourcePlatform: lead.sourcePlatform,
      sourceType: lead.sourceType,
      assignedTo: lead.assignedTo,
      assigneeName: lead.assignee?.name,
      status: lead.status,
      amount: Number(lead.amount),
      remark: lead.remark,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt
    };
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('线索不存在');
    await prisma.$transaction([
      prisma.leadLog.deleteMany({ where: { leadId: id } }),
      prisma.lead.delete({ where: { id } })
    ]);
  }

  async addLog(leadId: number, userId: number, data: CreateLeadLogDto): Promise<LeadLogDto> {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundError('线索不存在');

    const log = await prisma.leadLog.create({
      data: {
        leadId,
        userId,
        action: data.action,
        content: data.content
      },
      include: { user: { select: { name: true } } }
    });

    return {
      id: log.id,
      leadId: log.leadId,
      userId: log.userId,
      userName: log.user.name,
      action: log.action,
      content: log.content,
      createdAt: log.createdAt
    };
  }

  async getLogs(leadId: number): Promise<LeadLogDto[]> {
    const logs = await prisma.leadLog.findMany({
      where: { leadId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });

    return logs.map(l => ({
      id: l.id,
      leadId: l.leadId,
      userId: l.userId,
      userName: l.user.name,
      action: l.action,
      content: l.content,
      createdAt: l.createdAt
    }));
  }

  async assign(id: number, assignedTo: number): Promise<LeadListItemDto> {
    return this.update(id, { assignedTo });
  }

  async updateStatus(id: number, status: string): Promise<LeadListItemDto> {
    return this.update(id, { status: status as any });
  }

  async getFunnel(projectId?: number): Promise<LeadFunnelDto> {
    const where: any = {};
    if (projectId) where.projectId = projectId;

    const counts = await prisma.lead.groupBy({
      by: ['status'],
      where,
      _count: true
    });

    const funnel: LeadFunnelDto = {
      pending: 0,
      following: 0,
      converted: 0,
      lost: 0,
      hold: 0,
      conversionRate: 0
    };

    let total = 0;
    for (const c of counts) {
      const status = c.status as keyof Omit<LeadFunnelDto, 'conversionRate'>;
      funnel[status] = c._count;
      total += c._count;
    }

    if (total > 0) {
      funnel.conversionRate = Math.round((funnel.converted / total) * 100 * 100) / 100;
    }

    return funnel;
  }
}

export const leadService = new LeadService();
