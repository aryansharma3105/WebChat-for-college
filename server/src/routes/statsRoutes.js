import express from 'express';
import { getAdminStats, getStudentStats, resetSystemData } from '../controllers/statsController.js';
import { verifyToken, requireAdmin, requireStudent } from '../middleware/auth.js';

const router = express.Router();

router.get('/admin', verifyToken, requireAdmin, getAdminStats);
router.get('/student', verifyToken, requireStudent, getStudentStats);
router.post('/admin/reset-data', verifyToken, requireAdmin, resetSystemData);

export default router;
