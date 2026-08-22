import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { Group } from '../models/Group.js';
import { Message } from '../models/Message.js';
import { GroupMessage } from '../models/GroupMessage.js';

export const setupSocketServer = (io) => {
  // Socket auth middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return next(new Error('Authentication error: User not active'));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 Socket connected: ${user.name} (${user.role}) [ID: ${user._id}]`);

    // If student, join their private student notification room
    if (user.role === 'student') {
      const studentRoom = `student_${user._id}`;
      socket.join(studentRoom);
    } else if (user.role === 'admin') {
      // Admin joins admin channel
      socket.join('admin_room');
    }

    // ==========================================
    // 1-ON-1 DIRECT CHAT EVENTS
    // ==========================================

    // Join a specific student chat thread
    socket.on('join_chat', ({ studentId }) => {
      if (user.role === 'admin' || (user.role === 'student' && user._id.toString() === studentId)) {
        const chatRoom = `chat_${studentId}`;
        socket.join(chatRoom);
      }
    });

    // Leave a specific student chat thread
    socket.on('leave_chat', ({ studentId }) => {
      const chatRoom = `chat_${studentId}`;
      socket.leave(chatRoom);
    });

    // Real-time direct message relay
    socket.on('send_message', async (data) => {
      try {
        const { studentId, content, attachment } = data;

        // Security check
        if (user.role === 'student' && user._id.toString() !== studentId) {
          return socket.emit('error_message', { message: 'Unauthorized chat action.' });
        }

        const message = await Message.create({
          studentId,
          senderId: user._id,
          senderRole: user.role,
          content: content || 'Sent an attachment',
          attachment: attachment || {}
        });

        const populated = await Message.findById(message._id)
          .populate('senderId', 'name profilePicture role rollNumber');

        // Broadcast to chat room
        const chatRoom = `chat_${studentId}`;
        io.to(chatRoom).emit('receive_message', populated);

        // Also notify admin room if sender was student
        if (user.role === 'student') {
          io.to('admin_room').emit('new_student_message', {
            studentId,
            studentName: user.name,
            message: populated
          });
        } else {
          // Notify the student
          io.to(`student_${studentId}`).emit('new_admin_message', {
            message: populated
          });
        }
      } catch (err) {
        socket.emit('error_message', { message: err.message });
      }
    });

    // Direct chat typing indicators
    socket.on('typing_start', ({ studentId }) => {
      const chatRoom = `chat_${studentId}`;
      socket.to(chatRoom).emit('user_typing', {
        studentId,
        userId: user._id,
        userName: user.name,
        role: user.role
      });
    });

    socket.on('typing_stop', ({ studentId }) => {
      const chatRoom = `chat_${studentId}`;
      socket.to(chatRoom).emit('user_stopped_typing', {
        studentId,
        userId: user._id
      });
    });

    // ==========================================
    // GROUP CHAT EVENTS
    // ==========================================

    // Join a group chat room
    socket.on('join_group_chat', async ({ groupId }) => {
      try {
        if (!groupId) return;
        const group = await Group.findById(groupId);
        if (!group) return;

        // Permission check
        if (user.role === 'student') {
          const isMember = group.members.some(
            (m) => m.toString() === user._id.toString()
          );
          if (!isMember) {
            return socket.emit('error_message', { message: 'Not enrolled in this group.' });
          }
        }

        const groupRoom = `group_${groupId}`;
        socket.join(groupRoom);
      } catch (err) {
        console.error('Error joining group chat:', err);
      }
    });

    // Leave a group chat room
    socket.on('leave_group_chat', ({ groupId }) => {
      if (groupId) {
        const groupRoom = `group_${groupId}`;
        socket.leave(groupRoom);
      }
    });

    // Send group message
    socket.on('send_group_message', async (data) => {
      try {
        const { groupId, content, attachment } = data;
        if (!groupId) return;

        const group = await Group.findById(groupId);
        if (!group) {
          return socket.emit('error_message', { message: 'Group not found.' });
        }

        // Only Admin can send messages in group chat channels
        if (user.role === 'student') {
          return socket.emit('error_message', {
            message: 'Group channels are in broadcast mode. Only the instructor can post messages in group chats.'
          });
        }

        if (!content && (!attachment || !attachment.url)) {
          return socket.emit('error_message', { message: 'Message content is required.' });
        }

        const validAttachment = user.role === 'admin' ? (attachment || {}) : {};

        const groupMessage = await GroupMessage.create({
          groupId,
          senderId: user._id,
          senderRole: user.role,
          content: content ? content.trim() : 'Sent an attachment',
          attachment: validAttachment
        });

        const populated = await GroupMessage.findById(groupMessage._id)
          .populate('senderId', 'name profilePicture role rollNumber');

        // Broadcast to group room (all active viewers in the group)
        const groupRoom = `group_${groupId}`;
        io.to(groupRoom).emit('receive_group_message', {
          groupId,
          message: populated
        });

        // Also broadcast notification to all members
        group.members.forEach((memberId) => {
          io.to(`student_${memberId}`).emit('group_message_notify', {
            groupId,
            groupName: group.groupName,
            message: populated
          });
        });
        io.to('admin_room').emit('group_message_notify', {
          groupId,
          groupName: group.groupName,
          message: populated
        });
      } catch (err) {
        socket.emit('error_message', { message: err.message });
      }
    });

    // Group typing indicators
    socket.on('group_typing_start', ({ groupId }) => {
      const groupRoom = `group_${groupId}`;
      socket.to(groupRoom).emit('user_group_typing', {
        groupId,
        userId: user._id,
        userName: user.name,
        role: user.role
      });
    });

    socket.on('group_typing_stop', ({ groupId }) => {
      const groupRoom = `group_${groupId}`;
      socket.to(groupRoom).emit('user_group_stopped_typing', {
        groupId,
        userId: user._id
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${user.name}`);
    });
  });
};
