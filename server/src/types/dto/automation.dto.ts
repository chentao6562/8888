/**
 * 自动化规则相关 DTO
 */

/**
 * 触发类型枚举
 */
export type TriggerType = 'schedule' | 'event' | 'condition';

/**
 * 动作类型枚举
 */
export type ActionType =
  | 'notification'     // 发送通知
  | 'task_create'      // 创建任务
  | 'task_assign'      // 分配任务
  | 'report_generate'  // 生成报告
  | 'data_sync'        // 数据同步
  | 'alert';           // 告警

/**
 * 创建自动化规则 DTO
 */
export interface CreateAutomationDto {
  projectId?: number;
  name: string;
  description?: string;
  triggerType: TriggerType;
  triggerConfig: any;
  actionType: ActionType;
  actionConfig: any;
  isActive?: boolean;
}

/**
 * 更新自动化规则 DTO
 */
export interface UpdateAutomationDto {
  name?: string;
  description?: string;
  triggerType?: TriggerType;
  triggerConfig?: any;
  actionType?: ActionType;
  actionConfig?: any;
}

/**
 * 自动化规则查询参数
 */
export interface AutomationQueryDto {
  page?: number;
  pageSize?: number;
  projectId?: number;
  triggerType?: TriggerType;
  actionType?: ActionType;
  isActive?: boolean;
}

/**
 * 自动化规则列表项 DTO
 */
export interface AutomationListItemDto {
  id: number;
  projectId: number | null;
  project?: { id: number; name: string } | null;
  name: string;
  description: string | null;
  triggerType: string;
  triggerConfig: any;
  actionType: string;
  actionConfig: any;
  isActive: boolean;
  lastRunAt: Date | null;
  runCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 执行日志列表项 DTO
 */
export interface AutomationLogListItemDto {
  id: number;
  ruleId: number;
  rule: { id: number; name: string };
  status: string;
  triggerData: any;
  result: any;
  errorMessage: string | null;
  executedAt: Date;
}
