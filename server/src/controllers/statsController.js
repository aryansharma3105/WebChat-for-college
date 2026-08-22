import { User } from '../models/User.js';
import { Group } from '../models/Group.js';
import { Assignment } from '../models/Assignment.js';
import { Submission } from '../models/Submission.js';
import { Mark } from '../models/Mark.js';
import { Note } from '../models/Note.js';
import { Query } from '../models/Query.js';
import { Message } from '../models/Message.js';

/**
 * @route   GET /api/stats/admin
 * @desc    Get comprehensive stats for Admin Dashboard
 * @access  Private (Admin Only)
 */
export const getAdminStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalGroups,
      totalAssignments,
      totalNotes,
      totalSubmissions,
      totalLateSubmissions,
      openQueries,
      inProgressQueries,
      unreadMessages,
      recentSubmissions,
      recentQueries,
      marks
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Group.countDocuments(),
      Assignment.countDocuments(),
      Note.countDocuments(),
      Submission.countDocuments({ status: 'submitted' }),
      Submission.countDocuments({ status: 'late' }),
      Query.countDocuments({ status: 'open' }),
      Query.countDocuments({ status: 'in_progress' }),
      Message.countDocuments({ senderRole: 'student', isRead: false }),
      Submission.find()
        .populate('studentId', 'name email profilePicture')
        .populate('assignmentId', 'title subject')
        .sort({ submittedAt: -1 })
        .limit(6),
      Query.find({ status: { $ne: 'resolved' } })
        .populate('studentId', 'name email profilePicture')
        .sort({ updatedAt: -1 })
        .limit(6),
      Mark.find()
    ]);

    const totalMarksObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalMaxMarks = marks.reduce((sum, m) => sum + m.totalMarks, 0);
    const averageClassPercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        totalGroups,
        totalAssignments,
        totalNotes,
        totalSubmissions,
        totalLateSubmissions,
        totalSubmittedAll: totalSubmissions + totalLateSubmissions,
        openQueries,
        inProgressQueries,
        unreadMessages,
        averageClassPercentage,
        recentSubmissions,
        recentQueries
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/stats/student
 * @desc    Get personalized stats for Student Dashboard
 * @access  Private (Student Only)
 */
export const getStudentStats = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const studentGroups = student.enrolledGroups || [];

    // Eligible assignments
    const assignments = await Assignment.find({
      $or: [{ assignedGroup: null }, { assignedGroup: { $in: studentGroups } }]
    }).populate('assignedGroup', 'groupName color');

    const assignmentIds = assignments.map((a) => a._id);

    const [
      mySubmissions,
      myMarks,
      myNotes,
      myQueries,
      unreadMessages
    ] = await Promise.all([
      Submission.find({ studentId: req.user._id, assignmentId: { $in: assignmentIds } }),
      Mark.find({ studentId: req.user._id }).sort({ createdAt: -1 }),
      Note.find({ groupId: { $in: studentGroups } }).populate('groupId', 'groupName').sort({ createdAt: -1 }).limit(5),
      Query.find({ studentId: req.user._id }).sort({ updatedAt: -1 }).limit(5),
      Message.countDocuments({ studentId: req.user._id, senderRole: 'admin', isRead: false })
    ]);

    const submittedCount = mySubmissions.length;
    const pendingCount = Math.max(0, assignments.length - submittedCount);

    const totalMarksObtained = myMarks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalMaxMarks = myMarks.reduce((sum, m) => sum + m.totalMarks, 0);
    const averagePercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;

    // Upcoming assignments (not yet submitted, due in future)
    const submittedAssignmentIds = new Set(mySubmissions.map((s) => s.assignmentId.toString()));
    const upcomingAssignments = assignments
      .filter((a) => !submittedAssignmentIds.has(a._id.toString()))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        enrolledGroupsCount: studentGroups.length,
        totalAssignments: assignments.length,
        submittedAssignments: submittedCount,
        pendingAssignments: pendingCount,
        averagePercentage,
        unreadMessages,
        activeQueriesCount: myQueries.filter((q) => q.status !== 'resolved').length,
        upcomingAssignments,
        recentMarks: myMarks.slice(0, 5),
        recentNotes: myNotes,
        recentQueries: myQueries
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/stats/admin/reset-data
 * @desc    Clear all temporary student data (submissions, queries, marks, chats)
 * @access  Private (Admin Only)
 */
export const resetSystemData = async (req, res) => {
  try {
    const [subRes, qRes, markRes, msgRes, gMsgRes] = await Promise.all([
      Submission.deleteMany({}),
      Query.deleteMany({}),
      Mark.deleteMany({}),
      Message.deleteMany({}),
      (await import('../models/GroupMessage.js')).GroupMessage.deleteMany({})
    ]);

    res.json({
      success: true,
      message: 'All submissions, queries, marks, and chat history have been cleared successfully.',
      details: {
        submissionsCleared: subRes.deletedCount,
        queriesCleared: qRes.deletedCount,
        marksCleared: markRes.deletedCount,
        messagesCleared: msgRes.deletedCount + gMsgRes.deletedCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
