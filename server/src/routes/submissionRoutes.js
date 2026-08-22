import express from 'express';
import {
  getAllSubmissions,
  getMySubmissions,
  submitAssignment,
  gradeSubmission
} from '../controllers/submissionController.js';
import { verifyToken, requireAdmin, requireStudent } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', verifyToken, requireAdmin, getAllSubmissions);
router.get('/my', verifyToken, requireStudent, getMySubmissions);
router.post('/:assignmentId', verifyToken, requireStudent, upload.single('submissionFile'), submitAssignment);
router.put('/:id/grade', verifyToken, requireAdmin, gradeSubmission);

export default router;
