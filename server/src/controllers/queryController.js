import { Query } from '../models/Query.js';
import { User } from '../models/User.js';

/**
 * @route   GET /api/queries
 * @desc    Get queries (Admin: all; Student: only their own)
 * @access  Private
 */
export const getAllQueries = async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    let queryFilter = {};

    if (req.user.role === 'student') {
      queryFilter.studentId = req.user._id;
    }

    if (status) {
      queryFilter.status = status;
    }

    if (priority) {
      queryFilter.priority = priority;
    }

    let queries = await Query.find(queryFilter)
      .populate('studentId', 'name email profilePicture rollNumber')
      .populate('responses.senderId', 'name role')
      .sort({ updatedAt: -1 });

    if (search && req.user.role === 'admin') {
      const searchLower = search.toLowerCase();
      queries = queries.filter((q) =>
        q.subject?.toLowerCase().includes(searchLower) ||
        q.message?.toLowerCase().includes(searchLower) ||
        q.studentId?.name?.toLowerCase().includes(searchLower) ||
        q.studentId?.email?.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: queries,
      stats: {
        total: queries.length,
        open: queries.filter((q) => q.status === 'open').length,
        inProgress: queries.filter((q) => q.status === 'in_progress').length,
        resolved: queries.filter((q) => q.status === 'resolved').length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/queries/:id
 * @desc    Get single query thread
 * @access  Private
 */
export const getQueryById = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id)
      .populate('studentId', 'name email profilePicture rollNumber department')
      .populate('responses.senderId', 'name role profilePicture');

    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found.' });
    }

    if (req.user.role === 'student' && query.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this query thread.'
      });
    }

    res.json({
      success: true,
      data: query
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/queries
 * @desc    Create a new student query
 * @access  Private (Student Only)
 */
export const createQuery = async (req, res) => {
  try {
    const { subject, message, priority, relatedCourse } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required.'
      });
    }

    const query = await Query.create({
      studentId: req.user._id,
      subject: subject.trim(),
      message: message.trim(),
      priority: priority || 'medium',
      relatedCourse: relatedCourse || '',
      status: 'open'
    });

    const populated = await Query.findById(query._id)
      .populate('studentId', 'name email profilePicture rollNumber');

    res.status(201).json({
      success: true,
      message: 'Query submitted successfully. The teacher will respond shortly.',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/queries/:id/reply
 * @desc    Reply to a query thread (Admin or Query Owner)
 * @access  Private
 */
export const replyToQuery = async (req, res) => {
  try {
    const { message, status } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message cannot be empty.' });
    }

    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found.' });
    }

    if (req.user.role === 'student' && query.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot reply to another student’s query.'
      });
    }

    const senderName = req.user.role === 'admin' ? 'Teacher / Instructor' : req.user.name;

    query.responses.push({
      senderId: req.user._id,
      senderRole: req.user.role,
      senderName,
      message: message.trim(),
      createdAt: new Date()
    });

    if (status && ['open', 'in_progress', 'resolved'].includes(status)) {
      query.status = status;
    } else if (req.user.role === 'admin' && query.status === 'open') {
      query.status = 'in_progress';
    }

    await query.save();

    const populated = await Query.findById(query._id)
      .populate('studentId', 'name email profilePicture rollNumber')
      .populate('responses.senderId', 'name role profilePicture');

    res.json({
      success: true,
      message: 'Response posted successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/queries/:id/status
 * @desc    Update query status (Admin Only)
 * @access  Private (Admin Only)
 */
export const updateQueryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['open', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found.' });
    }

    query.status = status;
    await query.save();

    res.json({
      success: true,
      message: `Query marked as ${status.replace('_', ' ')}`,
      data: query
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
