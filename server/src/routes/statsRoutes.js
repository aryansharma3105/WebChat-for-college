import express from 'express';
import { getAdminStats, getStudentStats } from '../controllers/statsController.js';
import { verifyToken, requireAdmin, requireStudent } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', verifyToken, requireAdmin, getAdminStats);
router.get('/student', verifyToken, requireStudent, getStudentStats);

export default router;
