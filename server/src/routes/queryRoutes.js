import express from 'express';
import {
  getAllQueries,
  getQueryById,
  createQuery,
  replyToQuery,
  updateQueryStatus
} from '../controllers/queryController.js';
import { verifyToken, requireAdmin, requireStudent } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getAllQueries);
router.get('/:id', verifyToken, getQueryById);
router.post('/', verifyToken, requireStudent, createQuery);
router.post('/:id/reply', verifyToken, replyToQuery);
router.put('/:id/status', verifyToken, requireAdmin, updateQueryStatus);

export default router;
