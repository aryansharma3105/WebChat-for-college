import express from 'express';
import {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote
} from '../controllers/noteController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', verifyToken, getAllNotes);
router.post('/', verifyToken, requireAdmin, upload.single('noteFile'), createNote);
router.put('/:id', verifyToken, requireAdmin, upload.single('noteFile'), updateNote);
router.delete('/:id', verifyToken, requireAdmin, deleteNote);

export default router;
