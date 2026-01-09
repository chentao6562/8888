/**
 * 项目管理模块 DTO
 */

/**
 * 创建项目请求
 */
export interface CreateProjectDto {
  name: string;
  description?: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  templateId?: number;
}

/**
 * 更新项目请求
 */
export interface UpdateProjectDto {
  name?: string;
  description?: string;
  goal?: string;
  status?: 'active' | 'completed' | 'paused';
  startDate?: string;
  endDate?: string;
}

/**
 * 项目查询参数
 */
export interface ProjectQueryDto {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: 'active' | 'completed' | 'paused';
}

/**
 * 项目列表项
 */
export interface ProjectListItemDto {
  id: number;
  name: string;
  description?: string | null;
  goal?: string | null;
  status: string;
  startDate?: Date | null;
  endDate?: Date | null;
  createdBy?: number | null;
  creatorName?: string;
  memberCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 项目详情
 */
export interface ProjectDetailDto extends ProjectListItemDto {
  members: ProjectMemberDto[];
  stages: ProjectStageDto[];
  indicators: IndicatorDto[];
}

/**
 * 项目成员
 */
export interface ProjectMemberDto {
  id: number;
  userId: number;
  username: string;
  name: string;
  role?: string | null;
  avatar?: string | null;
  joinedAt: Date;
}

/**
 * 添加成员请求
 */
export interface AddMemberDto {
  userId: number;
  role?: string;
}

/**
 * 项目阶段
 */
export interface ProjectStageDto {
  id: number;
  name: string;
  description?: string | null;
  sortOrder: number;
  status: string;
  startDate?: Date | null;
  endDate?: Date | null;
  dueDate?: Date | null;
}

/**
 * 创建阶段请求
 */
export interface CreateStageDto {
  name: string;
  description?: string;
  sortOrder?: number;
  dueDate?: string;
}

/**
 * 更新阶段请求
 */
export interface UpdateStageDto {
  name?: string;
  description?: string;
  sortOrder?: number;
  status?: 'pending' | 'in_progress' | 'completed' | 'delayed';
  startDate?: string;
  endDate?: string;
  dueDate?: string;
}

/**
 * 项目指标
 */
export interface IndicatorDto {
  id: number;
  name: string;
  description?: string | null;
  targetValue: number;
  currentValue: number;
  unit?: string | null;
  priority: string;
  assignedTo?: number | null;
  assigneeName?: string;
  dueDate?: Date | null;
  status: string;
}

/**
 * 创建指标请求
 */
export interface CreateIndicatorDto {
  name: string;
  description?: string;
  targetValue: number;
  unit?: string;
  priority?: 'urgent_important' | 'important' | 'urgent' | 'normal';
  assignedTo?: number;
  dueDate?: string;
}

/**
 * 更新指标请求
 */
export interface UpdateIndicatorDto {
  name?: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  priority?: 'urgent_important' | 'important' | 'urgent' | 'normal';
  assignedTo?: number;
  dueDate?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}
