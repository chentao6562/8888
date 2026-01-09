/**
 * 任务管理服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError } from '../types';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskQueryDto,
  TaskListItemDto,
  TaskDetailDto,
  TaskCommentDto,
  CreateTaskCommentDto
} from '../types/dto/task.dto';

export class TaskService {
  async findAll(params: TaskQueryDto): Promise<PaginatedResult<TaskListItemDto>> {
    const { page = 1, pageSize = 20, projectId, assigneeId, status, priority, keyword, startDate, endDate } = params;

    const where: any = { parentId: null }; // 只查询主任务
    if (projectId) where.projectId = projectId;
    if (assigneeId) where.assigneeId = assigneeId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } }
      ];
    }
    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate);
      if (endDate) where.dueDate.lte = new Date(endDate);
    }

    const total = await prisma.task.count({ where });
    const tasks = await prisma.task.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
      include: {
        project: { select: { id: true, name: true } },
        assigner: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        subTasks: { select: { id: true, status: true } }
      }
    });

    const items: TaskListItemDto[] = tasks.map(t => ({
      id: t.id,
      projectId: t.projectId,
      project: t.project ? { id: t.project.id, name: t.project.name } : null,
      parentId: t.parentId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      creatorId: t.assignerId || 0,
      creator: t.assigner ? { id: t.assigner.id, name: t.assigner.name } : { id: 0, name: '' },
      assigneeId: t.assigneeId,
      assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name } : null,
      dueDate: t.dueDate,
      completedAt: t.completedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      subtaskCount: t.subTasks.length,
      completedSubtaskCount: t.subTasks.filter(s => s.status === 'completed').length
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async findMyTasks(userId: number, params: TaskQueryDto): Promise<PaginatedResult<TaskListItemDto>> {
    return this.findAll({ ...params, assigneeId: userId });
  }

  async findById(id: number): Promise<TaskDetailDto> {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        assigner: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
        subTasks: {
          include: {
            assigner: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!task) throw new NotFoundError('任务不存在');

    return {
      id: task.id,
      projectId: task.projectId,
      project: task.project ? { id: task.project.id, name: task.project.name } : null,
      parentId: task.parentId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      creatorId: task.assignerId || 0,
      creator: task.assigner ? { id: task.assigner.id, name: task.assigner.name } : { id: 0, name: '' },
      assigneeId: task.assigneeId,
      assignee: task.assignee ? { id: task.assignee.id, name: task.assignee.name } : null,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      subtaskCount: task.subTasks.length,
      completedSubtaskCount: task.subTasks.filter(s => s.status === 'completed').length,
      subtasks: task.subTasks.map(s => ({
        id: s.id,
        projectId: s.projectId,
        parentId: s.parentId,
        title: s.title,
        description: s.description,
        status: s.status,
        priority: s.priority,
        creatorId: s.assignerId || 0,
        creator: s.assigner ? { id: s.assigner.id, name: s.assigner.name } : { id: 0, name: '' },
        assigneeId: s.assigneeId,
        assignee: s.assignee ? { id: s.assignee.id, name: s.assignee.name } : null,
        dueDate: s.dueDate,
        completedAt: s.completedAt,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      })),
      comments: task.comments.map(c => ({
        id: c.id,
        taskId: c.taskId,
        userId: c.userId,
        user: { id: c.user.id, name: c.user.name },
        content: c.content,
        createdAt: c.createdAt
      }))
    };
  }

  async create(userId: number, data: CreateTaskDto): Promise<TaskListItemDto> {
    const task = await prisma.task.create({
      data: {
        projectId: data.projectId,
        parentId: data.parentId,
        title: data.title,
        description: data.description,
        priority: data.priority as any || 'normal',
        assigneeId: data.assigneeId,
        assignerId: userId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      },
      include: {
        project: { select: { id: true, name: true } },
        assigner: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } }
      }
    });

    return {
      id: task.id,
      projectId: task.projectId,
      project: task.project ? { id: task.project.id, name: task.project.name } : null,
      parentId: task.parentId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      creatorId: task.assignerId || userId,
      creator: task.assigner ? { id: task.assigner.id, name: task.assigner.name } : { id: userId, name: '' },
      assigneeId: task.assigneeId,
      assignee: task.assignee ? { id: task.assignee.id, name: task.assignee.name } : null,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  }

  async update(id: number, data: UpdateTaskDto): Promise<TaskListItemDto> {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('任务不存在');

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority as any,
        assigneeId: data.assigneeId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      },
      include: {
        project: { select: { id: true, name: true } },
        assigner: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } }
      }
    });

    return {
      id: task.id,
      projectId: task.projectId,
      project: task.project ? { id: task.project.id, name: task.project.name } : null,
      parentId: task.parentId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      creatorId: task.assignerId || 0,
      creator: task.assigner ? { id: task.assigner.id, name: task.assigner.name } : { id: 0, name: '' },
      assigneeId: task.assigneeId,
      assignee: task.assignee ? { id: task.assignee.id, name: task.assignee.name } : null,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('任务不存在');

    await prisma.$transaction([
      prisma.taskComment.deleteMany({ where: { taskId: id } }),
      prisma.task.deleteMany({ where: { parentId: id } }), // 删除子任务
      prisma.task.delete({ where: { id } })
    ]);
  }

  async updateStatus(id: number, status: string): Promise<TaskListItemDto> {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('任务不存在');

    const updateData: any = { status: status as any };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (existing.status === 'completed') {
      updateData.completedAt = null;
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true } },
        assigner: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } }
      }
    });

    return {
      id: task.id,
      projectId: task.projectId,
      project: task.project ? { id: task.project.id, name: task.project.name } : null,
      parentId: task.parentId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      creatorId: task.assignerId || 0,
      creator: task.assigner ? { id: task.assigner.id, name: task.assigner.name } : { id: 0, name: '' },
      assigneeId: task.assigneeId,
      assignee: task.assignee ? { id: task.assignee.id, name: task.assignee.name } : null,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  }

  async addComment(taskId: number, userId: number, data: CreateTaskCommentDto): Promise<TaskCommentDto> {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('任务不存在');

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content: data.content
      },
      include: { user: { select: { id: true, name: true } } }
    });

    return {
      id: comment.id,
      taskId: comment.taskId,
      userId: comment.userId,
      user: { id: comment.user.id, name: comment.user.name },
      content: comment.content,
      createdAt: comment.createdAt
    };
  }

  async getComments(taskId: number): Promise<TaskCommentDto[]> {
    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } }
    });

    return comments.map(c => ({
      id: c.id,
      taskId: c.taskId,
      userId: c.userId,
      user: { id: c.user.id, name: c.user.name },
      content: c.content,
      createdAt: c.createdAt
    }));
  }

  async getSubtasks(taskId: number): Promise<TaskListItemDto[]> {
    const subtasks = await prisma.task.findMany({
      where: { parentId: taskId },
      orderBy: { createdAt: 'asc' },
      include: {
        assigner: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } }
      }
    });

    return subtasks.map(t => ({
      id: t.id,
      projectId: t.projectId,
      parentId: t.parentId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      creatorId: t.assignerId || 0,
      creator: t.assigner ? { id: t.assigner.id, name: t.assigner.name } : { id: 0, name: '' },
      assigneeId: t.assigneeId,
      assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name } : null,
      dueDate: t.dueDate,
      completedAt: t.completedAt,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    }));
  }
}

export const taskService = new TaskService();
