/**
 * 自动化规则服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError } from '../types';
import {
  CreateAutomationDto,
  UpdateAutomationDto,
  AutomationQueryDto,
  AutomationListItemDto,
  AutomationLogListItemDto
} from '../types/dto/automation.dto';

export class AutomationService {
  async findAll(params: AutomationQueryDto): Promise<PaginatedResult<AutomationListItemDto>> {
    const { page = 1, pageSize = 20, triggerType, actionType, isActive } = params;

    const where: any = {};
    if (triggerType) where.triggerType = triggerType;
    if (actionType) where.actionType = actionType;
    if (isActive !== undefined) where.isEnabled = isActive;

    const total = await prisma.automationRule.count({ where });
    const rules = await prisma.automationRule.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
    });

    const items: AutomationListItemDto[] = rules.map(r => ({
      id: r.id,
      projectId: null,
      project: null,
      name: r.name,
      description: r.description,
      triggerType: r.triggerType,
      triggerConfig: r.triggerConfig,
      actionType: r.actionType,
      actionConfig: r.actionConfig,
      isActive: r.isEnabled,
      lastRunAt: r.lastExecutedAt,
      runCount: r.executionCount,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async findById(id: number): Promise<AutomationListItemDto> {
    const rule = await prisma.automationRule.findUnique({ where: { id } });

    if (!rule) throw new NotFoundError('自动化规则不存在');

    return {
      id: rule.id,
      projectId: null,
      project: null,
      name: rule.name,
      description: rule.description,
      triggerType: rule.triggerType,
      triggerConfig: rule.triggerConfig,
      actionType: rule.actionType,
      actionConfig: rule.actionConfig,
      isActive: rule.isEnabled,
      lastRunAt: rule.lastExecutedAt,
      runCount: rule.executionCount,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt
    };
  }

  async create(userId: number, data: CreateAutomationDto): Promise<AutomationListItemDto> {
    const rule = await prisma.automationRule.create({
      data: {
        name: data.name,
        description: data.description,
        triggerType: data.triggerType as any,
        triggerConfig: data.triggerConfig,
        actionType: data.actionType as any,
        actionConfig: data.actionConfig,
        isEnabled: data.isActive !== false,
        createdBy: userId
      }
    });

    return {
      id: rule.id,
      projectId: null,
      project: null,
      name: rule.name,
      description: rule.description,
      triggerType: rule.triggerType,
      triggerConfig: rule.triggerConfig,
      actionType: rule.actionType,
      actionConfig: rule.actionConfig,
      isActive: rule.isEnabled,
      lastRunAt: rule.lastExecutedAt,
      runCount: rule.executionCount,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt
    };
  }

  async update(id: number, data: UpdateAutomationDto): Promise<AutomationListItemDto> {
    const existing = await prisma.automationRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('自动化规则不存在');

    const rule = await prisma.automationRule.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        triggerType: data.triggerType as any,
        triggerConfig: data.triggerConfig,
        actionType: data.actionType as any,
        actionConfig: data.actionConfig
      }
    });

    return {
      id: rule.id,
      projectId: null,
      project: null,
      name: rule.name,
      description: rule.description,
      triggerType: rule.triggerType,
      triggerConfig: rule.triggerConfig,
      actionType: rule.actionType,
      actionConfig: rule.actionConfig,
      isActive: rule.isEnabled,
      lastRunAt: rule.lastExecutedAt,
      runCount: rule.executionCount,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt
    };
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.automationRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('自动化规则不存在');

    await prisma.$transaction([
      prisma.automationLog.deleteMany({ where: { ruleId: id } }),
      prisma.automationRule.delete({ where: { id } })
    ]);
  }

  async toggle(id: number): Promise<AutomationListItemDto> {
    const existing = await prisma.automationRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('自动化规则不存在');

    const rule = await prisma.automationRule.update({
      where: { id },
      data: { isEnabled: !existing.isEnabled }
    });

    return {
      id: rule.id,
      projectId: null,
      project: null,
      name: rule.name,
      description: rule.description,
      triggerType: rule.triggerType,
      triggerConfig: rule.triggerConfig,
      actionType: rule.actionType,
      actionConfig: rule.actionConfig,
      isActive: rule.isEnabled,
      lastRunAt: rule.lastExecutedAt,
      runCount: rule.executionCount,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt
    };
  }

  async execute(id: number): Promise<AutomationLogListItemDto> {
    const rule = await prisma.automationRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundError('自动化规则不存在');

    // 模拟执行
    const executionResult = {
      success: true,
      message: '规则执行成功',
      affectedItems: 1
    };

    const log = await prisma.automationLog.create({
      data: {
        ruleId: id,
        status: 'success',
        inputData: rule.triggerConfig ?? undefined,
        outputData: executionResult
      }
    });

    // 更新执行统计
    await prisma.automationRule.update({
      where: { id },
      data: {
        executionCount: { increment: 1 },
        lastExecutedAt: new Date()
      }
    });

    return {
      id: log.id,
      ruleId: log.ruleId,
      rule: { id: rule.id, name: rule.name },
      status: log.status,
      triggerData: log.inputData,
      result: log.outputData,
      errorMessage: log.errorMessage,
      executedAt: log.executedAt
    };
  }

  async getLogs(ruleId: number, params: { page?: number; pageSize?: number }): Promise<PaginatedResult<AutomationLogListItemDto>> {
    const { page = 1, pageSize = 20 } = params;

    const total = await prisma.automationLog.count({ where: { ruleId } });
    const logs = await prisma.automationLog.findMany({
      where: { ruleId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { executedAt: 'desc' },
      include: {
        rule: { select: { id: true, name: true } }
      }
    });

    const items: AutomationLogListItemDto[] = logs.map(l => ({
      id: l.id,
      ruleId: l.ruleId,
      rule: { id: l.rule.id, name: l.rule.name },
      status: l.status,
      triggerData: l.inputData,
      result: l.outputData,
      errorMessage: l.errorMessage,
      executedAt: l.executedAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }
}

export const automationService = new AutomationService();
