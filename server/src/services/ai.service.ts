/**
 * AI 分析服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError } from '../types';
import {
  AiAnalysisQueryDto,
  AiAnalysisListItemDto,
  AiAnalysisType
} from '../types/dto/ai.dto';

export class AiService {
  async findAll(params: AiAnalysisQueryDto): Promise<PaginatedResult<AiAnalysisListItemDto>> {
    const { page = 1, pageSize = 20, type } = params;

    const where: any = {};
    if (type) where.type = type;

    const total = await prisma.aiAnalysis.count({ where });
    const analyses = await prisma.aiAnalysis.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true } }
      }
    });

    const items: AiAnalysisListItemDto[] = analyses.map(a => ({
      id: a.id,
      projectId: a.targetType === 'project' ? a.targetId : null,
      project: null,
      type: a.type,
      inputData: a.inputData,
      result: a.result,
      userId: a.createdBy || 0,
      user: a.creator ? { id: a.creator.id, name: a.creator.name } : { id: 0, name: '' },
      createdAt: a.createdAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async findById(id: number): Promise<AiAnalysisListItemDto> {
    const analysis = await prisma.aiAnalysis.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } }
      }
    });

    if (!analysis) throw new NotFoundError('分析记录不存在');

    return {
      id: analysis.id,
      projectId: analysis.targetType === 'project' ? analysis.targetId : null,
      project: null,
      type: analysis.type,
      inputData: analysis.inputData,
      result: analysis.result,
      userId: analysis.createdBy || 0,
      user: analysis.creator ? { id: analysis.creator.id, name: analysis.creator.name } : { id: 0, name: '' },
      createdAt: analysis.createdAt
    };
  }

  async trafficDiagnosis(userId: number, data: {
    accountId?: number;
    projectId?: number;
    startDate: string;
    endDate: string;
  }): Promise<AiAnalysisListItemDto> {
    // 获取流量数据
    const where: any = {};
    if (data.accountId) where.accountId = data.accountId;
    if (data.startDate || data.endDate) {
      where.publishDate = {};
      if (data.startDate) where.publishDate.gte = new Date(data.startDate);
      if (data.endDate) where.publishDate.lte = new Date(data.endDate);
    }

    const trafficData = await prisma.trafficData.findMany({ where });

    // 模拟 AI 分析结果
    const avgViews = trafficData.length > 0
      ? Math.round(trafficData.reduce((sum, t) => sum + t.views, 0) / trafficData.length)
      : 0;
    const avgLikes = trafficData.length > 0
      ? Math.round(trafficData.reduce((sum, t) => sum + t.likes, 0) / trafficData.length)
      : 0;

    const result = {
      summary: `分析了 ${trafficData.length} 条内容数据`,
      metrics: {
        totalContent: trafficData.length,
        avgViews,
        avgLikes,
        engagementRate: avgViews > 0 ? ((avgLikes / avgViews) * 100).toFixed(2) + '%' : '0%'
      },
      suggestions: [
        '建议增加视频发布频率',
        '优化内容标题吸引力',
        '选择最佳发布时间段'
      ]
    };

    const analysis = await prisma.aiAnalysis.create({
      data: {
        type: 'traffic_diagnosis',
        targetType: data.projectId ? 'project' : data.accountId ? 'account' : null,
        targetId: data.projectId || data.accountId,
        inputData: data,
        result: JSON.stringify(result),
        createdBy: userId
      },
      include: {
        creator: { select: { id: true, name: true } }
      }
    });

    return {
      id: analysis.id,
      projectId: analysis.targetType === 'project' ? analysis.targetId : null,
      project: null,
      type: analysis.type,
      inputData: analysis.inputData,
      result: result,
      userId: analysis.createdBy || userId,
      user: analysis.creator ? { id: analysis.creator.id, name: analysis.creator.name } : { id: userId, name: '' },
      createdAt: analysis.createdAt
    };
  }

  async contentSuggestion(userId: number, data: {
    accountId?: number;
    projectId?: number;
    contentType?: string;
    targetAudience?: string;
  }): Promise<AiAnalysisListItemDto> {
    // 模拟 AI 内容建议
    const result = {
      summary: '基于您的账号数据和目标受众分析',
      suggestions: [
        {
          type: 'video',
          topic: '产品使用教程',
          reason: '教程类内容互动率较高'
        },
        {
          type: 'short_video',
          topic: '行业热点解读',
          reason: '蹭热点可提升曝光'
        },
        {
          type: 'image',
          topic: '用户案例分享',
          reason: '增强信任度和转化'
        }
      ],
      bestPublishTimes: ['10:00', '14:00', '20:00'],
      recommendedHashtags: ['#行业干货', '#产品推荐', '#用户心得']
    };

    const analysis = await prisma.aiAnalysis.create({
      data: {
        type: 'content_suggestion',
        targetType: data.projectId ? 'project' : data.accountId ? 'account' : null,
        targetId: data.projectId || data.accountId,
        inputData: data,
        result: JSON.stringify(result),
        createdBy: userId
      },
      include: {
        creator: { select: { id: true, name: true } }
      }
    });

    return {
      id: analysis.id,
      projectId: analysis.targetType === 'project' ? analysis.targetId : null,
      project: null,
      type: analysis.type,
      inputData: analysis.inputData,
      result: result,
      userId: analysis.createdBy || userId,
      user: analysis.creator ? { id: analysis.creator.id, name: analysis.creator.name } : { id: userId, name: '' },
      createdAt: analysis.createdAt
    };
  }

  async salesAdvice(userId: number, data: {
    customerId?: number;
    leadId?: number;
    context?: string;
  }): Promise<AiAnalysisListItemDto> {
    // 模拟 AI 销售建议
    const result = {
      summary: '基于客户画像和历史沟通记录分析',
      customerInsights: {
        interestLevel: '高',
        budgetRange: '中等',
        decisionCycle: '较长'
      },
      suggestions: [
        '建议从客户痛点切入，强调解决方案价值',
        '可适当给予优惠促进决策',
        '建议安排线下面谈加深信任'
      ],
      talkingPoints: [
        '产品如何解决其核心问题',
        '成功案例分享',
        '售后服务保障'
      ],
      nextSteps: [
        '发送详细产品资料',
        '安排产品演示',
        '准备报价方案'
      ]
    };

    const analysis = await prisma.aiAnalysis.create({
      data: {
        type: 'sales_advice',
        targetType: data.customerId ? 'customer' : data.leadId ? 'lead' : null,
        targetId: data.customerId || data.leadId,
        inputData: data,
        result: JSON.stringify(result),
        createdBy: userId
      },
      include: {
        creator: { select: { id: true, name: true } }
      }
    });

    return {
      id: analysis.id,
      projectId: null,
      project: null,
      type: analysis.type,
      inputData: analysis.inputData,
      result: result,
      userId: analysis.createdBy || userId,
      user: analysis.creator ? { id: analysis.creator.id, name: analysis.creator.name } : { id: userId, name: '' },
      createdAt: analysis.createdAt
    };
  }

  async projectReview(userId: number, data: {
    projectId: number;
    startDate?: string;
    endDate?: string;
  }): Promise<AiAnalysisListItemDto> {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: {
        indicators: true,
        members: { include: { user: { select: { name: true } } } }
      }
    });

    if (!project) throw new NotFoundError('项目不存在');

    // 模拟 AI 项目复盘
    const completedIndicators = project.indicators.filter(i => i.status === 'completed').length;
    const result = {
      summary: `项目 "${project.name}" 复盘分析`,
      overview: {
        status: project.status,
        memberCount: project.members.length,
        indicatorCount: project.indicators.length,
        completedIndicators,
        completionRate: project.indicators.length > 0
          ? ((completedIndicators / project.indicators.length) * 100).toFixed(1) + '%'
          : '0%'
      },
      achievements: [
        '团队协作顺畅',
        '按时完成大部分指标',
        '客户满意度良好'
      ],
      improvements: [
        '需加强进度跟踪频率',
        '优化沟通效率',
        '提前识别风险点'
      ],
      recommendations: [
        '建立定期复盘机制',
        '使用项目管理工具',
        '加强团队能力建设'
      ]
    };

    const analysis = await prisma.aiAnalysis.create({
      data: {
        type: 'project_review',
        targetType: 'project',
        targetId: data.projectId,
        inputData: data,
        result: JSON.stringify(result),
        createdBy: userId
      },
      include: {
        creator: { select: { id: true, name: true } }
      }
    });

    return {
      id: analysis.id,
      projectId: data.projectId,
      project: { id: project.id, name: project.name },
      type: analysis.type,
      inputData: analysis.inputData,
      result: result,
      userId: analysis.createdBy || userId,
      user: analysis.creator ? { id: analysis.creator.id, name: analysis.creator.name } : { id: userId, name: '' },
      createdAt: analysis.createdAt
    };
  }
}

export const aiService = new AiService();
