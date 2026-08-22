import { Message } from '../models/Message.js';
import { GroupMessage } from '../models/GroupMessage.js';
import { User } from '../models/User.js';
import { Group } from '../models/Group.js';

/**
 * @route   GET /api/chat/conversations
 * @desc    Get active student conversation list for Admin
 * @access  Private (Admin Only)
 */
export const getAdminConversations = async (req, res) => {
  try {
    const { search } = req.query;

    const students = await User.find({ role: 'student' })
      .populate('enrolledGroups', 'groupName color')
      .sort({ name: 1 });

    const conversations = await Promise.all(
      students.map(async (student) => {
        const lastMessage = await Message.findOne({ studentId: student._id }).sort({ createdAt: -1 });
        const unreadCount = await Message.countDocuments({
          studentId: student._id,
          senderRole: 'student',
          isRead: false
        });

        return {
          student: {
            id: student._id,
            name: student.name,
            email: student.email,
            profilePicture: student.profilePicture,
            rollNumber: student.rollNumber,
            enrolledGroups: student.enrolledGroups
          },
          lastMessage,
          unreadCount
        };
      })
    );

    // Sort by recent message activity
    let sorted = conversations.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    if (search) {
      const s = search.toLowerCase();
      sorted = sorted.filter(
        (c) =>
          c.student.name.toLowerCase().includes(s) ||
          c.student.email.toLowerCase().includes(s) ||
          (c.student.rollNumber && c.student.rollNumber.toLowerCase().includes(s))
      );
    }

    res.json({
      success: true,
      data: sorted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/chat/messages/:studentId
 * @desc    Get conversation history with a specific student
 * @access  Private (Admin or the specific Student)
 */
export const getMessages = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Security: Student can ONLY fetch their own chat
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot view messages for another student.'
      });
    }

    const messages = await Message.find({ studentId })
      .populate('senderId', 'name profilePicture role rollNumber')
      .sort({ createdAt: 1 });

    // Mark messages sent to current viewer as read
    const opposingRole = req.user.role === 'admin' ? 'student' : 'admin';
    await Message.updateMany(
      { studentId, senderRole: opposingRole, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/chat/messages/:studentId
 * @desc    Send a direct message
 * @access  Private (Admin or the specific Student)
 */
export const sendMessage = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { content, attachmentUrl, attachmentName } = req.body;

    if (!content && !attachmentUrl && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Message content or attachment is required.'
      });
    }

    // Security: Student can only message from their own account to admin
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Cannot send message on behalf of another user.'
      });
    }

    let attachment = { url: '', name: '', fileType: '' };
    if (req.file) {
      attachment = {
        url: `/uploads/attachments/${req.file.filename}`,
        name: req.file.originalname,
        fileType: req.file.mimetype
      };
    } else if (attachmentUrl) {
      attachment = {
        url: attachmentUrl,
        name: attachmentName || 'Attachment',
        fileType: 'link'
      };
    }

    const message = await Message.create({
      studentId,
      senderId: req.user._id,
      senderRole: req.user.role,
      content: content ? content.trim() : 'Sent an attachment',
      attachment
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'name profilePicture role rollNumber');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/chat/unread-count
 * @desc    Get total unread messages count for logged-in user
 * @access  Private
 */
export const getUnreadCount = async (req, res) => {
  try {
    let unreadCount = 0;
    if (req.user.role === 'admin') {
      unreadCount = await Message.countDocuments({
        senderRole: 'student',
        isRead: false
      });
    } else {
      unreadCount = await Message.countDocuments({
        studentId: req.user._id,
        senderRole: 'admin',
        isRead: false
      });
    }

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// GROUP CHAT CONTROLLER METHODS
// ==========================================

/**
 * @route   GET /api/chat/groups
 * @desc    Get group chat list (Admin gets all, Student gets enrolled groups)
 * @access  Private
 */
export const getGroupConversations = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'student') {
      filter = { members: req.user._id };
    }

    const groups = await Group.find(filter)
      .populate('members', 'name email profilePicture rollNumber')
      .populate('createdBy', 'name')
      .sort({ updatedAt: -1 });

    const groupChats = await Promise.all(
      groups.map(async (group) => {
        const lastMessage = await GroupMessage.findOne({ groupId: group._id })
          .populate('senderId', 'name profilePicture role')
          .sort({ createdAt: -1 });

        return {
          id: group._id,
          groupName: group.groupName,
          description: group.description,
          color: group.color,
          memberCount: group.members.length,
          members: group.members,
          createdBy: group.createdBy,
          lastMessage
        };
      })
    );

    res.json({
      success: true,
      data: groupChats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/chat/groups/:groupId/messages
 * @desc    Get message history for a specific group
 * @access  Private (Admin or enrolled Student)
 */
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    // Check membership if student
    if (req.user.role === 'student') {
      const isMember = group.members.some(
        (m) => m.toString() === req.user._id.toString()
      );
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not enrolled in this group.'
        });
      }
    }

    const messages = await GroupMessage.find({ groupId })
      .populate('senderId', 'name profilePicture role rollNumber')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/chat/groups/:groupId/messages
 * @desc    Send a message to a group chat (Only Admin can attach files)
 * @access  Private (Admin or enrolled Student)
 */
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content, attachmentUrl, attachmentName } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    // Check role: Only Admin can send messages to groups
    if (req.user.role === 'student') {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Group channels are in broadcast mode. Only the instructor can post messages in group chats. You can use 1-on-1 chat for direct queries.'
      });
    }

    if (!content && !attachmentUrl && !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.'
      });
    }

    let attachment = { url: '', name: '', fileType: '' };
    // Only process attachment if Admin
    if (req.user.role === 'admin') {
      if (req.file) {
        attachment = {
          url: `/uploads/attachments/${req.file.filename}`,
          name: req.file.originalname,
          fileType: req.file.mimetype
        };
      } else if (attachmentUrl) {
        attachment = {
          url: attachmentUrl,
          name: attachmentName || 'Attachment',
          fileType: 'link'
        };
      }
    }

    const message = await GroupMessage.create({
      groupId,
      senderId: req.user._id,
      senderRole: req.user.role,
      content: content ? content.trim() : 'Sent an attachment',
      attachment
    });

    const populated = await GroupMessage.findById(message._id)
      .populate('senderId', 'name profilePicture role rollNumber');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
