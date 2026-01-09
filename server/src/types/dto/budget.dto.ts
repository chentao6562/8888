/**
 * 预算相关 DTO
 */

/**
 * 预算周期枚举
 */
export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly' | 'project';

/**
 * 创建预算 DTO
 */
export interface CreateBudgetDto {
  projectId?: number;
  name: string;
  totalAmount: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  alertRate?: number; // 预警比例，默认 0.8 (80%)
  description?: string;
}

/**
 * 更新预算 DTO
 */
export interface UpdateBudgetDto {
  name?: string;
  totalAmount?: number;
  period?: BudgetPeriod;
  startDate?: string;
  endDate?: string;
  alertRate?: number;
  description?: string;
}

/**
 * 预算查询参数
 */
export interface BudgetQueryDto {
  page?: number;
  pageSize?: number;
  projectId?: number;
  period?: BudgetPeriod;
  status?: 'active' | 'expired' | 'all';
}

/**
 * 预算列表项 DTO
 */
export interface BudgetListItemDto {
  id: number;
  projectId: number | null;
  project?: { id: number; name: string } | null;
  name: string;
  totalAmount: number;
  usedAmount: number;
  period: string;
  startDate: Date;
  endDate: Date;
  alertRate: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  // 计算字段
  remainingAmount: number;
  usageRate: number;
  isOverBudget: boolean;
  isAlert: boolean;
}

/**
 * 预算使用情况 DTO
 */
export interface BudgetUsageDto {
  budget: BudgetListItemDto;
  expenses: {
    id: number;
    category: string;
    amount: number;
    description: string;
    status: string;
    createdAt: Date;
  }[];
  byCategory: { category: string; amount: number; percentage: number }[];
}

/**
 * 预算预警项 DTO
 */
export interface BudgetAlertDto {
  id: number;
  name: string;
  projectName: string | null;
  totalAmount: number;
  usedAmount: number;
  usageRate: number;
  alertRate: number;
  remainingAmount: number;
  endDate: Date;
  daysRemaining: number;
}
