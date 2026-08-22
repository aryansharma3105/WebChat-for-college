import express from 'express';
import {
  getAllMarks,
  getMyMarks,
  createMark,
  updateMark,
  deleteMark,
  clearAllMarks
} from '../controllers/markController.js';
import { verifyToken, requireAdmin, requireStudent } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getAllMarks);
router.get('/my', verifyToken, requireStudent, getMyMarks);
router.post('/', verifyToken, requireAdmin, createMark);
router.put('/:id', verifyToken, requireAdmin, updateMark);
router.delete('/clear/all', verifyToken, requireAdmin, clearAllMarks);
router.delete('/:id', verifyToken, requireAdmin, deleteMark);

export default router;
