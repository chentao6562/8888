/**
 * 订单与回款路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as orderController from '../controllers/order.controller';

const router = Router();

router.use(authenticate);

// ==================== 订单 CRUD ====================
router.get('/', orderController.getOrders);
router.get('/statistics', orderController.getStatistics);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', authorize('admin', 'manager'), orderController.deleteOrder);
router.patch('/:id/status', orderController.updateStatus);

// ==================== 回款管理 ====================
router.post('/:id/payments', orderController.addPayment);
router.get('/:id/payments', orderController.getPayments);

export default router;
