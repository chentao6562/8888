/**
 * 客户管理模块 DTO
 */

export type CustomerLevel = 'vip' | 'important' | 'normal' | 'potential';
export type FollowType = 'call' | 'wechat' | 'meeting' | 'email' | 'other';

export interface CreateCustomerDto {
  name: string;
  phone?: string;
  wechat?: string;
  email?: string;
  company?: string;
  address?: string;
  source?: string;
  level?: CustomerLevel;
  assignedTo?: number;
  remark?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export interface CustomerQueryDto {
  page?: number;
  pageSize?: number;
  keyword?: string;
  level?: CustomerLevel;
  assignedTo?: number;
  tagId?: number;
}

export interface CustomerListItemDto {
  id: number;
  name: string;
  phone?: string | null;
  wechat?: string | null;
  email?: string | null;
  company?: string | null;
  level: string;
  assignedTo?: number | null;
  assigneeName?: string;
  totalAmount: number;
  orderCount: number;
  lastContactAt?: Date | null;
  createdAt: Date;
}

export interface CustomerDetailDto extends CustomerListItemDto {
  address?: string | null;
  source?: string | null;
  remark?: string | null;
  tags: CustomerTagDto[];
  recentFollowLogs: CustomerFollowLogDto[];
  orderSummary: { total: number; amount: number };
}

export interface CustomerTagDto {
  id: number;
  name: string;
  color?: string | null;
  category?: string | null;
}

export interface CreateTagDto {
  name: string;
  color?: string;
  category?: string;
  description?: string;
}

export interface CustomerFollowLogDto {
  id: number;
  customerId: number;
  userId: number;
  userName?: string;
  type: string;
  content: string;
  nextFollowAt?: Date | null;
  createdAt: Date;
}

export interface CreateFollowLogDto {
  type: FollowType;
  content: string;
  nextFollowAt?: string;
}
