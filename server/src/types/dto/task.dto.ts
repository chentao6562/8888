/**
 * 任务管理相关 DTO
 */

/**
 * 任务状态枚举
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * 任务优先级枚举
 */
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';

/**
 * 创建任务 DTO
 */
export interface CreateTaskDto {
  projectId?: number;
  parentId?: number;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: number;
  dueDate?: string;
}

/**
 * 更新任务 DTO
 */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: number;
  dueDate?: string;
}

/**
 * 任务查询参数
 */
export interface TaskQueryDto {
  page?: number;
  pageSize?: number;
  projectId?: number;
  assigneeId?: number;
  creatorId?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 任务列表项 DTO
 */
export interface TaskListItemDto {
  id: number;
  projectId: number | null;
  project?: { id: number; name: string } | null;
  parentId: number | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  creatorId: number;
  creator: { id: number; name: string };
  assigneeId: number | null;
  assignee?: { id: number; name: string } | null;
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subtaskCount?: number;
  completedSubtaskCount?: number;
}

/**
 * 任务详情 DTO（包含子任务）
 */
export interface TaskDetailDto extends TaskListItemDto {
  subtasks: TaskListItemDto[];
  comments: TaskCommentDto[];
}

/**
 * 创建任务评论 DTO
 */
export interface CreateTaskCommentDto {
  content: string;
}

/**
 * 任务评论 DTO
 */
export interface TaskCommentDto {
  id: number;
  taskId: number;
  userId: number;
  user: { id: number; name: string };
  content: string;
  createdAt: Date;
}
