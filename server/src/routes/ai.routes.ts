/**
 * AI 分析路由
 */

import { Router } from 'express';
import { authenticate } from '../middlewares';
import * as aiController from '../controllers/ai.controller';

const router = Router();

router.use(authenticate);

router.get('/analyses', aiController.getAnalyses);
router.get('/analyses/:id', aiController.getAnalysisById);
router.post('/traffic-diagnosis', aiController.trafficDiagnosis);
router.post('/content-suggestion', aiController.contentSuggestion);
router.post('/sales-advice', aiController.salesAdvice);
router.post('/project-review', aiController.projectReview);

export default router;
