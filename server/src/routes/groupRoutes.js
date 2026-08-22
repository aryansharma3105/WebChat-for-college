import express from 'express';
import {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addStudentsToGroup,
  removeStudentFromGroup
} from '../controllers/groupController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getAllGroups);
router.get('/:id', verifyToken, getGroupById);
router.post('/', verifyToken, requireAdmin, createGroup);
router.put('/:id', verifyToken, requireAdmin, updateGroup);
router.delete('/:id', verifyToken, requireAdmin, deleteGroup);
router.post('/:id/members', verifyToken, requireAdmin, addStudentsToGroup);
router.delete('/:id/members/:studentId', verifyToken, requireAdmin, removeStudentFromGroup);

export default router;
