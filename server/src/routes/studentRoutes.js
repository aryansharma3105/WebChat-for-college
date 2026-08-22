import express from 'express';
import {
  getAllStudents,
  getStudentById,
  removeStudent
} from '../controllers/studentController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, requireAdmin, getAllStudents);
router.get('/:id', verifyToken, getStudentById);
router.delete('/:id', verifyToken, requireAdmin, removeStudent);

export default router;
