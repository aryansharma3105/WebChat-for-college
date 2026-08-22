import { Submission } from '../models/Submission.js';
import { Assignment } from '../models/Assignment.js';
import { User } from '../models/User.js';
import { Group } from '../models/Group.js';
import { Mark } from '../models/Mark.js';

/**
 * @route   GET /api/submissions
 * @desc    Get all submissions with comprehensive filtering (Admin)
 * @access  Private (Admin Only)
 */
export const getAllSubmissions = async (req, res) => {
  try {
    const { assignmentId, groupId, studentId, status, search } = req.query;

    let assignmentFilter = {};
    if (assignmentId) {
      assignmentFilter._id = assignmentId;
    }
    if (groupId) {
      assignmentFilter.assignedGroup = groupId;
    }

    const assignments = await Assignment.find(assignmentFilter)
      .populate('assignedGroup', 'groupName members')
      .sort({ dueDate: -1 });

    const assignmentIds = assignments.map((a) => a._id);

    let submissionQuery = { assignmentId: { $in: assignmentIds } };
    if (studentId) {
      submissionQuery.studentId = studentId;
    }
    if (status && status !== 'pending') {
      submissionQuery.status = status;
    }

    let submissions = await Submission.find(submissionQuery)
      .populate('studentId', 'name email profilePicture rollNumber enrolledGroups')
      .populate('assignmentId', 'title subject dueDate totalMarks assignedGroup')
      .sort({ submittedAt: -1 });

    // If filtering by search (student name or email)
    if (search) {
      const searchLower = search.toLowerCase();
      submissions = submissions.filter((sub) =>
        sub.studentId?.name?.toLowerCase().includes(searchLower) ||
        sub.studentId?.email?.toLowerCase().includes(searchLower) ||
        sub.studentId?.rollNumber?.toLowerCase().includes(searchLower)
      );
    }

    // If status filter is 'pending', we need to compute non-submitted records
    let pendingRecords = [];
    if (!status || status === 'pending' || status === 'all') {
      for (const assignment of assignments) {
        // Determine target students
        let targetStudents = [];
        if (assignment.assignedGroup) {
          const group = await Group.findById(assignment.assignedGroup).populate('members', 'name email profilePicture rollNumber');
          targetStudents = group?.members || [];
        } else {
          targetStudents = await User.find({ role: 'student' });
        }

        const submittedStudentIds = new Set(
          submissions
            .filter((s) => s.assignmentId?._id?.toString() === assignment._id.toString())
            .map((s) => s.studentId?._id?.toString())
        );

        for (const student of targetStudents) {
          if (!submittedStudentIds.has(student._id.toString())) {
            // Apply search filter if present
            if (search) {
              const searchLower = search.toLowerCase();
              const match =
                student.name.toLowerCase().includes(searchLower) ||
                student.email.toLowerCase().includes(searchLower) ||
                (student.rollNumber && student.rollNumber.toLowerCase().includes(searchLower));
              if (!match) continue;
            }

            if (studentId && student._id.toString() !== studentId) {
              continue;
            }

            pendingRecords.push({
              _id: `pending-${assignment._id}-${student._id}`,
              assignmentId: {
                _id: assignment._id,
                title: assignment.title,
                subject: assignment.subject,
                dueDate: assignment.dueDate,
                totalMarks: assignment.totalMarks
              },
              studentId: {
                _id: student._id,
                name: student.name,
                email: student.email,
                profilePicture: student.profilePicture,
                rollNumber: student.rollNumber
              },
              status: 'pending',
              submittedAt: null,
              fileUrl: null,
              submissionLink: null
            });
          }
        }
      }
    }

    let allRecords = [];
    if (status === 'pending') {
      allRecords = pendingRecords;
    } else if (status === 'submitted' || status === 'late') {
      allRecords = submissions;
    } else {
      allRecords = [...submissions, ...pendingRecords];
    }

    res.json({
      success: true,
      data: allRecords,
      stats: {
        total: allRecords.length,
        submitted: submissions.filter((s) => s.status === 'submitted').length,
        late: submissions.filter((s) => s.status === 'late').length,
        pending: pendingRecords.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/submissions/my
 * @desc    Get logged in student's submissions
 * @access  Private (Student Only)
 */
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user._id })
      .populate('assignmentId', 'title subject dueDate totalMarks attachment assignedGroup')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/submissions/:assignmentId
 * @desc    Submit an assignment (File upload or submission link)
 * @access  Private (Student Only)
 */
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { submissionLink, comments } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    let fileUrl = '';
    let fileName = '';

    if (req.file) {
      fileUrl = `/uploads/submissions/${req.file.filename}`;
      fileName = req.file.originalname;
    } else if (submissionLink) {
      fileUrl = submissionLink.trim();
      fileName = 'External Submission Link';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file or provide a valid submission link.'
      });
    }

    // Determine if submission is on time or late
    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);
    const status = isLate ? 'late' : 'submitted';

    // Find existing submission or create new
    let submission = await Submission.findOne({
      assignmentId,
      studentId: req.user._id
    });

    if (submission) {
      submission.fileUrl = fileUrl;
      submission.fileName = fileName;
      submission.submissionLink = submissionLink || '';
      submission.comments = comments || '';
      submission.submittedAt = now;
      submission.status = status;
      await submission.save();
    } else {
      submission = await Submission.create({
        assignmentId,
        studentId: req.user._id,
        fileUrl,
        fileName,
        submissionLink: submissionLink || '',
        comments: comments || '',
        submittedAt: now,
        status
      });
    }

    const populated = await Submission.findById(submission._id)
      .populate('assignmentId', 'title subject dueDate totalMarks')
      .populate('studentId', 'name email profilePicture');

    res.status(200).json({
      success: true,
      message: isLate ? 'Assignment submitted (Late)' : 'Assignment submitted successfully!',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/submissions/:id/grade
 * @desc    Grade a student submission and optionally update Marks
 * @access  Private (Admin Only)
 */
export const gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks, feedback } = req.body;

    if (marks === undefined || marks === null) {
      return res.status(400).json({ success: false, message: 'Marks are required.' });
    }

    const submission = await Submission.findById(id).populate('assignmentId');
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    submission.grade = {
      marks: Number(marks),
      feedback: feedback || '',
      gradedAt: new Date(),
      gradedBy: req.user._id
    };

    await submission.save();

    // Upsert to Marks collection
    await Mark.findOneAndUpdate(
      {
        studentId: submission.studentId,
        subject: submission.assignmentId.subject,
        assessmentName: submission.assignmentId.title
      },
      {
        studentId: submission.studentId,
        subject: submission.assignmentId.subject,
        assessmentName: submission.assignmentId.title,
        marksObtained: Number(marks),
        totalMarks: submission.assignmentId.totalMarks || 100,
        remarks: feedback || '',
        enteredBy: req.user._id
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Submission graded and marks recorded successfully.',
      data: submission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/submissions/:id
 * @desc    Delete a single submission (Admin Only)
 * @access  Private (Admin Only)
 */
export const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    await Submission.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Submission deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/submissions/clear/all
 * @desc    Clear all student submissions (Admin Only)
 * @access  Private (Admin Only)
 */
export const clearAllSubmissions = async (req, res) => {
  try {
    const result = await Submission.deleteMany({});
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} submissions successfully.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
