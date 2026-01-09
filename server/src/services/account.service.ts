/**
 * 账号管理服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError } from '../types';
import {
  CreateAccountDto,
  UpdateAccountDto,
  AccountQueryDto,
  AccountListItemDto
} from '../types/dto/account.dto';

export class AccountService {
  async findAll(params: AccountQueryDto): Promise<PaginatedResult<AccountListItemDto>> {
    const { page = 1, pageSize = 20, projectId, platform, keyword, status } = params;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (platform) where.platform = platform;
    if (status !== undefined) where.status = status;
    if (keyword) {
      where.OR = [
        { accountName: { contains: keyword } },
        { accountId: { contains: keyword } }
      ];
    }

    const total = await prisma.account.count({ where });
    const accounts = await prisma.account.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { name: true } },
        operator: { select: { name: true } }
      }
    });

    const items: AccountListItemDto[] = accounts.map(a => ({
      id: a.id,
      projectId: a.projectId,
      projectName: a.project?.name,
      platform: a.platform,
      accountName: a.accountName,
      accountId: a.accountId,
      followers: a.followers,
      operatorId: a.operatorId,
      operatorName: a.operator?.name,
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async findById(id: number): Promise<AccountListItemDto> {
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        project: { select: { name: true } },
        operator: { select: { name: true } }
      }
    });

    if (!account) throw new NotFoundError('账号不存在');

    return {
      id: account.id,
      projectId: account.projectId,
      projectName: account.project?.name,
      platform: account.platform,
      accountName: account.accountName,
      accountId: account.accountId,
      followers: account.followers,
      operatorId: account.operatorId,
      operatorName: account.operator?.name,
      status: account.status,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };
  }

  async create(data: CreateAccountDto): Promise<AccountListItemDto> {
    const account = await prisma.account.create({
      data: {
        projectId: data.projectId,
        platform: data.platform,
        accountName: data.accountName,
        accountId: data.accountId,
        followers: data.followers || 0,
        operatorId: data.operatorId
      },
      include: {
        project: { select: { name: true } },
        operator: { select: { name: true } }
      }
    });

    return {
      id: account.id,
      projectId: account.projectId,
      projectName: account.project?.name,
      platform: account.platform,
      accountName: account.accountName,
      accountId: account.accountId,
      followers: account.followers,
      operatorId: account.operatorId,
      operatorName: account.operator?.name,
      status: account.status,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };
  }

  async update(id: number, data: UpdateAccountDto): Promise<AccountListItemDto> {
    const existing = await prisma.account.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('账号不存在');

    const account = await prisma.account.update({
      where: { id },
      data,
      include: {
        project: { select: { name: true } },
        operator: { select: { name: true } }
      }
    });

    return {
      id: account.id,
      projectId: account.projectId,
      projectName: account.project?.name,
      platform: account.platform,
      accountName: account.accountName,
      accountId: account.accountId,
      followers: account.followers,
      operatorId: account.operatorId,
      operatorName: account.operator?.name,
      status: account.status,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.account.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('账号不存在');
    await prisma.account.delete({ where: { id } });
  }
}

export const accountService = new AccountService();
