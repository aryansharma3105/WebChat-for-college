import express from 'express';
import {
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment
} from '../controllers/assignmentController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', verifyToken, getAllAssignments);
router.get('/:id', verifyToken, getAssignmentById);
router.post('/', verifyToken, requireAdmin, upload.single('attachment'), createAssignment);
router.put('/:id', verifyToken, requireAdmin, upload.single('attachment'), updateAssignment);
router.delete('/:id', verifyToken, requireAdmin, deleteAssignment);

export default router;
