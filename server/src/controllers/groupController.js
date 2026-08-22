import { Group } from '../models/Group.js';
import { User } from '../models/User.js';
import { Note } from '../models/Note.js';
import { Assignment } from '../models/Assignment.js';

/**
 * @route   GET /api/groups
 * @desc    Get all groups (Admin gets all, Student gets only enrolled groups)
 * @access  Private
 */
export const getAllGroups = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.members = req.user._id;
    }

    const groups = await Group.find(query)
      .populate('members', 'name email profilePicture rollNumber')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // Fetch notes count and assignments count for each group
    const groupSummaries = await Promise.all(
      groups.map(async (group) => {
        const [notesCount, assignmentsCount] = await Promise.all([
          Note.countDocuments({ groupId: group._id }),
          Assignment.countDocuments({ assignedGroup: group._id })
        ]);
        return {
          ...group.toObject(),
          notesCount,
          assignmentsCount
        };
      })
    );

    res.json({
      success: true,
      data: groupSummaries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/groups/:id
 * @desc    Get group by ID with members list & notes
 * @access  Private
 */
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email profilePicture rollNumber department')
      .populate('createdBy', 'name');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    // If student, check enrollment
    if (
      req.user.role === 'student' &&
      !group.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not enrolled in this group.'
      });
    }

    const [notes, assignments] = await Promise.all([
      Note.find({ groupId: group._id }).sort({ createdAt: -1 }),
      Assignment.find({ assignedGroup: group._id }).sort({ dueDate: 1 })
    ]);

    res.json({
      success: true,
      data: {
        ...group.toObject(),
        notes,
        assignments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/groups
 * @desc    Create a new student group
 * @access  Private (Admin Only)
 */
export const createGroup = async (req, res) => {
  try {
    const { groupName, description, memberIds, color } = req.body;

    if (!groupName) {
      return res.status(400).json({ success: false, message: 'Group name is required.' });
    }

    const group = await Group.create({
      groupName: groupName.trim(),
      description: description || '',
      color: color || '#4F46E5',
      createdBy: req.user._id,
      members: memberIds || []
    });

    // Update students' enrolledGroups
    if (memberIds && memberIds.length > 0) {
      await User.updateMany(
        { _id: { $in: memberIds } },
        { $addToSet: { enrolledGroups: group._id } }
      );
    }

    const populatedGroup = await Group.findById(group._id).populate('members', 'name email profilePicture rollNumber');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: populatedGroup
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/groups/:id
 * @desc    Update group details
 * @access  Private (Admin Only)
 */
export const updateGroup = async (req, res) => {
  try {
    const { groupName, description, color } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    if (groupName) group.groupName = groupName.trim();
    if (description !== undefined) group.description = description;
    if (color) group.color = color;

    await group.save();

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: group
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/groups/:id
 * @desc    Delete group and remove group references
 * @access  Private (Admin Only)
 */
export const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    // Clean up student references
    await User.updateMany(
      { enrolledGroups: groupId },
      { $pull: { enrolledGroups: groupId } }
    );

    // Delete associated notes
    await Note.deleteMany({ groupId });

    await Group.findByIdAndDelete(groupId);

    res.json({
      success: true,
      message: 'Group and associated notes removed successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/groups/:id/members
 * @desc    Add students to a group
 * @access  Private (Admin Only)
 */
export const addStudentsToGroup = async (req, res) => {
  try {
    const { studentIds } = req.body; // Array of student IDs or single ID
    const groupId = req.params.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    const idsToAdd = Array.isArray(studentIds) ? studentIds : [studentIds];

    // Add to group.members
    await Group.findByIdAndUpdate(groupId, {
      $addToSet: { members: { $each: idsToAdd } }
    });

    // Add to users.enrolledGroups
    await User.updateMany(
      { _id: { $in: idsToAdd } },
      { $addToSet: { enrolledGroups: groupId } }
    );

    const updatedGroup = await Group.findById(groupId).populate('members', 'name email profilePicture rollNumber');

    res.json({
      success: true,
      message: `Added ${idsToAdd.length} student(s) to ${group.groupName}`,
      data: updatedGroup
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/groups/:id/members/:studentId
 * @desc    Remove a student from a group
 * @access  Private (Admin Only)
 */
export const removeStudentFromGroup = async (req, res) => {
  try {
    const { id: groupId, studentId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    // Pull from group
    await Group.findByIdAndUpdate(groupId, {
      $pull: { members: studentId }
    });

    // Pull from student
    await User.findByIdAndUpdate(studentId, {
      $pull: { enrolledGroups: groupId }
    });

    const updatedGroup = await Group.findById(groupId).populate('members', 'name email profilePicture rollNumber');

    res.json({
      success: true,
      message: 'Student removed from group.',
      data: updatedGroup
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
