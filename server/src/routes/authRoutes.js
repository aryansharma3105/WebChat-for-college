import express from 'express';
import {
  adminLogin,
  googleAuth,
  demoStudentLogin,
  getMe,
  updateProfile,
  changeAdminPassword
} from '../controllers/authController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/admin-login', adminLogin);
router.post('/google', googleAuth);
router.post('/demo-student-login', demoStudentLogin);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, upload.single('profilePicture'), updateProfile);
router.put('/change-password', verifyToken, requireAdmin, changeAdminPassword);

export default router;
