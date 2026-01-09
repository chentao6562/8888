/**
 * 订单与回款服务
 */

import { prisma } from '../utils/prisma';
import { PaginatedResult, NotFoundError } from '../types';
import {
  CreateOrderDto,
  UpdateOrderDto,
  OrderQueryDto,
  OrderListItemDto,
  CreatePaymentDto,
  PaymentDto,
  OrderStatisticsDto
} from '../types/dto/order.dto';

export class OrderService {
  // ==================== 订单 CRUD ====================

  async findAll(params: OrderQueryDto): Promise<PaginatedResult<OrderListItemDto>> {
    const { page = 1, pageSize = 20, projectId, customerId, salesId, paymentStatus, status, startDate, endDate } = params;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (customerId) where.customerId = customerId;
    if (salesId) where.salesId = salesId;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.signedAt = {};
      if (startDate) where.signedAt.gte = new Date(startDate);
      if (endDate) where.signedAt.lte = new Date(endDate);
    }

    const total = await prisma.order.count({ where });
    const orders = await prisma.order.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { name: true } },
        customer: { select: { name: true } },
        sales: { select: { name: true } }
      }
    });

    const items: OrderListItemDto[] = orders.map(o => ({
      id: o.id,
      orderNo: o.orderNo,
      projectId: o.projectId,
      projectName: o.project?.name,
      customerId: o.customerId,
      customerName: o.customer?.name,
      productName: o.productName,
      amount: Number(o.amount),
      paidAmount: Number(o.paidAmount),
      paymentStatus: o.paymentStatus,
      salesId: o.salesId,
      salesName: o.sales?.name,
      commissionRate: o.commissionRate ? Number(o.commissionRate) : null,
      commissionAmount: o.commissionAmount ? Number(o.commissionAmount) : null,
      signedAt: o.signedAt,
      status: o.status,
      createdAt: o.createdAt
    }));

    return {
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
    };
  }

  async findById(id: number): Promise<OrderListItemDto> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        project: { select: { name: true } },
        customer: { select: { name: true } },
        sales: { select: { name: true } }
      }
    });

    if (!order) throw new NotFoundError('订单不存在');

    return {
      id: order.id,
      orderNo: order.orderNo,
      projectId: order.projectId,
      projectName: order.project?.name,
      customerId: order.customerId,
      customerName: order.customer?.name,
      productName: order.productName,
      amount: Number(order.amount),
      paidAmount: Number(order.paidAmount),
      paymentStatus: order.paymentStatus,
      salesId: order.salesId,
      salesName: order.sales?.name,
      commissionRate: order.commissionRate ? Number(order.commissionRate) : null,
      commissionAmount: order.commissionAmount ? Number(order.commissionAmount) : null,
      signedAt: order.signedAt,
      status: order.status,
      createdAt: order.createdAt
    };
  }

  async create(data: CreateOrderDto): Promise<OrderListItemDto> {
    // 生成订单编号：ORD + 年月日 + 4位序号
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `ORD${dateStr}`;

    const lastOrder = await prisma.order.findFirst({
      where: { orderNo: { startsWith: prefix } },
      orderBy: { orderNo: 'desc' }
    });

    let seq = 1;
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.orderNo.slice(-4));
      seq = lastSeq + 1;
    }
    const orderNo = `${prefix}${seq.toString().padStart(4, '0')}`;

    // 计算提成金额
    let commissionAmount: number | null = null;
    if (data.commissionRate && data.amount) {
      commissionAmount = data.amount * data.commissionRate / 100;
    }

    const order = await prisma.order.create({
      data: {
        orderNo,
        projectId: data.projectId,
        customerId: data.customerId,
        leadId: data.leadId,
        productName: data.productName,
        amount: data.amount,
        salesId: data.salesId,
        commissionRate: data.commissionRate,
        commissionAmount,
        signedAt: data.signedAt ? new Date(data.signedAt) : null,
        remark: data.remark
      },
      include: {
        project: { select: { name: true } },
        customer: { select: { name: true } },
        sales: { select: { name: true } }
      }
    });

    return {
      id: order.id,
      orderNo: order.orderNo,
      projectId: order.projectId,
      projectName: order.project?.name,
      customerId: order.customerId,
      customerName: order.customer?.name,
      productName: order.productName,
      amount: Number(order.amount),
      paidAmount: Number(order.paidAmount),
      paymentStatus: order.paymentStatus,
      salesId: order.salesId,
      salesName: order.sales?.name,
      commissionRate: order.commissionRate ? Number(order.commissionRate) : null,
      commissionAmount: order.commissionAmount ? Number(order.commissionAmount) : null,
      signedAt: order.signedAt,
      status: order.status,
      createdAt: order.createdAt
    };
  }

  async update(id: number, data: UpdateOrderDto): Promise<OrderListItemDto> {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('订单不存在');

    // 重新计算提成金额
    let commissionAmount = existing.commissionAmount;
    const amount = data.amount ?? Number(existing.amount);
    const commissionRate = data.commissionRate ?? (existing.commissionRate ? Number(existing.commissionRate) : null);
    if (commissionRate) {
      commissionAmount = amount * commissionRate / 100 as any;
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        productName: data.productName,
        amount: data.amount,
        commissionRate: data.commissionRate,
        commissionAmount,
        signedAt: data.signedAt ? new Date(data.signedAt) : undefined,
        deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : undefined,
        status: data.status as any,
        remark: data.remark
      },
      include: {
        project: { select: { name: true } },
        customer: { select: { name: true } },
        sales: { select: { name: true } }
      }
    });

    return {
      id: order.id,
      orderNo: order.orderNo,
      projectId: order.projectId,
      projectName: order.project?.name,
      customerId: order.customerId,
      customerName: order.customer?.name,
      productName: order.productName,
      amount: Number(order.amount),
      paidAmount: Number(order.paidAmount),
      paymentStatus: order.paymentStatus,
      salesId: order.salesId,
      salesName: order.sales?.name,
      commissionRate: order.commissionRate ? Number(order.commissionRate) : null,
      commissionAmount: order.commissionAmount ? Number(order.commissionAmount) : null,
      signedAt: order.signedAt,
      status: order.status,
      createdAt: order.createdAt
    };
  }

  async delete(id: number): Promise<void> {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('订单不存在');

    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { orderId: id } }),
      prisma.order.delete({ where: { id } })
    ]);
  }

  async updateStatus(id: number, status: string): Promise<OrderListItemDto> {
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('订单不存在');

    const order = await prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: {
        project: { select: { name: true } },
        customer: { select: { name: true } },
        sales: { select: { name: true } }
      }
    });

    // 如果订单完成且有客户，更新客户统计
    if (status === 'completed' && order.customerId) {
      const customerOrders = await prisma.order.findMany({
        where: { customerId: order.customerId, status: 'completed' }
      });
      const totalAmount = customerOrders.reduce((sum, o) => sum + Number(o.amount), 0);
      await prisma.customer.update({
        where: { id: order.customerId },
        data: {
          totalAmount,
          orderCount: customerOrders.length
        }
      });
    }

    return {
      id: order.id,
      orderNo: order.orderNo,
      projectId: order.projectId,
      projectName: order.project?.name,
      customerId: order.customerId,
      customerName: order.customer?.name,
      productName: order.productName,
      amount: Number(order.amount),
      paidAmount: Number(order.paidAmount),
      paymentStatus: order.paymentStatus,
      salesId: order.salesId,
      salesName: order.sales?.name,
      commissionRate: order.commissionRate ? Number(order.commissionRate) : null,
      commissionAmount: order.commissionAmount ? Number(order.commissionAmount) : null,
      signedAt: order.signedAt,
      status: order.status,
      createdAt: order.createdAt
    };
  }

  // ==================== 回款管理 ====================

  async addPayment(orderId: number, userId: number, data: CreatePaymentDto): Promise<PaymentDto> {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundError('订单不存在');

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount: data.amount,
        paymentMethod: data.paymentMethod as any,
        paidAt: new Date(data.paidAt),
        remark: data.remark,
        createdBy: userId
      },
      include: { creator: { select: { name: true } } }
    });

    // 更新订单的已回款金额和回款状态
    const totalPaid = Number(order.paidAmount) + data.amount;
    const orderAmount = Number(order.amount);
    let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'partial';
    if (totalPaid >= orderAmount) {
      paymentStatus = 'paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'partial';
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { paidAmount: totalPaid, paymentStatus }
    });

    return {
      id: payment.id,
      orderId: payment.orderId,
      amount: Number(payment.amount),
      paymentMethod: payment.paymentMethod,
      paidAt: payment.paidAt,
      remark: payment.remark,
      createdBy: payment.createdBy,
      creatorName: payment.creator?.name,
      createdAt: payment.createdAt
    };
  }

  async getPayments(orderId: number): Promise<PaymentDto[]> {
    const payments = await prisma.payment.findMany({
      where: { orderId },
      orderBy: { paidAt: 'desc' },
      include: { creator: { select: { name: true } } }
    });

    return payments.map(p => ({
      id: p.id,
      orderId: p.orderId,
      amount: Number(p.amount),
      paymentMethod: p.paymentMethod,
      paidAt: p.paidAt,
      remark: p.remark,
      createdBy: p.createdBy,
      creatorName: p.creator?.name,
      createdAt: p.createdAt
    }));
  }

  // ==================== 统计 ====================

  async getStatistics(params?: { startDate?: string; endDate?: string }): Promise<OrderStatisticsDto> {
    const where: any = {};
    if (params?.startDate || params?.endDate) {
      where.signedAt = {};
      if (params.startDate) where.signedAt.gte = new Date(params.startDate);
      if (params.endDate) where.signedAt.lte = new Date(params.endDate);
    }

    const orders = await prisma.order.findMany({ where });

    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, o) => sum + Number(o.amount), 0);
    const paidAmount = orders.reduce((sum, o) => sum + Number(o.paidAmount), 0);
    const unpaidAmount = totalAmount - paidAmount;
    const paymentRate = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100 * 100) / 100 : 0;

    // 按月统计
    const monthlyMap = new Map<string, { orders: number; amount: number }>();
    for (const order of orders) {
      if (order.signedAt) {
        const month = order.signedAt.toISOString().slice(0, 7);
        const existing = monthlyMap.get(month) || { orders: 0, amount: 0 };
        existing.orders++;
        existing.amount += Number(order.amount);
        monthlyMap.set(month, existing);
      }
    }

    const monthlyStats = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalOrders,
      totalAmount,
      paidAmount,
      unpaidAmount,
      paymentRate,
      monthlyStats
    };
  }
}

export const orderService = new OrderService();
