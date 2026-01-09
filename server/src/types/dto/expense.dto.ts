/**
 * 支出相关 DTO
 */

/**
 * 支出分类枚举
 */
export type ExpenseCategory =
  | 'ad_cost'      // 广告费用
  | 'platform_fee' // 平台费用
  | 'labor_cost'   // 人工成本
  | 'equipment'    // 设备采购
  | 'office'       // 办公费用
  | 'travel'       // 差旅费用
  | 'marketing'    // 营销推广
  | 'other';       // 其他

/**
 * 支出状态枚举
 */
export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'paid';

/**
 * 创建支出 DTO
 */
export interface CreateExpenseDto {
  projectId?: number;
  budgetId?: number;
  category: ExpenseCategory;
  amount: number;
  description: string;
  attachments?: string;
  expectedDate?: string;
}

/**
 * 更新支出 DTO
 */
export interface UpdateExpenseDto {
  category?: ExpenseCategory;
  amount?: number;
  description?: string;
  attachments?: string;
  expectedDate?: string;
}

/**
 * 审批支出 DTO
 */
export interface ApproveExpenseDto {
  status: 'approved' | 'rejected';
  approvalNote?: string;
}

/**
 * 支出查询参数
 */
export interface ExpenseQueryDto {
  page?: number;
  pageSize?: number;
  projectId?: number;
  budgetId?: number;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  applicantId?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * 支出列表项 DTO
 */
export interface ExpenseListItemDto {
  id: number;
  projectId: number | null;
  project?: { id: number; name: string } | null;
  budgetId: number | null;
  budget?: { id: number; name: string } | null;
  category: string;
  amount: number;
  description: string;
  attachments: string | null;
  status: string;
  applicantId: number;
  applicant: { id: number; name: string };
  approverId: number | null;
  approver?: { id: number; name: string } | null;
  approvalNote: string | null;
  approvedAt: Date | null;
  expectedDate: Date | null;
  paidAt: Date | null;
  createdAt: Date;
}

/**
 * 支出统计 DTO
 */
export interface ExpenseStatisticsDto {
  totalAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  rejectedAmount: number;
  byCategory: { category: string; amount: number; count: number }[];
  byMonth: { month: string; amount: number }[];
}
