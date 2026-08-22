import { Note } from '../models/Note.js';
import { Group } from '../models/Group.js';
import { User } from '../models/User.js';

/**
 * @route   GET /api/notes
 * @desc    Get notes (Admin: all or filtered by group; Student: only enrolled groups)
 * @access  Private
 */
export const getAllNotes = async (req, res) => {
  try {
    const { groupId, search, isAnnouncement } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      const student = await User.findById(req.user._id);
      const studentGroups = student.enrolledGroups || [];
      
      if (groupId) {
        if (!studentGroups.some((g) => g.toString() === groupId)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You are not a member of this group.'
          });
        }
        query.groupId = groupId;
      } else {
        query.groupId = { $in: studentGroups };
      }
    } else {
      if (groupId) query.groupId = groupId;
    }

    if (isAnnouncement !== undefined) {
      query.isAnnouncement = isAnnouncement === 'true';
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    const notes = await Note.find(query)
      .populate('groupId', 'groupName color')
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: notes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/notes
 * @desc    Upload / create note or announcement (Admin Only)
 * @access  Private (Admin Only)
 */
export const createNote = async (req, res) => {
  try {
    const { title, description, groupId, fileType, externalLink, isAnnouncement } = req.body;

    if (!title || !groupId) {
      return res.status(400).json({
        success: false,
        message: 'Title and Target Group are required.'
      });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Target Group not found.' });
    }

    let fileUrl = '';
    let fileName = '';
    let resolvedFileType = fileType || 'document';

    if (req.file) {
      fileUrl = `/uploads/notes/${req.file.filename}`;
      fileName = req.file.originalname;
      const ext = req.file.originalname.split('.').pop().toLowerCase();
      if (['pdf'].includes(ext)) resolvedFileType = 'pdf';
      else if (['doc', 'docx'].includes(ext)) resolvedFileType = 'doc';
      else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) resolvedFileType = 'image';
      else resolvedFileType = 'document';
    } else if (externalLink) {
      fileUrl = externalLink.trim();
      fileName = title;
      resolvedFileType = 'link';
    }

    const note = await Note.create({
      title: title.trim(),
      description: description || '',
      groupId,
      fileUrl,
      fileName,
      fileType: resolvedFileType,
      externalLink: externalLink || '',
      isAnnouncement: isAnnouncement === 'true' || isAnnouncement === true,
      uploadedBy: req.user._id
    });

    const populated = await Note.findById(note._id)
      .populate('groupId', 'groupName color')
      .populate('uploadedBy', 'name');

    res.status(201).json({
      success: true,
      message: note.isAnnouncement ? 'Announcement posted successfully' : 'Note uploaded successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/notes/:id
 * @desc    Update note (Admin Only)
 * @access  Private (Admin Only)
 */
export const updateNote = async (req, res) => {
  try {
    const { title, description, groupId, externalLink, isAnnouncement } = req.body;

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    if (title) note.title = title.trim();
    if (description !== undefined) note.description = description;
    if (groupId) note.groupId = groupId;
    if (externalLink !== undefined) note.externalLink = externalLink;
    if (isAnnouncement !== undefined) note.isAnnouncement = isAnnouncement === 'true' || isAnnouncement === true;

    if (req.file) {
      note.fileUrl = `/uploads/notes/${req.file.filename}`;
      note.fileName = req.file.originalname;
    }

    await note.save();

    const populated = await Note.findById(note._id)
      .populate('groupId', 'groupName color')
      .populate('uploadedBy', 'name');

    res.json({
      success: true,
      message: 'Note updated successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete note (Admin Only)
 * @access  Private (Admin Only)
 */
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Note deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
