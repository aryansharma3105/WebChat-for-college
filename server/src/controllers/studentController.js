import { User } from '../models/User.js';
import { Group } from '../models/Group.js';
import { Submission } from '../models/Submission.js';
import { Mark } from '../models/Mark.js';
import { Query } from '../models/Query.js';

/**
 * @route   GET /api/students
 * @desc    Get all students with search, group filter, and pagination
 * @access  Private (Admin Only)
 */
export const getAllStudents = async (req, res) => {
  try {
    const { search, groupId, page = 1, limit = 20 } = req.query;

    const query = { role: 'student' };

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { rollNumber: searchRegex }
      ];
    }

    if (groupId) {
      query.enrolledGroups = groupId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);

    const students = await User.find(query)
      .populate('enrolledGroups', 'groupName description color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: students,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/students/:id
 * @desc    Get student details with enrolled groups and summary
 * @access  Private (Admin or Self)
 */
export const getStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Security check: If caller is student, must be their own ID
    if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to other student profiles.'
      });
    }

    const student = await User.findById(studentId)
      .populate('enrolledGroups', 'groupName description color createdAt');

    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Get submission count and marks count
    const [submissionCount, marks, openQueriesCount] = await Promise.all([
      Submission.countDocuments({ studentId: student._id }),
      Mark.find({ studentId: student._id }),
      Query.countDocuments({ studentId: student._id, status: { $ne: 'resolved' } })
    ]);

    const totalMarksObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalMaxMarks = marks.reduce((sum, m) => sum + m.totalMarks, 0);
    const overallPercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;

    res.json({
      success: true,
      data: {
        ...student.toObject(),
        stats: {
          submissionCount,
          totalAssessments: marks.length,
          overallPercentage,
          openQueriesCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/students/:id
 * @desc    Remove student and clean up relations
 * @access  Private (Admin Only)
 */
export const removeStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Remove student from all groups
    await Group.updateMany(
      { members: studentId },
      { $pull: { members: studentId } }
    );

    // Delete student
    await User.findByIdAndDelete(studentId);

    res.json({
      success: true,
      message: `Student ${student.name} removed successfully.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
