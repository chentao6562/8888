/**
 * AI 分析相关 DTO
 */

/**
 * AI 分析类型枚举
 */
export type AiAnalysisType =
  | 'traffic_diagnosis'   // 流量诊断
  | 'content_suggestion'  // 内容建议
  | 'sales_advice'        // 销售策略
  | 'performance'         // 绩效分析
  | 'project_review'      // 项目复盘
  | 'leader_report';      // 领导汇报

/**
 * 流量诊断请求 DTO
 */
export interface TrafficDiagnosisRequestDto {
  accountId?: number;
  projectId?: number;
  startDate: string;
  endDate: string;
}

/**
 * 内容建议请求 DTO
 */
export interface ContentSuggestionRequestDto {
  accountId?: number;
  projectId?: number;
  contentType?: string;
  targetAudience?: string;
}

/**
 * 销售建议请求 DTO
 */
export interface SalesAdviceRequestDto {
  customerId?: number;
  leadId?: number;
  context?: string;
}

/**
 * 项目复盘请求 DTO
 */
export interface ProjectReviewRequestDto {
  projectId: number;
  startDate?: string;
  endDate?: string;
}

/**
 * AI 分析查询参数
 */
export interface AiAnalysisQueryDto {
  page?: number;
  pageSize?: number;
  type?: AiAnalysisType;
  projectId?: number;
}

/**
 * AI 分析列表项 DTO
 */
export interface AiAnalysisListItemDto {
  id: number;
  projectId: number | null;
  project?: { id: number; name: string } | null;
  type: string;
  inputData: any;
  result: any;
  userId: number;
  user: { id: number; name: string };
  createdAt: Date;
}
