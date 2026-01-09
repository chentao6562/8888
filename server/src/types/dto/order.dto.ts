/**
 * 订单与回款模块 DTO
 */

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'delivered' | 'completed' | 'cancelled';
export type PaymentMethod = 'transfer' | 'alipay' | 'wechat' | 'cash' | 'other';

export interface CreateOrderDto {
  projectId?: number;
  customerId?: number;
  leadId?: number;
  productName: string;
  amount: number;
  salesId?: number;
  commissionRate?: number;
  signedAt?: string;
  remark?: string;
}

export interface UpdateOrderDto {
  productName?: string;
  amount?: number;
  commissionRate?: number;
  signedAt?: string;
  deliveredAt?: string;
  status?: OrderStatus;
  remark?: string;
}

export interface OrderQueryDto {
  page?: number;
  pageSize?: number;
  projectId?: number;
  customerId?: number;
  salesId?: number;
  paymentStatus?: PaymentStatus;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}

export interface OrderListItemDto {
  id: number;
  orderNo: string;
  projectId?: number | null;
  projectName?: string;
  customerId?: number | null;
  customerName?: string;
  productName: string;
  amount: number;
  paidAmount: number;
  paymentStatus: string;
  salesId?: number | null;
  salesName?: string;
  commissionRate?: number | null;
  commissionAmount?: number | null;
  signedAt?: Date | null;
  status: string;
  createdAt: Date;
}

export interface CreatePaymentDto {
  amount: number;
  paymentMethod: PaymentMethod;
  paidAt: string;
  remark?: string;
}

export interface PaymentDto {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: string;
  paidAt: Date;
  remark?: string | null;
  createdBy?: number | null;
  creatorName?: string;
  createdAt: Date;
}

export interface OrderStatisticsDto {
  totalOrders: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  paymentRate: number;
  monthlyStats: { month: string; orders: number; amount: number }[];
}
