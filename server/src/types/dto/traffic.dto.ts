/**
 * 流量数据模块 DTO
 */

export interface TrafficDataDto {
  id: number;
  accountId: number;
  accountName?: string;
  platform?: string;
  contentTitle?: string | null;
  publishDate?: Date | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  completionRate?: number | null;
  importBatch?: string | null;
  createdAt: Date;
}

export interface TrafficQueryDto {
  page?: number;
  pageSize?: number;
  accountId?: number;
  projectId?: number;
  platform?: string;
  startDate?: string;
  endDate?: string;
}

export interface TrafficDashboardDto {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;
  avgCompletionRate: number;
  contentCount: number;
}

export interface TrafficTrendDto {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface ImportResultDto {
  batchNo: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors?: string[];
}

export interface ImportRecordDto {
  id: number;
  type: string;
  fileName?: string | null;
  batchNo?: string | null;
  totalRows: number;
  successRows: number;
  failedRows: number;
  status: string;
  createdBy?: number | null;
  creatorName?: string;
  createdAt: Date;
}
