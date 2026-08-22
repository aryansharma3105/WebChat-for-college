import { Assignment } from '../models/Assignment.js';
import { Submission } from '../models/Submission.js';
import { User } from '../models/User.js';
import { Group } from '../models/Group.js';

/**
 * @route   GET /api/assignments
 * @desc    Get assignments (Admin: all; Student: assigned to their groups/all)
 * @access  Private
 */
export const getAllAssignments = async (req, res) => {
  try {
    const { groupId, subject, search } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      const student = await User.findById(req.user._id);
      const studentGroups = student.enrolledGroups || [];
      
      // Match assignments assigned to student's groups OR assigned to all (null)
      query.$or = [
        { assignedGroup: null },
        { assignedGroup: { $in: studentGroups } }
      ];
    } else if (groupId) {
      query.assignedGroup = groupId;
    }

    if (subject) {
      query.subject = new RegExp(subject.trim(), 'i');
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { subject: searchRegex }
        ]
      });
    }

    const assignments = await Assignment.find(query)
      .populate('assignedGroup', 'groupName color')
      .populate('createdBy', 'name')
      .sort({ dueDate: 1 });

    // If student, attach their individual submission status
    if (req.user.role === 'student') {
      const studentSubmissions = await Submission.find({ studentId: req.user._id });
      const submissionMap = new Map();
      studentSubmissions.forEach((sub) => {
        submissionMap.set(sub.assignmentId.toString(), sub);
      });

      const formatted = assignments.map((a) => {
        const sub = submissionMap.get(a._id.toString());
        const isPastDue = new Date() > new Date(a.dueDate);
        let userStatus = 'pending';
        if (sub) {
          userStatus = sub.status;
        } else if (isPastDue) {
          userStatus = 'overdue';
        }

        return {
          ...a.toObject(),
          mySubmission: sub || null,
          userStatus
        };
      });

      return res.json({ success: true, data: formatted });
    }

    // If admin, attach summary submission counts
    const formatted = await Promise.all(
      assignments.map(async (a) => {
        // Target student count
        let totalEligibleStudents = 0;
        if (a.assignedGroup) {
          const group = await Group.findById(a.assignedGroup);
          totalEligibleStudents = group ? group.members.length : 0;
        } else {
          totalEligibleStudents = await User.countDocuments({ role: 'student' });
        }

        const [submittedCount, lateCount] = await Promise.all([
          Submission.countDocuments({ assignmentId: a._id, status: 'submitted' }),
          Submission.countDocuments({ assignmentId: a._id, status: 'late' })
        ]);

        const totalSubmitted = submittedCount + lateCount;
        const pendingCount = Math.max(0, totalEligibleStudents - totalSubmitted);

        return {
          ...a.toObject(),
          stats: {
            totalEligible: totalEligibleStudents,
            submitted: submittedCount,
            late: lateCount,
            totalSubmitted,
            pending: pendingCount
          }
        };
      })
    );

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/assignments/:id
 * @desc    Get assignment details
 * @access  Private
 */
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('assignedGroup', 'groupName color members')
      .populate('createdBy', 'name');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    // If student, check if eligible and get student's submission
    if (req.user.role === 'student') {
      if (
        assignment.assignedGroup &&
        !assignment.assignedGroup.members.some((m) => m.toString() === req.user._id.toString())
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not assigned to this assignment.'
        });
      }

      const mySubmission = await Submission.findOne({
        assignmentId: assignment._id,
        studentId: req.user._id
      });

      return res.json({
        success: true,
        data: {
          ...assignment.toObject(),
          mySubmission
        }
      });
    }

    // If admin, fetch all submissions for this assignment
    const submissions = await Submission.find({ assignmentId: assignment._id })
      .populate('studentId', 'name email profilePicture rollNumber')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: {
        ...assignment.toObject(),
        submissions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/assignments
 * @desc    Create new assignment
 * @access  Private (Admin Only)
 */
export const createAssignment = async (req, res) => {
  try {
    const { title, description, subject, assignedGroup, dueDate, totalMarks } = req.body;

    if (!title || !subject || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Title, Subject, and Due Date.'
      });
    }

    let attachment = { filename: '', url: '', fileType: '' };
    if (req.file) {
      attachment = {
        filename: req.file.originalname,
        url: `/uploads/assignments/${req.file.filename}`,
        fileType: req.file.mimetype
      };
    } else if (req.body.attachmentUrl) {
      attachment = {
        filename: req.body.attachmentName || 'Attachment',
        url: req.body.attachmentUrl,
        fileType: 'link'
      };
    }

    const assignment = await Assignment.create({
      title: title.trim(),
      description: description || '',
      subject: subject.trim(),
      assignedGroup: assignedGroup && assignedGroup !== 'all' ? assignedGroup : null,
      dueDate: new Date(dueDate),
      totalMarks: totalMarks ? Number(totalMarks) : 100,
      attachment,
      createdBy: req.user._id
    });

    const populated = await Assignment.findById(assignment._id)
      .populate('assignedGroup', 'groupName color')
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/assignments/:id
 * @desc    Update assignment
 * @access  Private (Admin Only)
 */
export const updateAssignment = async (req, res) => {
  try {
    const { title, description, subject, assignedGroup, dueDate, totalMarks } = req.body;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (title) assignment.title = title.trim();
    if (description !== undefined) assignment.description = description;
    if (subject) assignment.subject = subject.trim();
    if (assignedGroup !== undefined) {
      assignment.assignedGroup = assignedGroup && assignedGroup !== 'all' ? assignedGroup : null;
    }
    if (dueDate) assignment.dueDate = new Date(dueDate);
    if (totalMarks) assignment.totalMarks = Number(totalMarks);

    if (req.file) {
      assignment.attachment = {
        filename: req.file.originalname,
        url: `/uploads/assignments/${req.file.filename}`,
        fileType: req.file.mimetype
      };
    }

    await assignment.save();

    const populated = await Assignment.findById(assignment._id)
      .populate('assignedGroup', 'groupName color')
      .populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/assignments/:id
 * @desc    Delete assignment and its submissions
 * @access  Private (Admin Only)
 */
export const deleteAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    await Submission.deleteMany({ assignmentId });
    await Assignment.findByIdAndDelete(assignmentId);

    res.json({
      success: true,
      message: 'Assignment and related submissions deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
