/**
 * 线索管理模块 DTO
 */

export type LeadStatus = 'pending' | 'following' | 'converted' | 'lost' | 'hold';
export type SourcePlatform = 'douyin' | 'kuaishou' | 'xiaohongshu' | 'shipinhao' | 'wechat' | 'other';
export type SourceType = 'private_message' | 'to_wechat' | 'first_sale' | 'repeat_sale';

export interface CreateLeadDto {
  projectId?: number;
  customerName?: string;
  phone?: string;
  wechat?: string;
  sourcePlatform: SourcePlatform;
  sourceType: SourceType;
  assignedTo?: number;
  amount?: number;
  remark?: string;
}

export interface UpdateLeadDto {
  customerName?: string;
  phone?: string;
  wechat?: string;
  sourcePlatform?: SourcePlatform;
  sourceType?: SourceType;
  assignedTo?: number;
  status?: LeadStatus;
  amount?: number;
  remark?: string;
}

export interface LeadQueryDto {
  page?: number;
  pageSize?: number;
  projectId?: number;
  status?: LeadStatus;
  sourcePlatform?: SourcePlatform;
  assignedTo?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface LeadListItemDto {
  id: number;
  projectId?: number | null;
  projectName?: string;
  customerName?: string | null;
  phone?: string | null;
  wechat?: string | null;
  sourcePlatform: string;
  sourceType: string;
  assignedTo?: number | null;
  assigneeName?: string;
  status: string;
  amount: number;
  remark?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadLogDto {
  id: number;
  leadId: number;
  userId: number;
  userName?: string;
  action?: string | null;
  content?: string | null;
  createdAt: Date;
}

export interface CreateLeadLogDto {
  action?: string;
  content: string;
}

export interface LeadFunnelDto {
  pending: number;
  following: number;
  converted: number;
  lost: number;
  hold: number;
  conversionRate: number;
}
