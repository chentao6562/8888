/**
 * 流量数据路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import { uploadExcel, uploadCSV } from '../middlewares/upload';
import * as trafficController from '../controllers/traffic.controller';

const router = Router();

router.use(authenticate);

router.get('/', trafficController.getTrafficData);
router.get('/dashboard', trafficController.getDashboard);
router.get('/trend', trafficController.getTrend);
router.post('/import', authorize('admin', 'manager', 'operator'), uploadExcel, trafficController.importTrafficData);
router.post('/import-csv', authorize('admin', 'manager', 'operator'), uploadCSV, trafficController.importCSV);
router.get('/import-records', trafficController.getImportRecords);

export default router;
