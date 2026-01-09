/**
 * 流量数据服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError, BadRequestError } from '../types';
import {
  TrafficDataDto,
  TrafficQueryDto,
  TrafficDashboardDto,
  TrafficTrendDto,
  ImportResultDto,
  ImportRecordDto
} from '../types/dto/traffic.dto';
import * as XLSX from 'xlsx';

export class TrafficService {
  async findAll(params: TrafficQueryDto): Promise<PaginatedResult<TrafficDataDto>> {
    const { page = 1, pageSize = 20, accountId, projectId, platform, startDate, endDate } = params;

    const where: any = {};
    if (accountId) where.accountId = accountId;
    if (projectId) where.account = { projectId };
    if (platform) where.account = { ...where.account, platform };
    if (startDate || endDate) {
      where.publishDate = {};
      if (startDate) where.publishDate.gte = new Date(startDate);
      if (endDate) where.publishDate.lte = new Date(endDate);
    }

    const total = await prisma.trafficData.count({ where });
    const data = await prisma.trafficData.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { publishDate: 'desc' },
      include: {
        account: { select: { accountName: true, platform: true } }
      }
    });

    const items: TrafficDataDto[] = data.map(d => ({
      id: d.id,
      accountId: d.accountId,
      accountName: d.account.accountName,
      platform: d.account.platform,
      contentTitle: d.contentTitle,
      publishDate: d.publishDate,
      views: d.views,
      likes: d.likes,
      comments: d.comments,
      shares: d.shares,
      saves: d.saves,
      completionRate: d.completionRate ? Number(d.completionRate) : null,
      importBatch: d.importBatch,
      createdAt: d.createdAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async getDashboard(params: TrafficQueryDto): Promise<TrafficDashboardDto> {
    const { accountId, projectId, platform, startDate, endDate } = params;

    const where: any = {};
    if (accountId) where.accountId = accountId;
    if (projectId) where.account = { projectId };
    if (platform) where.account = { ...where.account, platform };
    if (startDate || endDate) {
      where.publishDate = {};
      if (startDate) where.publishDate.gte = new Date(startDate);
      if (endDate) where.publishDate.lte = new Date(endDate);
    }

    const aggregation = await prisma.trafficData.aggregate({
      where,
      _sum: { views: true, likes: true, comments: true, shares: true, saves: true },
      _avg: { completionRate: true },
      _count: true
    });

    return {
      totalViews: aggregation._sum.views || 0,
      totalLikes: aggregation._sum.likes || 0,
      totalComments: aggregation._sum.comments || 0,
      totalShares: aggregation._sum.shares || 0,
      totalSaves: aggregation._sum.saves || 0,
      avgCompletionRate: aggregation._avg.completionRate ? Number(aggregation._avg.completionRate) : 0,
      contentCount: aggregation._count
    };
  }

  async getTrend(params: TrafficQueryDto & { groupBy?: 'day' | 'week' | 'month' }): Promise<TrafficTrendDto[]> {
    const { accountId, startDate, endDate } = params;

    const where: any = {};
    if (accountId) where.accountId = accountId;
    if (startDate || endDate) {
      where.publishDate = {};
      if (startDate) where.publishDate.gte = new Date(startDate);
      if (endDate) where.publishDate.lte = new Date(endDate);
    }

    const data = await prisma.trafficData.findMany({
      where,
      orderBy: { publishDate: 'asc' },
      select: { publishDate: true, views: true, likes: true, comments: true, shares: true }
    });

    // 按日期分组
    const grouped = new Map<string, TrafficTrendDto>();
    for (const d of data) {
      if (!d.publishDate) continue;
      const date = d.publishDate.toISOString().split('T')[0];
      const existing = grouped.get(date) || { date, views: 0, likes: 0, comments: 0, shares: 0 };
      existing.views += d.views;
      existing.likes += d.likes;
      existing.comments += d.comments;
      existing.shares += d.shares;
      grouped.set(date, existing);
    }

    return Array.from(grouped.values());
  }

  async importFromExcel(
    file: Express.Multer.File,
    accountId: number,
    userId: number
  ): Promise<ImportResultDto> {
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) throw new NotFoundError('账号不存在');

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet) as any[];

    const batchNo = `IMP${Date.now()}`;
    let successRows = 0;
    let failedRows = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i];
        await prisma.trafficData.create({
          data: {
            accountId,
            contentTitle: row['内容标题'] || row['contentTitle'] || null,
            publishDate: row['发布日期'] || row['publishDate'] ? new Date(row['发布日期'] || row['publishDate']) : null,
            views: Number(row['播放量'] || row['views'] || 0),
            likes: Number(row['点赞数'] || row['likes'] || 0),
            comments: Number(row['评论数'] || row['comments'] || 0),
            shares: Number(row['转发数'] || row['shares'] || 0),
            saves: Number(row['收藏数'] || row['saves'] || 0),
            completionRate: row['完播率'] || row['completionRate'] ? Number(row['完播率'] || row['completionRate']) : null,
            importBatch: batchNo
          }
        });
        successRows++;
      } catch (err: any) {
        failedRows++;
        errors.push(`行 ${i + 2}: ${err.message}`);
      }
    }

    await prisma.importRecord.create({
      data: {
        type: 'traffic',
        fileName: file.originalname,
        batchNo,
        totalRows: rows.length,
        successRows,
        failedRows,
        status: failedRows === 0 ? 'completed' : 'completed',
        errorLog: errors.length > 0 ? errors.join('\n') : null,
        createdBy: userId
      }
    });

    return { batchNo, totalRows: rows.length, successRows, failedRows, errors: errors.slice(0, 10) };
  }

  async getImportRecords(params: { page?: number; pageSize?: number }): Promise<PaginatedResult<ImportRecordDto>> {
    const { page = 1, pageSize = 20 } = params;

    const total = await prisma.importRecord.count({ where: { type: 'traffic' } });
    const records = await prisma.importRecord.findMany({
      where: { type: 'traffic' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { name: true } } }
    });

    const items: ImportRecordDto[] = records.map(r => ({
      id: r.id,
      type: r.type,
      fileName: r.fileName,
      batchNo: r.batchNo,
      totalRows: r.totalRows,
      successRows: r.successRows,
      failedRows: r.failedRows,
      status: r.status,
      createdBy: r.createdBy,
      creatorName: r.creator?.name,
      createdAt: r.createdAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }
}

export const trafficService = new TrafficService();
