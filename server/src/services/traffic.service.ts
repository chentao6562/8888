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
import * as iconv from 'iconv-lite';

// 平台名称映射
const PLATFORM_MAP: Record<string, 'douyin' | 'kuaishou' | 'xiaohongshu' | 'shipinhao'> = {
  '抖音': 'douyin',
  '快手': 'kuaishou',
  '小红书': 'xiaohongshu',
  '视频号': 'shipinhao',
  'douyin': 'douyin',
  'kuaishou': 'kuaishou',
  'xiaohongshu': 'xiaohongshu',
  'shipinhao': 'shipinhao'
};

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

  /**
   * 智能CSV导入 - 支持自动创建账号和匹配项目
   * CSV格式：账号,备注,平台,标题,类型,推荐,阅读（播放）,评论,分享,收藏,点赞,发布时间,链接
   */
  async importFromCSV(
    file: Express.Multer.File,
    projectId: number | null,
    userId: number
  ): Promise<ImportResultDto> {
    // 解析CSV（支持GBK编码）
    let content: string;
    try {
      // 尝试UTF-8解码
      content = file.buffer.toString('utf-8');
      // 如果出现乱码，尝试GBK
      if (content.includes('�')) {
        content = iconv.decode(file.buffer, 'gbk');
      }
    } catch {
      content = iconv.decode(file.buffer, 'gbk');
    }

    // 解析CSV行
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new BadRequestError('CSV文件为空或格式不正确');
    }

    // 解析表头
    const headers = this.parseCSVLine(lines[0]);
    console.log('CSV Headers:', headers);

    // 字段索引映射
    const fieldMap = {
      accountName: this.findHeaderIndex(headers, ['账号', '账户', 'account']),
      remark: this.findHeaderIndex(headers, ['备注', 'remark', 'note']),
      platform: this.findHeaderIndex(headers, ['平台', 'platform']),
      title: this.findHeaderIndex(headers, ['标题', 'title', '内容']),
      contentType: this.findHeaderIndex(headers, ['类型', 'type', '内容类型']),
      recommends: this.findHeaderIndex(headers, ['推荐', 'recommend']),
      views: this.findHeaderIndex(headers, ['阅读', '播放', 'views', '阅读（播放）']),
      comments: this.findHeaderIndex(headers, ['评论', 'comments']),
      shares: this.findHeaderIndex(headers, ['分享', 'shares', '转发']),
      saves: this.findHeaderIndex(headers, ['收藏', 'saves']),
      likes: this.findHeaderIndex(headers, ['点赞', 'likes']),
      publishTime: this.findHeaderIndex(headers, ['发布时间', 'publish_time', '时间']),
      url: this.findHeaderIndex(headers, ['链接', 'url', 'link'])
    };

    console.log('Field mapping:', fieldMap);

    const batchNo = `CSV${Date.now()}`;
    let successRows = 0;
    let failedRows = 0;
    const errors: string[] = [];

    // 账号缓存
    const accountCache = new Map<string, number>();

    // 处理数据行
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = this.parseCSVLine(lines[i]);
        if (values.length < 3) continue; // 跳过空行

        const accountName = values[fieldMap.accountName]?.trim();
        const platformStr = values[fieldMap.platform]?.trim();

        if (!accountName || !platformStr) {
          errors.push(`行 ${i + 1}: 账号或平台为空`);
          failedRows++;
          continue;
        }

        const platform = PLATFORM_MAP[platformStr];
        if (!platform) {
          errors.push(`行 ${i + 1}: 未知平台 "${platformStr}"`);
          failedRows++;
          continue;
        }

        // 获取或创建账号
        const cacheKey = `${platform}:${accountName}`;
        let accountId = accountCache.get(cacheKey);

        if (!accountId) {
          // 查找或创建账号
          let account = await prisma.account.findFirst({
            where: { platform, accountName }
          });

          if (!account) {
            // 创建新账号
            account = await prisma.account.create({
              data: {
                platform,
                accountName,
                remark: values[fieldMap.remark]?.trim() || null,
                projectId: projectId
              }
            });
            console.log(`Created new account: ${accountName} (${platform})`);
          }

          accountId = account.id;
          accountCache.set(cacheKey, accountId);
        }

        // 解析发布时间
        let publishDate: Date | null = null;
        let publishTime: Date | null = null;
        const publishTimeStr = values[fieldMap.publishTime]?.trim();
        if (publishTimeStr) {
          try {
            publishTime = new Date(publishTimeStr);
            if (!isNaN(publishTime.getTime())) {
              publishDate = new Date(publishTime.toISOString().split('T')[0]);
            }
          } catch {
            // 忽略日期解析错误
          }
        }

        // 解析推荐量
        let recommends: number | null = null;
        const recommendsStr = values[fieldMap.recommends]?.trim();
        if (recommendsStr && recommendsStr !== '--' && recommendsStr !== '-') {
          recommends = parseInt(recommendsStr, 10) || null;
        }

        // 创建流量数据
        await prisma.trafficData.create({
          data: {
            accountId,
            contentTitle: values[fieldMap.title]?.trim() || null,
            contentType: values[fieldMap.contentType]?.trim() || null,
            contentUrl: values[fieldMap.url]?.trim() || null,
            publishDate,
            publishTime,
            views: parseInt(values[fieldMap.views]?.trim() || '0', 10) || 0,
            likes: parseInt(values[fieldMap.likes]?.trim() || '0', 10) || 0,
            comments: parseInt(values[fieldMap.comments]?.trim() || '0', 10) || 0,
            shares: parseInt(values[fieldMap.shares]?.trim() || '0', 10) || 0,
            saves: parseInt(values[fieldMap.saves]?.trim() || '0', 10) || 0,
            recommends,
            importBatch: batchNo
          }
        });
        successRows++;
      } catch (err: any) {
        failedRows++;
        errors.push(`行 ${i + 1}: ${err.message}`);
        console.error(`Row ${i + 1} error:`, err);
      }
    }

    // 保存导入记录
    await prisma.importRecord.create({
      data: {
        type: 'traffic',
        fileName: file.originalname,
        batchNo,
        totalRows: lines.length - 1,
        successRows,
        failedRows,
        status: 'completed',
        errorLog: errors.length > 0 ? errors.slice(0, 100).join('\n') : null,
        createdBy: userId
      }
    });

    return {
      batchNo,
      totalRows: lines.length - 1,
      successRows,
      failedRows,
      errors: errors.slice(0, 10)
    };
  }

  /**
   * 解析CSV行，处理引号包裹的字段
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);

    return result.map(s => s.trim());
  }

  /**
   * 查找表头索引
   */
  private findHeaderIndex(headers: string[], candidates: string[]): number {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].toLowerCase().trim();
      for (const candidate of candidates) {
        if (header.includes(candidate.toLowerCase())) {
          return i;
        }
      }
    }
    return -1;
  }
}

export const trafficService = new TrafficService();
