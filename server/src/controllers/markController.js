import { Mark } from '../models/Mark.js';
import { User } from '../models/User.js';

/**
 * @route   GET /api/marks
 * @desc    Get marks (Admin: all students with filters; Student: ONLY their own marks)
 * @access  Private
 */
export const getAllMarks = async (req, res) => {
  try {
    const { studentId, subject, search } = req.query;

    let query = {};

    // Security: Students can NEVER view anyone else's marks
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else {
      if (studentId) query.studentId = studentId;
    }

    if (subject) {
      query.subject = new RegExp(subject.trim(), 'i');
    }

    let marks = await Mark.find(query)
      .populate('studentId', 'name email profilePicture rollNumber department')
      .populate('enteredBy', 'name')
      .sort({ createdAt: -1 });

    if (search && req.user.role === 'admin') {
      const searchLower = search.toLowerCase();
      marks = marks.filter((m) =>
        m.studentId?.name?.toLowerCase().includes(searchLower) ||
        m.studentId?.email?.toLowerCase().includes(searchLower) ||
        m.subject?.toLowerCase().includes(searchLower) ||
        m.assessmentName?.toLowerCase().includes(searchLower)
      );
    }

    // Compute summary stats
    const totalMarksObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalMaxMarks = marks.reduce((sum, m) => sum + m.totalMarks, 0);
    const averagePercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;

    res.json({
      success: true,
      data: marks,
      stats: {
        totalAssessments: marks.length,
        totalMarksObtained,
        totalMaxMarks,
        averagePercentage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/marks/my
 * @desc    Get logged-in student's marks
 * @access  Private (Student Only)
 */
export const getMyMarks = async (req, res) => {
  try {
    const marks = await Mark.find({ studentId: req.user._id })
      .populate('enteredBy', 'name')
      .sort({ createdAt: -1 });

    const totalMarksObtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
    const totalMaxMarks = marks.reduce((sum, m) => sum + m.totalMarks, 0);
    const averagePercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;

    // Group by subject
    const subjectBreakdown = {};
    marks.forEach((m) => {
      if (!subjectBreakdown[m.subject]) {
        subjectBreakdown[m.subject] = { obtained: 0, total: 0, count: 0 };
      }
      subjectBreakdown[m.subject].obtained += m.marksObtained;
      subjectBreakdown[m.subject].total += m.totalMarks;
      subjectBreakdown[m.subject].count += 1;
    });

    res.json({
      success: true,
      data: marks,
      stats: {
        totalAssessments: marks.length,
        totalMarksObtained,
        totalMaxMarks,
        averagePercentage,
        subjectBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/marks
 * @desc    Create / record marks for a student
 * @access  Private (Admin Only)
 */
export const createMark = async (req, res) => {
  try {
    const { studentId, subject, assessmentName, marksObtained, totalMarks, remarks } = req.body;

    if (!studentId || !subject || !assessmentName || marksObtained === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Student, Subject, Assessment Name, and Marks.'
      });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const mark = await Mark.create({
      studentId,
      subject: subject.trim(),
      assessmentName: assessmentName.trim(),
      marksObtained: Number(marksObtained),
      totalMarks: totalMarks ? Number(totalMarks) : 100,
      remarks: remarks || '',
      enteredBy: req.user._id
    });

    const populated = await Mark.findById(mark._id)
      .populate('studentId', 'name email profilePicture rollNumber')
      .populate('enteredBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Marks recorded successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/marks/:id
 * @desc    Update marks
 * @access  Private (Admin Only)
 */
export const updateMark = async (req, res) => {
  try {
    const { subject, assessmentName, marksObtained, totalMarks, remarks } = req.body;

    const mark = await Mark.findById(req.params.id);
    if (!mark) {
      return res.status(404).json({ success: false, message: 'Mark record not found.' });
    }

    if (subject) mark.subject = subject.trim();
    if (assessmentName) mark.assessmentName = assessmentName.trim();
    if (marksObtained !== undefined) mark.marksObtained = Number(marksObtained);
    if (totalMarks !== undefined) mark.totalMarks = Number(totalMarks);
    if (remarks !== undefined) mark.remarks = remarks.trim();

    await mark.save();

    const populated = await Mark.findById(mark._id)
      .populate('studentId', 'name email profilePicture rollNumber')
      .populate('enteredBy', 'name');

    res.json({
      success: true,
      message: 'Marks updated successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/marks/:id
 * @desc    Delete mark record
 * @access  Private (Admin Only)
 */
export const deleteMark = async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id);
    if (!mark) {
      return res.status(404).json({ success: false, message: 'Mark record not found.' });
    }

    await Mark.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Mark record deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
