/**
 * 线索管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as leadController from '../controllers/lead.controller';

const router = Router();

router.use(authenticate);

router.get('/', leadController.getLeads);
router.get('/funnel', leadController.getFunnel);
router.get('/:id', leadController.getLeadById);
router.post('/', leadController.createLead);
router.put('/:id', leadController.updateLead);
router.delete('/:id', authorize('admin', 'manager'), leadController.deleteLead);
router.post('/:id/logs', leadController.addLog);
router.get('/:id/logs', leadController.getLogs);
router.patch('/:id/assign', authorize('admin', 'manager'), leadController.assignLead);
router.patch('/:id/status', leadController.updateStatus);

export default router;
