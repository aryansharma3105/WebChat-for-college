import express from 'express';
import {
  getAdminConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  getGroupConversations,
  getGroupMessages,
  sendGroupMessage
} from '../controllers/chatController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Direct 1-on-1 Chat Routes
router.get('/conversations', verifyToken, requireAdmin, getAdminConversations);
router.get('/unread-count', verifyToken, getUnreadCount);
router.get('/messages/:studentId', verifyToken, getMessages);
router.post('/messages/:studentId', verifyToken, upload.single('attachment'), sendMessage);

// Group Chat Routes
router.get('/groups', verifyToken, getGroupConversations);
router.get('/groups/:groupId/messages', verifyToken, getGroupMessages);
router.post('/groups/:groupId/messages', verifyToken, upload.single('attachment'), sendGroupMessage);

export default router;
