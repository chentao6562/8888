/**
 * 项目管理服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError, ConflictError, BadRequestError, ForbiddenError } from '../types';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectQueryDto,
  ProjectListItemDto,
  ProjectDetailDto,
  ProjectMemberDto,
  AddMemberDto,
  ProjectStageDto,
  CreateStageDto,
  UpdateStageDto,
  IndicatorDto,
  CreateIndicatorDto,
  UpdateIndicatorDto
} from '../types/dto/project.dto';

/**
 * 项目管理服务类
 */
export class ProjectService {
  /**
   * 获取项目列表
   */
  async findAll(
    params: ProjectQueryDto,
    userId: number,
    userRole: string
  ): Promise<PaginatedResult<ProjectListItemDto>> {
    const { page = 1, pageSize = 20, keyword, status } = params;

    // 构建查询条件
    const where: any = {};

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } }
      ];
    }

    if (status) {
      where.status = status;
    }

    // 非管理员只能看到自己参与的项目
    if (userRole !== 'admin' && userRole !== 'manager') {
      where.members = {
        some: { userId }
      };
    }

    const total = await prisma.project.count({ where });

    const projects = await prisma.project.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { name: true } },
        _count: { select: { members: true } }
      }
    });

    const items: ProjectListItemDto[] = projects.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      goal: p.goal,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
      createdBy: p.createdBy,
      creatorName: p.creator?.name,
      memberCount: p._count.members,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  /**
   * 获取项目详情
   */
  async findById(id: number, userId: number, userRole: string): Promise<ProjectDetailDto> {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true } },
        members: {
          include: {
            user: { select: { id: true, username: true, name: true, avatar: true } }
          }
        },
        stages: { orderBy: { sortOrder: 'asc' } },
        indicators: {
          include: {
            assignee: { select: { name: true } }
          }
        }
      }
    });

    if (!project) {
      throw new NotFoundError('项目不存在');
    }

    // 检查权限
    if (userRole !== 'admin' && userRole !== 'manager') {
      const isMember = project.members.some(m => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenError('无权访问此项目');
      }
    }

    const members: ProjectMemberDto[] = project.members.map(m => ({
      id: m.id,
      userId: m.user.id,
      username: m.user.username,
      name: m.user.name,
      role: m.role,
      avatar: m.user.avatar,
      joinedAt: m.joinedAt
    }));

    const stages: ProjectStageDto[] = project.stages.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      sortOrder: s.sortOrder,
      status: s.status,
      startDate: s.startDate,
      endDate: s.endDate,
      dueDate: s.dueDate
    }));

    const indicators: IndicatorDto[] = project.indicators.map(i => ({
      id: i.id,
      name: i.name,
      description: i.description,
      targetValue: Number(i.targetValue),
      currentValue: Number(i.currentValue),
      unit: i.unit,
      priority: i.priority,
      assignedTo: i.assignedTo,
      assigneeName: i.assignee?.name,
      dueDate: i.dueDate,
      status: i.status
    }));

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      goal: project.goal,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      createdBy: project.createdBy,
      creatorName: project.creator?.name,
      memberCount: members.length,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      members,
      stages,
      indicators
    };
  }

  /**
   * 创建项目
   */
  async create(data: CreateProjectDto, creatorId: number): Promise<ProjectListItemDto> {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        goal: data.goal,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        templateId: data.templateId,
        createdBy: creatorId,
        members: {
          create: { userId: creatorId, role: '项目负责人' }
        }
      },
      include: {
        creator: { select: { name: true } },
        _count: { select: { members: true } }
      }
    });

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      goal: project.goal,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      createdBy: project.createdBy,
      creatorName: project.creator?.name,
      memberCount: project._count.members,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };
  }

  /**
   * 更新项目
   */
  async update(id: number, data: UpdateProjectDto): Promise<ProjectListItemDto> {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('项目不存在');
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        goal: data.goal,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined
      },
      include: {
        creator: { select: { name: true } },
        _count: { select: { members: true } }
      }
    });

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      goal: project.goal,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      createdBy: project.createdBy,
      creatorName: project.creator?.name,
      memberCount: project._count.members,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };
  }

  /**
   * 删除项目
   */
  async delete(id: number): Promise<void> {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('项目不存在');
    }

    // 删除关联数据
    await prisma.$transaction([
      prisma.projectMember.deleteMany({ where: { projectId: id } }),
      prisma.projectStage.deleteMany({ where: { projectId: id } }),
      prisma.indicator.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } })
    ]);
  }

  /**
   * 添加成员
   */
  async addMember(projectId: number, data: AddMemberDto): Promise<ProjectMemberDto> {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundError('项目不存在');
    }

    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: data.userId } }
    });
    if (existing) {
      throw new ConflictError('该用户已是项目成员');
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: data.userId,
        role: data.role
      },
      include: {
        user: { select: { id: true, username: true, name: true, avatar: true } }
      }
    });

    return {
      id: member.id,
      userId: member.user.id,
      username: member.user.username,
      name: member.user.name,
      role: member.role,
      avatar: member.user.avatar,
      joinedAt: member.joinedAt
    };
  }

  /**
   * 移除成员
   */
  async removeMember(projectId: number, userId: number): Promise<void> {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } }
    });
    if (!member) {
      throw new NotFoundError('成员不存在');
    }

    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } }
    });
  }

  /**
   * 创建阶段
   */
  async createStage(projectId: number, data: CreateStageDto): Promise<ProjectStageDto> {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundError('项目不存在');
    }

    const stage = await prisma.projectStage.create({
      data: {
        projectId,
        name: data.name,
        description: data.description,
        sortOrder: data.sortOrder || 0,
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      }
    });

    return {
      id: stage.id,
      name: stage.name,
      description: stage.description,
      sortOrder: stage.sortOrder,
      status: stage.status,
      startDate: stage.startDate,
      endDate: stage.endDate,
      dueDate: stage.dueDate
    };
  }

  /**
   * 更新阶段
   */
  async updateStage(projectId: number, stageId: number, data: UpdateStageDto): Promise<ProjectStageDto> {
    const stage = await prisma.projectStage.findFirst({
      where: { id: stageId, projectId }
    });
    if (!stage) {
      throw new NotFoundError('阶段不存在');
    }

    const updated = await prisma.projectStage.update({
      where: { id: stageId },
      data: {
        name: data.name,
        description: data.description,
        sortOrder: data.sortOrder,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      }
    });

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      sortOrder: updated.sortOrder,
      status: updated.status,
      startDate: updated.startDate,
      endDate: updated.endDate,
      dueDate: updated.dueDate
    };
  }

  /**
   * 创建指标
   */
  async createIndicator(projectId: number, data: CreateIndicatorDto): Promise<IndicatorDto> {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundError('项目不存在');
    }

    const indicator = await prisma.indicator.create({
      data: {
        projectId,
        name: data.name,
        description: data.description,
        targetValue: data.targetValue,
        unit: data.unit,
        priority: data.priority || 'normal',
        assignedTo: data.assignedTo,
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      },
      include: {
        assignee: { select: { name: true } }
      }
    });

    return {
      id: indicator.id,
      name: indicator.name,
      description: indicator.description,
      targetValue: Number(indicator.targetValue),
      currentValue: Number(indicator.currentValue),
      unit: indicator.unit,
      priority: indicator.priority,
      assignedTo: indicator.assignedTo,
      assigneeName: indicator.assignee?.name,
      dueDate: indicator.dueDate,
      status: indicator.status
    };
  }

  /**
   * 更新指标
   */
  async updateIndicator(projectId: number, indicatorId: number, data: UpdateIndicatorDto): Promise<IndicatorDto> {
    const indicator = await prisma.indicator.findFirst({
      where: { id: indicatorId, projectId }
    });
    if (!indicator) {
      throw new NotFoundError('指标不存在');
    }

    const updated = await prisma.indicator.update({
      where: { id: indicatorId },
      data: {
        name: data.name,
        description: data.description,
        targetValue: data.targetValue,
        currentValue: data.currentValue,
        unit: data.unit,
        priority: data.priority,
        assignedTo: data.assignedTo,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: data.status
      },
      include: {
        assignee: { select: { name: true } }
      }
    });

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      targetValue: Number(updated.targetValue),
      currentValue: Number(updated.currentValue),
      unit: updated.unit,
      priority: updated.priority,
      assignedTo: updated.assignedTo,
      assigneeName: updated.assignee?.name,
      dueDate: updated.dueDate,
      status: updated.status
    };
  }

  /**
   * 获取阶段列表
   */
  async getStages(projectId: number): Promise<ProjectStageDto[]> {
    const stages = await prisma.projectStage.findMany({
      where: { projectId },
      orderBy: { sortOrder: 'asc' }
    });

    return stages.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      sortOrder: s.sortOrder,
      status: s.status,
      startDate: s.startDate,
      endDate: s.endDate,
      dueDate: s.dueDate
    }));
  }

  /**
   * 获取指标列表
   */
  async getIndicators(projectId: number): Promise<IndicatorDto[]> {
    const indicators = await prisma.indicator.findMany({
      where: { projectId },
      include: {
        assignee: { select: { name: true } }
      }
    });

    return indicators.map(i => ({
      id: i.id,
      name: i.name,
      description: i.description,
      targetValue: Number(i.targetValue),
      currentValue: Number(i.currentValue),
      unit: i.unit,
      priority: i.priority,
      assignedTo: i.assignedTo,
      assigneeName: i.assignee?.name,
      dueDate: i.dueDate,
      status: i.status
    }));
  }
}

export const projectService = new ProjectService();
