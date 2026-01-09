/**
 * 账号管理模块 DTO
 */

export type Platform = 'douyin' | 'kuaishou' | 'xiaohongshu' | 'shipinhao';

export interface CreateAccountDto {
  projectId?: number;
  platform: Platform;
  accountName: string;
  accountId?: string;
  followers?: number;
  operatorId?: number;
}

export interface UpdateAccountDto {
  projectId?: number;
  platform?: Platform;
  accountName?: string;
  accountId?: string;
  followers?: number;
  operatorId?: number;
  status?: number;
}

export interface AccountQueryDto {
  page?: number;
  pageSize?: number;
  projectId?: number;
  platform?: Platform;
  keyword?: string;
  status?: number;
}

export interface AccountListItemDto {
  id: number;
  projectId?: number | null;
  projectName?: string;
  platform: string;
  accountName: string;
  accountId?: string | null;
  followers: number;
  operatorId?: number | null;
  operatorName?: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
}
