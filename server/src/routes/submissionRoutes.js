import express from 'express';
import {
  getAllSubmissions,
  getMySubmissions,
  submitAssignment,
  gradeSubmission,
  deleteSubmission,
  clearAllSubmissions
} from '../controllers/submissionController.js';
import { verifyToken, requireAdmin, requireStudent } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', verifyToken, requireAdmin, getAllSubmissions);
router.get('/my', verifyToken, requireStudent, getMySubmissions);
router.post('/:assignmentId', verifyToken, requireStudent, upload.single('submissionFile'), submitAssignment);
router.put('/:id/grade', verifyToken, requireAdmin, gradeSubmission);
router.delete('/clear/all', verifyToken, requireAdmin, clearAllSubmissions);
router.delete('/:id', verifyToken, requireAdmin, deleteSubmission);

export default router;
