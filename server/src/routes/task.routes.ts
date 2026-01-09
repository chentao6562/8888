/**
 * 任务管理路由
 */

import { Router } from 'express';
import { authenticate, authorize } from '../middlewares';
import * as taskController from '../controllers/task.controller';

const router = Router();

router.use(authenticate);

router.get('/', taskController.getTasks);
router.get('/my', taskController.getMyTasks);
router.get('/:id', taskController.getTaskById);
router.get('/:id/subtasks', taskController.getSubtasks);
router.get('/:id/comments', taskController.getComments);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', authorize('admin', 'manager'), taskController.deleteTask);
router.patch('/:id/status', taskController.updateStatus);
router.post('/:id/comments', taskController.addComment);

export default router;
