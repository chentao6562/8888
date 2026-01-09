/**
 * 通知系统相关 DTO
 */

/**
 * 通知类型枚举
 */
export type NotificationType =
  | 'system'       // 系统通知
  | 'task'         // 任务通知
  | 'lead'         // 线索通知
  | 'payment'      // 回款通知
  | 'report'       // 报告通知
  | 'warning'      // 预警通知
  | 'announcement'; // 公告通知

/**
 * 创建通知 DTO
 */
export interface CreateNotificationDto {
  userId: number;
  type: NotificationType;
  title: string;
  content: string;
  relatedType?: string;
  relatedId?: number;
}

/**
 * 通知查询参数
 */
export interface NotificationQueryDto {
  page?: number;
  pageSize?: number;
  type?: NotificationType;
  isRead?: boolean;
}

/**
 * 通知列表项 DTO
 */
export interface NotificationListItemDto {
  id: number;
  userId: number;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  relatedType: string | null;
  relatedId: number | null;
  createdAt: Date;
}

/**
 * 未读数量 DTO
 */
export interface UnreadCountDto {
  total: number;
  byType: { type: string; count: number }[];
}
